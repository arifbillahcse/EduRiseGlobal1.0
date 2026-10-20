<?php
/**
 * EduRise Global — restore a backup made by bin/backup.php.
 *     php bin/restore.php storage/backups/edurise-20261020-023000-db.sql.gz
 *     php bin/restore.php <db file> --uploads=storage/backups/edurise-20261020-023000-uploads.zip
 * It REPLACES every table in the configured database. A fresh backup of the
 * current state is made first, so the restore itself can be undone.
 * Test it on staging before you ever need it on live.
 */

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
require dirname(__DIR__) . '/app/bootstrap.php';

use App\Core\Backup;
use App\Core\Config;

// options may come before or after the file name (getopt would stop at the file name)
$args = array_values(array_filter(array_slice($argv, 1), static fn ($a) => !str_starts_with($a, '--')));
$opts = [];
foreach (array_slice($argv, 1) as $a) {
    if (str_starts_with($a, '--uploads=')) {
        $opts['uploads'] = substr($a, 10);
    } elseif ($a === '--yes') {
        $opts['yes'] = true;
    }
}
if (isset($opts['uploads']) && !is_file($opts['uploads'])) {
    exit("Uploads backup not found: {$opts['uploads']}\n");
}
$db = $args[0] ?? '';
if ($db === '' || !is_file($db)) {
    exit("Usage: php bin/restore.php <backup-db.sql.gz> [--uploads=<backup-uploads.zip>]\nBackups: " . implode(', ', array_map('basename', glob(Backup::DIR . '/*') ?: [])) . "\n");
}
// check the chosen files before anything changes
try {
    Backup::checkDatabaseFile($db);
} catch (RuntimeException $e) {
    exit($e->getMessage() . " Nothing was changed.\n");
}
$name = (string) Config::get('db.name');
echo "This replaces ALL content of the database '$name' (" . Config::get('env') . ") with\n  " . basename($db) . "\n";
if (isset($opts['uploads'])) {
    echo "and puts back the images from\n  " . basename($opts['uploads']) . "\n";
}
if (!isset($opts['yes'])) {
    echo "Type the database name to continue: ";
    if (trim((string) fgets(STDIN)) !== $name) {
        exit("Cancelled. Nothing was changed.\n");
    }
}
$safety = Backup::make('before-restore');
echo "Current state saved first: " . basename($safety['db']) . "\n";
$n = Backup::restoreDatabase($db);
echo "Database restored ($n statements).\n";
if (isset($opts['uploads'])) {
    echo 'Images restored: ' . Backup::restoreUploads($opts['uploads']) . "\n";
}
echo "Done. Open the website and the admin to check.\n";
