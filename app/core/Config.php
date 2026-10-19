<?php

declare(strict_types=1);

namespace App\Core;

/** Read-only access to app/config/config.php, with dotted keys: Config::get('db.host'). */
final class Config
{
    private static array $items = [];

    public static function load(array $items): void
    {
        self::$items = $items;
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        $value = self::$items;
        foreach (explode('.', $key) as $part) {
            if (!is_array($value) || !array_key_exists($part, $value)) {
                return $default;
            }
            $value = $value[$part];
        }
        return $value;
    }

    public static function isLive(): bool
    {
        return self::get('env') === 'live';
    }
}
