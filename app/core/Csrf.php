<?php

declare(strict_types=1);

namespace App\Core;

/**
 * CSRF protection: one random token per session, sent in every admin form as
 * a hidden _csrf field and checked on every POST.
 */
final class Csrf
{
    public static function token(): string
    {
        $t = Session::get('_csrf');
        if (!is_string($t) || strlen($t) !== 64) {
            $t = bin2hex(random_bytes(32));
            Session::set('_csrf', $t);
        }
        return $t;
    }

    /** Hidden input for a form. */
    public static function field(): string
    {
        return '<input type="hidden" name="_csrf" value="' . self::token() . '">';
    }

    public static function valid(): bool
    {
        $sent = $_POST['_csrf'] ?? '';
        $mine = Session::get('_csrf');
        return is_string($sent) && is_string($mine) && $mine !== '' && hash_equals($mine, $sent);
    }
}
