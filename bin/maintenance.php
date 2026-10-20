<?php
/**
 * EduRise Global — daily housekeeping (cron, after backup.php):
 *  - logs over 5 MB are rotated (php-error.log -> php-error.log.1.gz …), 5 old copies kept
 *  - session files older than 12 hours are removed
 *  - old sign-in attempts (30 days), used or expired reset links (7 days)
 *    and sent emails (90 days) are deleted
 * Leads and content are never touched.
 */

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
require dirname(__DIR__) . '/app/bootstrap.php';

use App\Core\Database;

const MAX_LOG_BYTES = 5 * 1024 * 1024;
const KEEP_LOGS = 5;
$out = [];

// 1. log rotation
foreach (glob(APP_ROOT . '/storage/logs/*.log') ?: [] as $log) {
    clearstatcache(true, $log);
    if (filesize($log) < MAX_LOG_BYTES) {
        continue;
    }
    @unlink($log . '.' . KEEP_LOGS . '.gz');
    for ($i = KEEP_LOGS - 1; $i >= 1; $i--) {
        if (is_file("$log.$i.gz")) {
            rename("$log.$i.gz", "$log." . ($i + 1) . '.gz');
        }
    }
    $in = fopen($log, 'rb');
    $gz = gzopen("$log.1.gz", 'wb6');
    while (!feof($in)) {
        gzwrite($gz, (string) fread($in, 1 << 20));
    }
    fclose($in);
    gzclose($gz);
    file_put_contents($log, '');                                   // same file, so PHP keeps writing to it
    $out[] = 'rotated ' . basename($log);
}

// 2. old session files
$n = 0;
foreach (glob(APP_ROOT . '/storage/sessions/sess_*') ?: [] as $f) {
    if (filemtime($f) < time() - 12 * 3600 && @unlink($f)) {
        $n++;
    }
}
$out[] = "$n old session(s) removed";

// 3. old rows
$out[] = Database::run('DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 30 DAY)')->rowCount() . ' old sign-in attempt(s)';
$out[] = Database::run('DELETE FROM password_resets WHERE (used_at IS NOT NULL OR expires_at < NOW()) AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)')->rowCount() . ' old reset link(s)';
$out[] = Database::run("DELETE FROM mail_queue WHERE status = 'sent' AND updated_at < DATE_SUB(NOW(), INTERVAL 90 DAY)")->rowCount() . ' old sent email(s)';

$summary = date('Y-m-d H:i:s') . ' maintenance: ' . implode(', ', $out);
file_put_contents(APP_ROOT . '/storage/cache/maintenance.ok', $summary . "\n");
echo $summary . "\n";
