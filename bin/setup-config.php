<?php
/**
 * EduRise Global — write app/config/config.php by answering a few questions.
 *
 *     php bin/setup-config.php
 *
 * It starts from config.example.php, tests the database login before saving,
 * makes a new app_key (or keeps the current one), and keeps a copy of the old
 * config.php as config.php.bak. Run from SSH / cPanel Terminal only.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$root    = dirname(__DIR__);
$file    = "$root/app/config/config.php";
$example = "$root/app/config/config.example.php";
$old     = is_file($file) ? (require $file) : [];
if (($old['db']['pass'] ?? 'change-me') === 'change-me') {
    $old = [];   // still the untouched example: do not offer its local values
}

function ask(string $q, string $default = '', bool $hidden = false): string
{
    echo $q . ($default !== '' && !$hidden ? " [$default]" : '') . ': ';
    if ($hidden && DIRECTORY_SEPARATOR === '/') {
        shell_exec('stty -echo 2>/dev/null');
    }
    $a = trim((string) fgets(STDIN));
    if ($hidden && DIRECTORY_SEPARATOR === '/') {
        shell_exec('stty echo 2>/dev/null');
        echo PHP_EOL;
    }
    return $a === '' ? $default : $a;
}

echo "EduRise Global — config setup (Enter keeps the value in [brackets])\n\n";

$env = ask('Environment: live / staging / local', $old['env'] ?? 'live');
if (!in_array($env, ['live', 'staging', 'local'], true)) {
    exit("Environment must be live, staging or local.\n");
}
$base = rtrim(ask('Website address', $old['base_url'] ?? 'https://www.eduriseglobal.bd'), '/');
if (!preg_match('#^https?://[A-Za-z0-9.-]+(:\d+)?$#', $base)) {
    exit("The website address must look like https://www.eduriseglobal.bd\n");
}

$oldDb  = $old['db'] ?? [];
$dbName = ask('Database name', ($oldDb['name'] ?? '') !== 'edurise_local' ? ($oldDb['name'] ?? '') : '');
$dbUser = ask('Database user', ($oldDb['user'] ?? '') !== 'edurise_user' ? ($oldDb['user'] ?? '') : '');
$dbPass = ask('Database password (hidden)', '', true);
if ($dbPass === '' && ($oldDb['pass'] ?? 'change-me') !== 'change-me') {
    $dbPass = $oldDb['pass'];
}
if ($dbName === '' || $dbUser === '' || $dbPass === '') {
    exit("Database name, user and password are required.\n");
}

// test the login before writing anything
try {
    new PDO("mysql:host=localhost;port=3306;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    echo "Database login OK.\n";
} catch (PDOException $e) {
    exit('Database login failed: ' . $e->getMessage() . "\nNothing was changed. Check the name, user and password in cPanel → MySQL Databases.\n");
}

$key = $old['security']['app_key'] ?? 'change-me';
if ($key === 'change-me' || strlen($key) < 32) {
    $key = bin2hex(random_bytes(32));
}
$public = $env === 'live' ? ask('Web root folder (public_html)', $old['public_dir'] ?? dirname($root) . '/public_html') : '';

$q = static fn (string $v) => var_export($v, true);
$s = (string) file_get_contents($example);
$set = static function (string $s, string $key, string $value, int $limit = 1): string {
    return (string) preg_replace("/'" . preg_quote($key, '/') . "'(\s*)=>\s*[^,\n]+,/", "'$key'\$1=> " . str_replace(['\\', '$'], ['\\\\', '\\$'], $value) . ',', $s, $limit);
};
$s = $set($s, 'env', $q($env));
$s = $set($s, 'debug', $env === 'local' ? 'true' : 'false');
$s = $set($s, 'base_url', $q($base));
$s = $set($s, 'name', $q($dbName));
$s = $set($s, 'user', $q($dbUser));     // the first 'user' is the database one
$s = $set($s, 'pass', $q($dbPass));
$s = $set($s, 'app_key', $q($key));
foreach (['transport', 'from_email', 'smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_pass', 'lead_to'] as $m) {
    if (isset($old['mail'][$m])) {     // keep mail settings made earlier
        $s = $set($s, $m, is_int($old['mail'][$m]) ? (string) $old['mail'][$m] : $q((string) $old['mail'][$m]));
    }
}
if (!empty($old['access']['user']) && $env === 'staging') {
    $s = str_replace("'user'          => '',", "'user'          => " . $q($old['access']['user']) . ',', $s);
    $s = str_replace("'password_hash' => '',", "'password_hash' => " . $q($old['access']['password_hash']) . ',', $s);
}
if ($public !== '') {
    $s = preg_replace("#// 'public_dir' => '[^']*',#", "'public_dir' => " . str_replace('$', '\\$', $q(rtrim($public, '/'))) . ',', $s, 1);
}

if (is_file($file)) {
    copy($file, "$file.bak");
}
@mkdir(dirname($file), 0755, true);
file_put_contents($file, $s);
@chmod($file, 0640);

$check = require $file;
echo "\nSaved app/config/config.php\n";
printf("  env       %s\n  base_url  %s\n  database  %s (user %s)\n  app_key   set (%d characters)\n  web root  %s\n",
    $check['env'], $check['base_url'], $check['db']['name'], $check['db']['user'], strlen($check['security']['app_key']), $check['public_dir'] ?? '(beside app/)');
echo "\nNext: php bin/import-data.php, then php bin/create-admin.php\n";
