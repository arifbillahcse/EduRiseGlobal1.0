<?php

declare(strict_types=1);

namespace App\Core;

use RuntimeException;
use ZipArchive;

/**
 * Database and uploads backups in storage/backups (outside the web root),
 * written with PHP alone so they work on any cPanel account.
 *   edurise-YYYYMMDD-HHMMSS-db.sql.gz       every table: structure and rows, utf8mb4
 *   edurise-YYYYMMDD-HHMMSS-uploads.zip     public_html/uploads/
 */
final class Backup
{
    public const DIR = APP_ROOT . '/storage/backups';

    /** Makes both files and returns their paths. $label (e.g. before-restore) is added to the names. Never overwrites a file. */
    public static function make(string $label = ''): array
    {
        if (!is_dir(self::DIR) && !mkdir(self::DIR, 0750, true)) {
            throw new RuntimeException('storage/backups cannot be created');
        }
        $base = 'edurise-' . date('Ymd-His') . ($label !== '' ? '-' . preg_replace('/[^a-z0-9-]/', '', $label) : '');
        for ($i = 1, $name = $base; is_file(self::DIR . "/$name-db.sql.gz") || is_file(self::DIR . "/$name-uploads.zip"); $i++) {
            $name = "$base-$i";
        }
        $db = self::DIR . "/$name-db.sql.gz";
        $up = self::DIR . "/$name-uploads.zip";
        self::dumpDatabase($db);
        self::zipUploads($up);
        return ['db' => $db, 'uploads' => $up];
    }

    /** Removes all but the newest $keep backups of each kind. */
    public static function prune(int $keep): array
    {
        $removed = [];
        foreach (['-db.sql.gz', '-uploads.zip'] as $kind) {
            $files = glob(self::DIR . "/edurise-*$kind") ?: [];
            rsort($files);                                   // names sort by date
            foreach (array_slice($files, max(1, $keep)) as $f) {
                if (unlink($f)) {
                    $removed[] = basename($f);
                }
            }
        }
        return $removed;
    }

