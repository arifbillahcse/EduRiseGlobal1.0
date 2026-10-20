<?php
/**
 * EduRise Global — server environment check (Phase 0).
 *
 * Run from SSH / cPanel Terminal, never through the browser:
 *     php bin/env-check.php
 *
 * It checks the PHP version, extensions, important ini settings, folder
 * permissions and (if app/config/config.php exists) the database connection
 * and charset. It changes nothing on the server.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$root    = dirname(__DIR__);
$results = [];

function check(array &$results, string $label, bool $ok, string $detail = '', bool $warnOnly = false): void
{
    $results[] = [$ok ? 'OK' : ($warnOnly ? 'WARN' : 'FAIL'), $label, $detail];
}

// 1. PHP version
check($results, 'PHP 8.3 or newer', version_compare(PHP_VERSION, '8.3.0', '>='), 'found ' . PHP_VERSION);

// 2. Extensions
foreach (['pdo_mysql', 'mbstring', 'intl', 'fileinfo', 'openssl', 'curl', 'json'] as $ext) {
    check($results, "extension: $ext", extension_loaded($ext));
}
check($results, 'extension: gd or imagick', extension_loaded('gd') || extension_loaded('imagick'));

// 3. ini settings
$toBytes = static function (string $v): int {
    $v = trim($v);
    $n = (int) $v;
    return match (strtolower(substr($v, -1))) {
        'g' => $n * 1024 ** 3,
        'm' => $n * 1024 ** 2,
        'k' => $n * 1024,
        default => $n,
    };
};
check($results, 'upload_max_filesize >= 8M', $toBytes((string) ini_get('upload_max_filesize')) >= 8 * 1024 ** 2, (string) ini_get('upload_max_filesize'), true);
check($results, 'post_max_size >= 8M', $toBytes((string) ini_get('post_max_size')) >= 8 * 1024 ** 2, (string) ini_get('post_max_size'), true);
check($results, 'file_uploads enabled', (bool) ini_get('file_uploads'));

// 4. Folders the app writes to
foreach (['storage/logs', 'storage/cache', 'storage/backups', 'storage/sessions'] as $dir) {
    $path = "$root/$dir";
    check($results, "writable: $dir", is_dir($path) && is_writable($path));
}

// 5. Config + database
$configFile = "$root/app/config/config.php";
if (!is_file($configFile)) {
    check($results, 'app/config/config.php exists', false, 'copy config.example.php and fill it in', true);
} else {
    $config = require $configFile;
    $env    = $config['env'] ?? '?';
    check($results, 'debug is off on live', !($env === 'live' && !empty($config['debug'])), "env=$env");
    check($results, 'display_errors off on live', !($env === 'live' && ini_get('display_errors')), "display_errors=" . var_export(ini_get('display_errors'), true));
    check($results, 'app_key changed', ($config['security']['app_key'] ?? 'change-me') !== 'change-me');

    $db = $config['db'];
    try {
        $pdo = new PDO(
            "mysql:host={$db['host']};port={$db['port']};dbname={$db['name']};charset=utf8mb4",
            $db['user'],
            $db['pass'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        $version = (string) $pdo->query('SELECT VERSION()')->fetchColumn();
        $isMaria = stripos($version, 'mariadb') !== false;
        $numeric = preg_replace('/[^0-9.].*$/', '', $version);
        $okVer   = $isMaria ? version_compare($numeric, '10.6', '>=') : version_compare($numeric, '8.0', '>=');
        check($results, 'database connection', true, $db['name']);
        check($results, 'MySQL 8+ / MariaDB 10.6+', $okVer, $version);

        $stmt = $pdo->prepare('SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?');
        $stmt->execute([$db['name']]);
        [$charset, $collation] = $stmt->fetch(PDO::FETCH_NUM) ?: ['?', '?'];
        check($results, 'database charset utf8mb4', $charset === 'utf8mb4', "$charset / $collation");

        $tables = (int) $pdo->query('SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()')->fetchColumn();
        check($results, 'schema imported (18 tables)', $tables >= 18, "$tables tables found", true);
    } catch (PDOException $e) {
        check($results, 'database connection', false, $e->getMessage());
    }
}

// 6. Email: transport, inbox for leads, and the sending domain's DNS (SPF, DKIM, DMARC)
if (isset($config)) {
    $transport = $config['mail']['transport'] ?? 'log';
    check($results, 'mail.transport sends real email', $transport !== 'log' || ($config['env'] ?? '') === 'local', "transport=$transport", true);
    $leadTo = (string) ($config['mail']['lead_to'] ?? '');
    check($results, 'mail.lead_to set (inbox for leads)', filter_var($leadTo, FILTER_VALIDATE_EMAIL) && !str_starts_with(strtolower($leadTo), 'tbc@'),
        $leadTo !== '' ? $leadTo : 'not set: the email in Settings is used', true);
    $domain = substr(strrchr((string) ($config['mail']['from_email'] ?? ''), '@') ?: '@', 1);
    if ($domain !== '' && function_exists('dns_get_record')) {
        $txt = static function (string $name): array {
            $r = @dns_get_record($name, DNS_TXT);
            return is_array($r) ? array_map(static fn ($x) => implode('', (array) ($x['entries'] ?? [$x['txt'] ?? ''])), $r) : [];
        };
        $has = static fn (array $records, string $start) => (bool) array_filter($records, static fn ($t) => stripos($t, $start) === 0);
        check($results, "SPF record for $domain", $has($txt($domain), 'v=spf1'), 'TXT v=spf1 … (cPanel → Email Deliverability)', true);
        check($results, "DKIM record for $domain", $has($txt("default._domainkey.$domain"), 'v=DKIM1'), 'TXT default._domainkey (cPanel → Email Deliverability)', true);
        check($results, "DMARC record for $domain", $has($txt("_dmarc.$domain"), 'v=DMARC1'), 'TXT _dmarc: v=DMARC1; p=quarantine; rua=mailto:…', true);
    }
}
if (is_dir("$root/storage/cache") && !is_writable("$root/storage/cache")) {
    check($results, 'send-mail lock file can be written', false, 'storage/cache must be writable for the cron job');
}

// 7. Launch readiness
if (isset($config)) {
    $env = $config['env'] ?? '?';
    $live = $env === 'live';
    $base = (string) ($config['base_url'] ?? '');
    check($results, 'base_url uses https', !$live || str_starts_with($base, 'https://'), $base, !$live);
    $public = rtrim((string) ($config['public_dir'] ?? "$root/public_html"), '/');
    check($results, 'web root found (public_dir)', is_file("$public/index.php"), $public);
    check($results, 'storage/ is outside the web root', !str_starts_with(realpath("$root/storage") ?: "$root/storage", (realpath($public) ?: $public) . '/'));
    $hasPw = !empty($config['access']['user']) && !empty($config['access']['password_hash']);
    if ($env === 'staging') {
        check($results, 'staging is password-protected (access)', $hasPw, 'config.php → access; make the hash with bin/hash-password.php');
    } elseif ($live) {
        check($results, 'live site has no site password', !$hasPw, 'remove config.php → access on live', true);
    }
    if (isset($pdo)) {
        try {
            $users = $pdo->query('SELECT email, role, is_active FROM admin_users')->fetchAll(PDO::FETCH_ASSOC);
            $test = array_filter($users, static fn ($u) => preg_match('/@(test\.local|example\.(com|org|net))$|^(test|demo|admin)@/i', $u['email']));
            check($results, 'no test or demo admin accounts', !$test, $test ? implode(', ', array_column($test, 'email')) : count($users) . ' account(s)', !$live);
            $admins = count(array_filter($users, static fn ($u) => $u['role'] === 'admin' && $u['is_active']));
            check($results, 'at least one active Admin', $admins > 0, $admins ? "$admins active" : 'create one: php bin/create-admin.php');
            // the site's database user should only reach its own database
            $grants = $pdo->query('SHOW GRANTS FOR CURRENT_USER()')->fetchAll(PDO::FETCH_COLUMN);
            $wide = array_filter($grants, static fn ($g) => preg_match('/ON \*\.\* /', $g) && !preg_match('/^GRANT USAGE ON/i', $g));
            $dbName = $config['db']['name'];
            $other = array_filter($grants, static fn ($g) => preg_match('/ON `([^`]+)`\./', $g, $m) && str_replace('\\_', '_', $m[1]) !== $dbName);
            check($results, 'database user limited to its own database', !$wide && !$other, $wide || $other ? 'grants: ' . implode(' | ', array_map(static fn ($g) => substr($g, 0, 60), array_merge($wide, $other))) : "only $dbName", !$live);
        } catch (PDOException $e) {
            check($results, 'launch checks on the database', false, $e->getMessage(), true);
        }
    }
    // the cron jobs leave a stamp each time they run
    $age = static fn (string $f) => is_file("$root/storage/cache/$f") ? time() - filemtime("$root/storage/cache/$f") : null;
    foreach (['send-mail.ok' => [15 * 60, 'send-mail cron ran in the last 15 minutes'], 'backup.ok' => [26 * 3600, 'backup cron ran in the last 26 hours'],
              'maintenance.ok' => [26 * 3600, 'maintenance cron ran in the last 26 hours']] as $f => [$max, $label]) {
        $a = $age($f);
        check($results, $label, $a !== null && $a <= $max, $a === null ? 'never ran: add the cron job' : 'last run ' . round($a / 60) . ' min ago', !$live);
    }
    $latest = glob("$root/storage/backups/edurise-*-db.sql.gz") ?: [];
    rsort($latest);
    check($results, 'a database backup exists', $latest && filesize($latest[0]) > 1000, $latest ? basename($latest[0]) : 'none yet: php bin/backup.php', !$live);
}

// Report
$fails = 0;
foreach ($results as [$status, $label, $detail]) {
    if ($status === 'FAIL') {
        $fails++;
    }
    printf("[%-4s] %-32s %s\n", $status, $label, $detail);
}
echo PHP_EOL . ($fails === 0 ? 'All required checks passed.' : "$fails required check(s) failed.") . PHP_EOL;
exit($fails === 0 ? 0 : 1);
