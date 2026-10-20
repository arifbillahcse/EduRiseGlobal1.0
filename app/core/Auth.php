<?php

declare(strict_types=1);

namespace App\Core;

use App\Models\AdminUser;

/**
 * Admin sign-in, sign-out, role checks and password-reset links.
 *
 *  - 5 failed sign-ins for one email (or 20 from one IP) within 15 minutes
 *    lock sign-in for 15 minutes, even with the right password
 *  - the same "wrong email or password" message whether or not the account exists
 *  - the session is re-checked against the database on every request, so a
 *    deactivated account, a role change or a password reset takes effect at once
 */
final class Auth
{
    public const MAX_FAILS = 5;                       // per email
    public const MAX_FAILS_PER_IP = 20;               // per IP: staff share one office connection
    public const LOCK_MINUTES = 15;
    public const RESET_MINUTES = 60;
    public const INVITE_HOURS = 48;

    private static ?array $user = null;
    private static bool $resolved = false;

    /** Signed-in user (fresh from the database) or null. */
    public static function user(): ?array
    {
        if (self::$resolved) {
            return self::$user;
        }
        self::$resolved = true;
        $id = Session::get('user_id');
        if (!is_int($id)) {
            return null;
        }
        $u = AdminUser::find($id);
        // password changed, account turned off, or role changed since sign-in: sign out
        if (!$u || !$u['is_active'] || (string) $u['password_changed_at'] !== Session::get('pw_stamp')) {
            Session::destroy();
            Session::start();
            Session::flash('info', 'Please sign in again.');
            return null;
        }
        if ($u['role'] !== Session::get('role')) {
            Session::regenerate();                    // privileges changed: new session ID
            Session::set('role', $u['role']);
        }
        return self::$user = $u;
    }

    public static function isAdmin(): bool
    {
        return (self::user()['role'] ?? null) === 'admin';
    }

    /** Result of a sign-in attempt: 'ok', 'locked' or 'invalid'. */
    public static function attempt(string $email, string $password): string
    {
        $email = AdminUser::normaliseEmail($email);
        $ip = self::ipHash();

        if (self::locked($email, $ip)) {
            self::logAttempt($email, $ip, false);     // keeps the lock going while someone keeps trying
            return 'locked';
        }

        $u = $email !== '' ? AdminUser::findByEmail($email) : null;
        // same work whether or not the account exists, so timing reveals nothing
        $hash = $u['password_hash'] ?? AdminUser::hash(bin2hex(random_bytes(8)));
        $ok = password_verify($password, $hash) && $u && $u['is_active'];

        self::logAttempt($email, $ip, $ok);
        if (!$ok) {
            return self::locked($email, $ip) ? 'locked' : 'invalid';
        }

        AdminUser::rehashIfNeeded($u, $password);
        AdminUser::touchLogin((int) $u['id']);
        Database::run('DELETE FROM login_attempts WHERE email = ? AND success = 0', [$email]);

        Session::regenerate();                        // new session ID after sign-in
        Session::set('user_id', (int) $u['id']);
        Session::set('role', $u['role']);
        Session::set('pw_stamp', (string) AdminUser::find((int) $u['id'])['password_changed_at']);
        Session::forget('_csrf');                     // fresh CSRF token too
        self::$resolved = false;
        return 'ok';
    }

    public static function logout(): void
    {
        Session::destroy();
        self::$user = null;
        self::$resolved = true;
    }

    /* ---------- password reset / invite links ---------- */

    /** Creates a single-use link token; returns the raw token (only its hash is stored). */
    public static function createResetToken(int $userId, bool $invite = false): string
    {
        $token = bin2hex(random_bytes(32));
        Database::run('UPDATE password_resets SET used_at = NOW() WHERE admin_user_id = ? AND used_at IS NULL', [$userId]);
        Database::run(
            'INSERT INTO password_resets (admin_user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))',
            [$userId, hash('sha256', $token), $invite ? self::INVITE_HOURS * 60 : self::RESET_MINUTES]
        );
        return $token;
    }

    /** The reset row for a token if it is unused and not expired. */
    public static function findResetToken(string $token): ?array
    {
        if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
            return null;
        }
        $rows = Database::all(
            'SELECT r.*, u.email, u.is_active FROM password_resets r JOIN admin_users u ON u.id = r.admin_user_id
             WHERE r.token_hash = ? AND r.used_at IS NULL AND r.expires_at > NOW()',
            [hash('sha256', $token)]
        );
        $r = $rows[0] ?? null;
        return ($r && $r['is_active']) ? $r : null;
    }

    public static function useResetToken(int $resetId): void
    {
        Database::run('UPDATE password_resets SET used_at = NOW() WHERE id = ?', [$resetId]);
    }

    /* ---------- rate limiting for other forms (forgot password) ---------- */

    /** true if this IP already did `$key` $max times in the last $minutes. Keys start with # (e.g. '#forgot'). */
    public static function tooMany(string $key, int $max, int $minutes): bool
    {
        $key = '#' . ltrim($key, '#');
        $ip = self::ipHash();
        $n = (int) Database::value(
            'SELECT COUNT(*) FROM login_attempts WHERE email = ? AND ip_hash = ? AND attempted_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)',
            [$key, $ip, $minutes]
        );
        self::logAttempt($key, $ip, false);
        return $n >= $max;
    }

    /* ---------- helpers ---------- */

    private static function locked(string $email, string $ip): bool
    {
        $row = Database::run(
            'SELECT SUM(email = ?) AS by_email, SUM(ip_hash = ?) AS by_ip FROM login_attempts
             WHERE success = 0 AND email NOT LIKE ? AND attempted_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)',
            [$email, $ip, '#%', self::LOCK_MINUTES]
        )->fetch();
        return (int) $row['by_email'] >= self::MAX_FAILS || (int) $row['by_ip'] >= self::MAX_FAILS_PER_IP;
    }

    private static function logAttempt(string $email, string $ip, bool $success): void
    {
        Database::run('INSERT INTO login_attempts (email, ip_hash, success) VALUES (?, ?, ?)', [mb_substr($email, 0, 190), $ip, $success ? 1 : 0]);
        // keep the table small: drop records older than 30 days now and then
        if (random_int(1, 50) === 1) {
            Database::run('DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 30 DAY)');
        }
    }

    /** IP address hashed with the app key: enough to count attempts, never stored in plain form. */
    public static function ipHash(): string
    {
        return hash_hmac('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? ''), (string) Config::get('security.app_key', ''));
    }
}
