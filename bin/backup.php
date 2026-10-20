<?php
/**
 * EduRise Global — daily backup of the database and uploaded images.
 * cPanel → Cron Jobs, once a day (e.g. 02:30):
 *     php $HOME/edurise/bin/backup.php && php $HOME/edurise/bin/maintenance.php
 * Files go to storage/backups (outside the web root); the newest 14 of each are kept.
 *     php bin/backup.php --keep=30
 * Keep a copy off the server too: download one a week, or use cPanel's own backups (JetBackup).
 */

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
require dirname(__DIR__) . '/app/bootstrap.php';

use App\Core\Backup;

$keep = (int) (getopt('', ['keep:'])['keep'] ?? 14);
$lock = fopen(APP_ROOT . '/storage/cache/backup.lock', 'c');
if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) {
    exit("Another backup is still running.\n");
}
$t = microtime(true);
$files = Backup::make();
$removed = Backup::prune($keep);
$size = static fn ($f) => number_format(filesize($f) / 1024, 0) . ' KB';
$summary = sprintf("%s backup done in %.1fs: %s (%s), %s (%s)%s", date('Y-m-d H:i:s'), microtime(true) - $t,
    basename($files['db']), $size($files['db']), basename($files['uploads']), $size($files['uploads']),
    $removed ? '; removed ' . count($removed) . ' old file(s)' : '');
file_put_contents(APP_ROOT . '/storage/cache/backup.ok', $summary . "\n");   // checked by env-check
echo $summary . "\n";
flock($lock, LOCK_UN);
