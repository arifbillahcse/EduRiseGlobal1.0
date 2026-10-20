<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Password for a whole site that is not public yet (staging). Set in
 * config.php → access; empty user = open (live). Lives in PHP rather than in
 * cPanel's Directory Privacy, so a deploy that replaces .htaccess cannot
 * silently open the site. Images, CSS and JS are served without it.
 */
final class Access
{
    public static function guard(): bool
    {
        $user = (string) Config::get('access.user', '');
        if ($user === '') {
            return true;
        }
        [$u, $p] = self::credentials();
        if ($u !== null && hash_equals($user, $u) && password_verify((string) $p, (string) Config::get('access.password_hash', ''))) {
            return true;
        }
        if ($u !== null && Auth::tooMany('site-password', 20, 15)) {     // slows down guessing
            http_response_code(429);
            exit('Too many wrong passwords. Try again in 15 minutes.');
        }
        http_response_code(401);
        header('WWW-Authenticate: Basic realm="EduRise staging", charset="UTF-8"');
        header('X-Robots-Tag: noindex, nofollow');
        header('Content-Type: text/plain; charset=utf-8');
        echo "This is the EduRise test site. Ask Arif for the password.\n";
        return false;
    }

    /** [user, password] from the browser, or [null, null]. */
    private static function credentials(): array
    {
        if (isset($_SERVER['PHP_AUTH_USER'])) {
            return [(string) $_SERVER['PHP_AUTH_USER'], (string) ($_SERVER['PHP_AUTH_PW'] ?? '')];
        }
        // PHP-FPM / CGI on cPanel: passed through by .htaccess
        $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/^Basic\s+([A-Za-z0-9+\/=]+)$/i', (string) $h, $m)) {
            $pair = (string) base64_decode($m[1], true);
            if (str_contains($pair, ':')) {
                return explode(':', $pair, 2);
            }
        }
        return [null, null];
    }
}
