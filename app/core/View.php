<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Renders the site's existing page templates (app/Views/pages/*.html) so they
 * look exactly as before, with three server-side changes:
 *   1. the database content is inlined as window.EDURISE_DB before js/data.js,
 *   2. css/, js/ and assets/ links become absolute, so pages also work on
 *      clean URLs such as /study-in-cyprus,
 *   3. the canonical and og:url links point at this site's own base_url,
 *   4. per-page search details (title, description, canonical, share image,
 *      structured data) when the page shows one country or program.
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
     * @param array|null $data  content for window.EDURISE_DB (null = use the built-in data.js content)
     * @param array      $meta  title, description, path (canonical, relative to the site), image (absolute),
     *                          jsonld (list of objects), route (what the page shows, for the page script)
     */
    public static function page(string $page, ?array $data, int $status = 200, array $meta = []): void
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

        $html = self::applyMeta($html, $meta);

        Response::html($html, $status);
    }

    /** Writes the page's search and share details into the template's head. */
    private static function applyMeta(string $html, array $meta): string
    {
        $attr = static fn (string $s) => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $set = static function (string $html, string $pattern, string $replacement): string {
            return (string) preg_replace($pattern, str_replace(['\\', '$'], ['\\\\', '\\$'], $replacement), $html, 1);
        };
        if (isset($meta['title'])) {
            $t = $attr($meta['title']);
            $html = $set($html, '#<title>[^<]*</title>#', "<title>$t</title>");
            $html = $set($html, '#<meta property="og:title" content="[^"]*">#', "<meta property=\"og:title\" content=\"$t\">");
        }
        if (isset($meta['description'])) {
            $d = $attr($meta['description']);
            $html = $set($html, '#<meta name="description" content="[^"]*">#', "<meta name=\"description\" content=\"$d\">");
            $html = $set($html, '#<meta property="og:description" content="[^"]*">#', "<meta property=\"og:description\" content=\"$d\">");
        }
        if (isset($meta['path'])) {
            $u = $attr(url($meta['path']));
            $html = $set($html, '#<link rel="canonical" href="[^"]*">#', "<link rel=\"canonical\" href=\"$u\">");
            $html = $set($html, '#<meta property="og:url" content="[^"]*">#', "<meta property=\"og:url\" content=\"$u\">");
        }
        if (isset($meta['image'])) {
            $i = $attr($meta['image']);
            $html = $set($html, '#<meta property="og:image" content="[^"]*">#', "<meta property=\"og:image\" content=\"$i\">");
            // the size tags describe the default share image only
            if (!str_ends_with($meta['image'], 'og-image.png')) {
                $html = (string) preg_replace('#\s*<meta property="og:image:(width|height)" content="\d+">#', '', $html);
            }
        }
        $head = '';
        if (isset($meta['robots'])) {
            $head .= '<meta name="robots" content="' . $attr($meta['robots']) . "\">\n";
        }
        foreach ($meta['jsonld'] ?? [] as $ld) {
            $head .= '<script type="application/ld+json">' . json_for_script($ld) . "</script>\n";
        }
        if (isset($meta['route'])) {
            // read by the page script instead of the old #hash
            $head .= '<script>window.EDURISE_ROUTE=' . json_for_script($meta['route']) . ";</script>\n";
        }
        return $head === '' ? $html : str_replace('</head>', $head . '</head>', $html);
    }

}
