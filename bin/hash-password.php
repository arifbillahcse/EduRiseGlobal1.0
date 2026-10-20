<?php
/**
 * Makes the password hash for config.php → access.password_hash (staging password).
 *     php bin/hash-password.php
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
echo 'Staging password (at least 10 characters): ';
$tty = stream_isatty(STDIN);
if ($tty) {
    shell_exec('stty -echo');
}
$p = trim((string) fgets(STDIN));
if ($tty) {
    shell_exec('stty echo');
    echo PHP_EOL;
}
if (mb_strlen($p) < 10) {
    exit("Too short.\n");
}
echo "Put this in config.php → access → password_hash:\n" . password_hash($p, PASSWORD_DEFAULT) . "\n";
