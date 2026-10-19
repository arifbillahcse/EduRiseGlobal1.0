<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Config;
use App\Core\Response;
use App\Core\View;
use App\Models\ContentRepository;

final class PageController
{
    /** Pages only served outside live (internal tools). */
    private const NOT_ON_LIVE = ['styleguide'];
    /** Templates that are not pages of their own. */
    private const NOT_ROUTABLE = ['404'];

    public static function home(): void
    {
        View::page('index', ContentRepository::forPages());
    }

    /** /about.html */
    public static function show(string $page): void
    {
        if (!self::routable($page)) {
            self::notFound();
            return;
        }
        if ($page === 'index') {
            self::home();
            return;
        }
        View::page($page, ContentRepository::forPages());
    }

    /** /about -> /about.html (one address per page) */
    public static function withoutExtension(string $page): void
    {
        if (!self::routable($page)) {
            self::notFound();
            return;
        }
        $qs = $_SERVER['QUERY_STRING'] ?? '';
        Response::redirect(base_path() . '/' . ($page === 'index' ? '' : $page . '.html') . ($qs !== '' ? '?' . $qs : ''));
    }

    /** /study-in-cyprus: the country guide, without needing #cyprus in the address */
    public static function studyIn(string $slug): void
    {
        $data = ContentRepository::forPages();
        $slugs = array_column($data['destinations'] ?? self::builtInDestinations(), 'id');
        if (!in_array($slug, $slugs, true)) {
            self::notFound();
            return;
        }
        // the page script reads the country from the #hash; set it before any script runs
        $head = '<script>if(!location.hash)history.replaceState(null,"",location.pathname+location.search+"#"+' . json_for_script($slug) . ');</script>';
        View::page('destination', $data, 200, $head);
    }

    public static function notFound(): void
    {
        View::page('404', ContentRepository::forPages(), 404);
    }

    private static function routable(string $page): bool
    {
        if (!View::exists($page) || in_array($page, self::NOT_ROUTABLE, true)) {
            return false;
        }
        return !(Config::isLive() && in_array($page, self::NOT_ON_LIVE, true));
    }

    /** destination ids when the database is unavailable (matches js/data.js) */
    private static function builtInDestinations(): array
    {
        $seed = APP_ROOT . '/database/seed/content.json';
        if (!is_file($seed)) {
            return [];
        }
        $json = json_decode((string) file_get_contents($seed), true);
        return $json['DESTINATIONS'] ?? [];
    }
}
