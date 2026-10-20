<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

/** admin_users table. Passwords are only ever stored as password_hash() output. */
final class AdminUser
{
    public const ROLES = ['admin' => 'Admin', 'editor' => 'Editor'];
    public const MIN_PASSWORD = 10;

    public static function find(int $id): ?array
    {
        $rows = Database::all('SELECT * FROM admin_users WHERE id = ?', [$id]);
        return $rows[0] ?? null;
    }

    public static function findByEmail(string $email): ?array
    {
        $rows = Database::all('SELECT * FROM admin_users WHERE email = ?', [self::normaliseEmail($email)]);
        return $rows[0] ?? null;
    }

    public static function findByUsername(string $username): ?array
    {
        $rows = Database::all('SELECT * FROM admin_users WHERE username = ?', [self::normaliseUsername($username)]);
        return $rows[0] ?? null;
    }

    /** The account for what was typed in the sign-in box: a username, or an email. */
    public static function findByLogin(string $login): ?array
    {
        $login = trim($login);
        if ($login === '') {
            return null;
        }
        return str_contains($login, '@') ? self::findByEmail($login) : self::findByUsername($login);
    }

    public static function normaliseUsername(string $username): string
    {
        return mb_strtolower(trim($username));
    }

    /** 3–40 characters: a-z, 0-9, dot, dash, underscore; starts with a letter or number. */
    public static function validUsername(string $username): bool
    {
        return (bool) preg_match('/^[a-z0-9][a-z0-9._-]{2,39}$/', $username);
    }

    public static function all(): array
    {
        return Database::all('SELECT id, name, username, email, role, is_active, last_login_at, created_at FROM admin_users ORDER BY is_active DESC, role, name');
    }

    public static function create(string $name, string $email, string $role, ?string $password = null, ?string $username = null): int
    {
        // without a password the account gets a random one nobody knows; the person sets theirs from an emailed link
        $hash = self::hash($password ?? bin2hex(random_bytes(32)));
        Database::run(
            'INSERT INTO admin_users (name, username, email, password_hash, role, password_changed_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [trim($name), $username !== null && $username !== '' ? self::normaliseUsername($username) : null, self::normaliseEmail($email), $hash, $role]
        );
        return (int) Database::pdo()->lastInsertId();
    }

    public static function update(int $id, string $name, string $role, bool $active, ?string $username = null): void
    {
        Database::run('UPDATE admin_users SET name = ?, username = ?, role = ?, is_active = ? WHERE id = ?',
            [trim($name), $username !== null && $username !== '' ? self::normaliseUsername($username) : null, $role, $active ? 1 : 0, $id]);
    }

    /** Sets a new password and signs the person out everywhere else. */
    public static function setPassword(int $id, string $password): void
    {
        Database::run('UPDATE admin_users SET password_hash = ?, password_changed_at = NOW() WHERE id = ?', [self::hash($password), $id]);
    }

    public static function rehashIfNeeded(array $user, string $password): void
    {
        if (password_needs_rehash($user['password_hash'], self::algo())) {
            Database::run('UPDATE admin_users SET password_hash = ? WHERE id = ?', [self::hash($password), $user['id']]);
        }
    }

    public static function touchLogin(int $id): void
    {
        Database::run('UPDATE admin_users SET last_login_at = NOW() WHERE id = ?', [$id]);
    }

    public static function activeAdminCount(): int
    {
        return (int) Database::value("SELECT COUNT(*) FROM admin_users WHERE role = 'admin' AND is_active = 1");
    }

    /** Problems with a new password, or [] if it is fine. */
    public static function passwordProblems(string $password, string $confirm, string $email = ''): array
    {
        $p = [];
        if (mb_strlen($password) < self::MIN_PASSWORD) {
            $p[] = 'Use at least ' . self::MIN_PASSWORD . ' characters.';
        }
        if ($password !== $confirm) {
            $p[] = 'The two passwords do not match.';
        }
        if ($email !== '' && stripos($password, strtok($email, '@')) !== false) {
            $p[] = 'Do not use your email name in the password.';
        }
        if (in_array(strtolower($password), ['password123', '1234567890', 'qwertyuiop', 'eduriseglobal', 'edurise123', 'admin12345'], true)) {
            $p[] = 'That password is too easy to guess.';
        }
        return $p;
    }

    public static function normaliseEmail(string $email): string
    {
        return mb_strtolower(trim($email));
    }

    public static function hash(string $password): string
    {
        return password_hash($password, self::algo());
    }

    private static function algo(): string|int
    {
        return defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
    }
}