    private static function dumpDatabase(string $file): void
    {
        $pdo = Database::pdo();
        $gz = gzopen($file . '.part', 'wb6');
        if (!$gz) {
            throw new RuntimeException("Cannot write $file");
        }
        $w = static function (string $s) use ($gz): void {
            if (gzwrite($gz, $s) === false) {
                throw new RuntimeException('Writing the backup failed (disk full?)');
            }
        };
        $w("-- EduRise Global database backup\n-- " . date('Y-m-d H:i:s') . ' (Dhaka time), database ' . Config::get('db.name') . "\n"
          . "SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS = 0;\nSET UNIQUE_CHECKS = 0;\nSET time_zone = '+06:00';\n\n");
        $tables = $pdo->query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'")->fetchAll(\PDO::FETCH_COLUMN);
        foreach ($tables as $t) {
            $q = '`' . str_replace('`', '``', $t) . '`';
            $create = $pdo->query("SHOW CREATE TABLE $q")->fetch(\PDO::FETCH_NUM)[1];
            $w("DROP TABLE IF EXISTS $q;\n$create;\n");
            $cols = null;
            $batch = [];
            // unbuffered, so a large table does not fill the memory
            $pdo->setAttribute(\PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, false);
            $stmt = $pdo->query("SELECT * FROM $q");
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $cols ??= '(' . implode(', ', array_map(static fn ($c) => '`' . str_replace('`', '``', $c) . '`', array_keys($row))) . ')';
                $batch[] = '(' . implode(', ', array_map(static fn ($v) => $v === null ? 'NULL' : $pdo->quote((string) $v), $row)) . ')';
                if (count($batch) === 100) {
                    $w("INSERT INTO $q $cols VALUES " . implode(', ', $batch) . ";\n");
                    $batch = [];
                }
            }
            $stmt->closeCursor();
            $pdo->setAttribute(\PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, true);
            if ($batch) {
                $w("INSERT INTO $q $cols VALUES " . implode(', ', $batch) . ";\n");
            }
            $w("\n");
        }
        $w("SET FOREIGN_KEY_CHECKS = 1;\nSET UNIQUE_CHECKS = 1;\n-- end of backup\n");
        gzclose($gz);
        rename($file . '.part', $file);
    }

    private static function zipUploads(string $file): void
    {
        $src = PUBLIC_DIR . '/uploads';
        $zip = new ZipArchive();
        if ($zip->open($file . '.part', ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException("Cannot write $file");
        }
        $zip->addFromString('README.txt', "Contents of public_html/uploads/ on " . date('Y-m-d H:i') . "\n");
        if (is_dir($src)) {
            $it = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($src, \FilesystemIterator::SKIP_DOTS));
            foreach ($it as $f) {
                if ($f->isFile() && preg_match('/\.(jpe?g|png|webp)$/i', $f->getFilename())) {
                    $zip->addFile($f->getPathname(), 'uploads/' . str_replace('\\', '/', substr($f->getPathname(), strlen($src) + 1)));
                }
            }
        }
        $zip->close();
        rename($file . '.part', $file);
    }

    /**
     * Runs a backup made by dumpDatabase() against the configured database.
     * Statements end with ";" at the end of a line; values never contain a raw line break.
     */
    /** Checks that a file is a complete EduRise database backup (first and last line). */
    public static function checkDatabaseFile(string $file): void
    {
        $gz = @gzopen($file, 'rb');
        if (!$gz) {
            throw new RuntimeException("Cannot read $file");
        }
        $head = (string) gzgets($gz, 200);
        $last = '';
        while (($l = gzgets($gz, 1 << 20)) !== false) {
            if (trim($l) !== '') {
                $last = $l;
            }
        }
        gzclose($gz);
        if (!str_starts_with($head, '-- EduRise Global database backup')) {
            throw new RuntimeException('This is not an EduRise database backup.');
        }
        if (trim($last) !== '-- end of backup') {
            throw new RuntimeException('This backup is incomplete (the backup was cut off). Choose another one.');
        }
    }

    public static function restoreDatabase(string $file): int
    {
        self::checkDatabaseFile($file);
        $gz = gzopen($file, 'rb');
        gzgets($gz, 200);
        $pdo = Database::pdo();
        $sql = '';
        $n = 0;
        $line = '';
        while (($chunk = gzgets($gz, 1 << 20)) !== false) {
            $line .= $chunk;
            if (!str_ends_with($chunk, "\n") && !gzeof($gz)) {
                continue;                                    // a long line arrives in pieces: wait for its end
            }
            if ($sql === '' && (str_starts_with($line, '--') || trim($line) === '')) {
                $line = '';
                continue;
            }
            $sql .= $line;
            if (str_ends_with(rtrim($line, "\r\n"), ';')) {
                $pdo->exec($sql);
                $sql = '';
                $n++;
            }
            $line = '';
        }
        gzclose($gz);
        if (trim($sql) !== '') {
            throw new RuntimeException('The backup file ends in the middle of a statement (incomplete file?).');
        }
        return $n;
    }

    /** Puts the images from an uploads backup back into public_html/uploads (adds and replaces, never deletes). */
    public static function restoreUploads(string $file): int
    {
        $zip = new ZipArchive();
        if ($zip->open($file) !== true) {
            throw new RuntimeException("Cannot read $file");
        }
        $n = 0;
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = (string) $zip->getNameIndex($i);
            // only images under uploads/, never a path that climbs out
            if (!preg_match('#^uploads/[A-Za-z0-9/_.-]+\.(jpe?g|png|webp)$#i', $name) || str_contains($name, '..')) {
                continue;
            }
            $target = PUBLIC_DIR . '/' . $name;
            if (!is_dir(dirname($target))) {
                mkdir(dirname($target), 0755, true);
            }
            file_put_contents($target, $zip->getFromIndex($i));
            $n++;
        }
        $zip->close();
        return $n;
    }
}
