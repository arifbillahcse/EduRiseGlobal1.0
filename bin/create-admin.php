<?php
/**
 * EduRise Global — create an admin account from the server's Terminal.
 * There is deliberately no web setup page: nothing to forget to delete.
 *
 *     php bin/create-admin.php
 *     php bin/create-admin.php --name="Arif" --email=arif@example.com --role=admin
 *
 * The password is typed in the terminal (hidden) and stored only as a hash.
 */

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require dirname(__DIR__) . '/app/bootstrap.php';

use App\Models\AdminUser;

$opts = getopt('', ['name:', 'email:', 'role:']);

$ask = static function (string $label, bool $hidden = false): string {
    echo $label;
    $tty = $hidden && stream_isatty(STDIN);
    if ($tty) {
        shell_exec('stty -echo');
    }
    $v = trim((string) fgets(STDIN));
    if ($tty) {
        shell_exec('stty echo');
        echo PHP_EOL;
    }
    return $v;
};

$name  = $opts['name']  ?? $ask('Name: ');
$email = AdminUser::normaliseEmail($opts['email'] ?? $ask('Email: '));
$role  = $opts['role']  ?? 'admin';

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    exit("A name and a valid email are required.\n");
}
if (!isset(AdminUser::ROLES[$role])) {
    exit("Role must be admin or editor.\n");
}
if (AdminUser::findByEmail($email)) {
    exit("An account with that email already exists. To reset its password use 'Forgot password' on the sign-in page.\n");
}

$password = $ask('Password (at least ' . AdminUser::MIN_PASSWORD . ' characters): ', true);
$confirm  = $ask('Type it again: ', true);
if ($problems = AdminUser::passwordProblems($password, $confirm, $email)) {
    exit(implode("\n", $problems) . "\n");
}

$id = AdminUser::create($name, $email, $role, $password);
echo "Created " . AdminUser::ROLES[$role] . " account #$id for $email. Sign in at " . url('admin') . "\n";
