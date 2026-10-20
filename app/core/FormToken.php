<?php

declare(strict_types=1);

namespace App\Core;

/**
 * A signed "this page was made at <time>" stamp for the public forms. The
 * server puts it in every page; a form sent without a valid stamp is refused.
 * Bots that post straight to /enquiry have none, a page sent back within two
 * seconds was not filled in by a person, and an old page must be reloaded.
 * Public pages set no cookie, so this works without a session.
 */
final class FormToken
{
    public const MIN_SECONDS = 2;
    public const MAX_SECONDS = 2 * 24 * 3600;

    public static function make(?int $time = null): string
    {
        $t = (string) ($time ?? time());
        return $t . '.' . substr(hash_hmac('sha256', 'form|' . $t, self::key()), 0, 32);
    }

    /** Seconds since the page was made, or null if the stamp is missing or forged. */
    public static function age(string $token): ?int
    {
        if (!preg_match('/^(\d{9,11})\.([a-f0-9]{32})$/', $token, $m)) {
            return null;
        }
        $expected = substr(hash_hmac('sha256', 'form|' . $m[1], self::key()), 0, 32);
        return hash_equals($expected, $m[2]) ? time() - (int) $m[1] : null;
    }

    private static function key(): string
    {
        return (string) Config::get('security.app_key', '') . '|forms';
    }
}
