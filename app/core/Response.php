<?php

declare(strict_types=1);

namespace App\Core;

final class Response
{
    /** Security headers sent with every PHP response (.htaccess adds them for static files). */
    public static function securityHeaders(): void
    {
        header('X-Frame-Options: SAMEORIGIN');
        header('X-Content-Type-Options: nosniff');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()');
        if (Config::isLive() && (($_SERVER['HTTPS'] ?? '') === 'on' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')) {
            header('Strict-Transport-Security: max-age=31536000');
        }
        header_remove('X-Powered-By');
        // staging and local copies must never appear in search results
        if (!Config::isLive()) {
            header('X-Robots-Tag: noindex, nofollow');
        }
    }

    public static function html(string $html, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: text/html; charset=utf-8');
        // pages carry live database content: browsers must re-check them
        header('Cache-Control: no-cache');
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'HEAD') {
            echo $html;
        }
    }

    public static function redirect(string $to, int $status = 301): void
    {
        http_response_code($status);
        header('Location: ' . $to);
    }
}
