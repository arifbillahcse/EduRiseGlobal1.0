<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Admin session. Only started for /admin pages; the cookie is limited to the
 * /admin path, is HttpOnly, SameSite=Strict, and Secure on HTTPS.
 *
 *  - idle timeout (default 30 min) and absolute lifetime (12 h)
 *  - a new session ID after login and on privilege changes (regenerate())
 *  - bound to the browser's user agent: a stolen cookie used elsewhere is dropped
 *  - files stored in storage/sessions, outside the web root
 */
final class Session
{
    private const IDLE_SECONDS = 30 * 60;
    private const MAX_SECONDS  = 12 * 60 * 60;

    private static bool $started = false;

    public static function start(): void
    {
        if (self::$started) {
            return;
        }
        $dir = APP_ROOT . '/storage/sessions';
        if (is_dir($dir) && is_writable($dir)) {
            session_save_path($dir);
        }
        ini_set('session.use_strict_mode', '1');      // never accept an ID the server did not create
        ini_set('session.use_only_cookies', '1');
        ini_set('session.use_trans_sid', '0');
        ini_set('session.sid_length', '48');
        ini_set('session.sid_bits_per_character', '6');
        ini_set('session.gc_maxlifetime', (string) self::MAX_SECONDS);

        session_name((string) Config::get('security.session_name', 'edurise_sid'));
        session_set_cookie_params([
            'lifetime' => 0,                           // until the browser closes
            'path'     => base_path() . '/admin',
            'secure'   => self::isHttps(),
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
        session_start();
        self::$started = true;

        $now = time();
        $ua  = hash('sha256', (string) ($_SERVER['HTTP_USER_AGENT'] ?? ''));
        $expired = isset($_SESSION['_last']) && (
            $now - $_SESSION['_last'] > self::IDLE_SECONDS ||
            $now - ($_SESSION['_born'] ?? $now) > self::MAX_SECONDS ||
            ($_SESSION['_ua'] ?? $ua) !== $ua
        );
        if ($expired) {
            $wasLoggedIn = isset($_SESSION['user_id']);
            self::destroy();
            self::start();
            if ($wasLoggedIn) {
                self::flash('info', 'You were signed out after 30 minutes without activity. Please sign in again.');
            }
            return;
        }
        $_SESSION['_born'] ??= $now;
        $_SESSION['_ua']   = $ua;
        $_SESSION['_last'] = $now;
    }

    /** New session ID, same data. Call after login and after a role or password change. */
    public static function regenerate(): void
    {
        session_regenerate_id(true);
        $_SESSION['_born'] = time();
    }

    /** Remove the session completely: data, server file and browser cookie. */
    public static function destroy(): void
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            return;
        }
        $_SESSION = [];
        $p = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 3600, 'path' => $p['path'], 'secure' => $p['secure'],
            'httponly' => true, 'samesite' => 'Strict',
        ]);
        session_destroy();
        self::$started = false;
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return $_SESSION[$key] ?? $default;
    }

    public static function set(string $key, mixed $value): void
    {
        $_SESSION[$key] = $value;
    }

    public static function forget(string $key): void
    {
        unset($_SESSION[$key]);
    }

    /** One-time message for the next page: type = success | error | info */
    public static function flash(string $type, string $message): void
    {
        $_SESSION['_flash'][] = ['type' => $type, 'message' => $message];
    }

    /** @return array<int, array{type:string,message:string}> */
    public static function takeFlash(): array
    {
        $f = $_SESSION['_flash'] ?? [];
        unset($_SESSION['_flash']);
        return $f;
    }

    public static function isHttps(): bool
    {
        return ($_SERVER['HTTPS'] ?? '') === 'on'
            || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https'
            || (int) ($_SERVER['SERVER_PORT'] ?? 0) === 443;
    }
}
