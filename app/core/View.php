<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Renders the site's existing page templates (app/Views/pages/*.html) so they
 * look exactly as before, with three server-side changes:
 *   1. the database content is inlined as window.EDURISE_DB before js/data.js,
 *   2. css/, js/ and assets/ links become absolute, so pages also work on
 *      clean URLs such as /study-in-cyprus,
 *   3. the canonical and og:url links point at this site's own base_url.
 */
final class View
{
    private const PAGES_DIR = APP_DIR . '/Views/pages/';
    private const DEMO_DOMAIN = 'https://www.eduriseglobal.com';

    public static function exists(string $page): bool
    {
        return (bool) preg_match('/^[a-z0-9-]+$/', $page) && is_file(self::PAGES_DIR . $page . '.html');
    }

    /**
     * @param array|null $data    content for window.EDURISE_DB (null = use the built-in data.js content)
     * @param string     $head    extra trusted HTML for the end of <head>
     */
    public static function page(string $page, ?array $data, int $status = 200, string $head = ''): void
    {
        $html = (string) file_get_contents(self::PAGES_DIR . $page . '.html');
        $base = base_path();

        // 2. absolute asset links
        $html = preg_replace('#\b(href|src)="(css|js|assets)/#', '$1="' . $base . '/$2/', $html);

        // cache-busting: ?v= is the file's own content hash, so a changed file is never served stale
        $html = preg_replace_callback('#="' . preg_quote($base, '#') . '/((?:css|js)/[\w.-]+)\?v=[0-9a-f]+"#', static function (array $m): string {
            return '="' . asset($m[1]) . '"';
        }, $html);

        // 3. canonical / og:url / og:image on this site's own domain
        $html = str_replace(self::DEMO_DOMAIN, rtrim((string) Config::get('base_url'), '/'), $html);

        // 1. database content before data.js
        if ($data !== null) {
            $inline = '<script>window.EDURISE_DB=' . json_for_script($data) . ';</script>' . "\n";
            $html = preg_replace('#(<script src="[^"]*js/data\.js[^"]*"></script>)#', $inline . '$1', $html, 1);
        }

        if ($head !== '') {
            $html = str_replace('</head>', $head . "\n</head>", $html);
        }

        Response::html($html, $status);
    }

}
