<?php

declare(strict_types=1);

namespace App\Core;

use Throwable;

/**
 * Errors go to storage/logs/php-error.log. Visitors see a plain error page;
 * file paths and messages are shown only when debug is on (local only).
 */
final class ErrorHandler
{
    private static bool $debug = false;

    public static function register(bool $debug, string $logFile): void
    {
        self::$debug = $debug;

        error_reporting(E_ALL);
        ini_set('display_errors', $debug ? '1' : '0');
        ini_set('display_startup_errors', $debug ? '1' : '0');
        ini_set('log_errors', '1');
        if (is_dir(dirname($logFile)) && is_writable(dirname($logFile))) {
            ini_set('error_log', $logFile);
        }

        // warnings and notices become exceptions, so nothing fails silently
        set_error_handler(static function (int $level, string $message, string $file, int $line): bool {
            if (!(error_reporting() & $level)) {
                return false;
            }
            throw new \ErrorException($message, 0, $level, $file, $line);
        });

        set_exception_handler([self::class, 'handle']);
    }

    public static function handle(Throwable $e): void
    {
        error_log(sprintf('%s: %s in %s:%d', $e::class, $e->getMessage(), $e->getFile(), $e->getLine()));

        if (PHP_SAPI === 'cli') {
            fwrite(STDERR, (self::$debug ? (string) $e : $e->getMessage()) . PHP_EOL);
            exit(1);
        }

        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: text/html; charset=utf-8');
            header('Cache-Control: no-store');
        }
        if (self::$debug) {
            echo '<pre style="white-space:pre-wrap">' . e((string) $e) . '</pre>';
            return;
        }
        echo '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
           . '<title>Something went wrong | EduRise Global</title>'
           . '<div style="font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1rem;color:#0E1F3C">'
           . '<h1 style="font-size:1.5rem">Something went wrong</h1>'
           . '<p>Please try again in a minute. If it keeps happening, call or WhatsApp us.</p>'
           . '<p><a href="' . e(base_path() . '/') . '">Back to the homepage</a></p></div>';
    }
}
