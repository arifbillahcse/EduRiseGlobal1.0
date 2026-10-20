<?php
/**
 * Small global helpers used by views and controllers.
 */

declare(strict_types=1);

/** Escape text for HTML output (body text and attribute values). */
function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/**
 * JSON that is safe inside an inline <script>: <, >, &, ' and " are written
 * as \u escapes, so a value can never close the script tag.
 */
function json_for_script(mixed $value): string
{
    return json_encode(
        $value,
        JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
    );
}

/** Site URL path prefix from base_url, e.g. '' for a domain root, '/edurise' for a sub-folder. */
function base_path(): string
{
    $path = (string) parse_url((string) App\Core\Config::get('base_url', ''), PHP_URL_PATH);
    return rtrim($path, '/');
}

/** Path to a file in public_html with a content-hash version, e.g. asset('css/panel.css') -> /css/panel.css?v=1a2b3c4d */
function asset(string $relPath): string
{
    static $seen = [];
    if (!isset($seen[$relPath])) {
        $file = PUBLIC_DIR . '/' . $relPath;
        $seen[$relPath] = is_file($file) ? substr((string) md5_file($file), 0, 8) : '0';
    }
    return base_path() . '/' . $relPath . '?v=' . $seen[$relPath];
}

/** Absolute URL for a site path, e.g. url('about.html'). */
function url(string $path = ''): string
{
    return rtrim((string) App\Core\Config::get('base_url', ''), '/') . '/' . ltrim($path, '/');
}
