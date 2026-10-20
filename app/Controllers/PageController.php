<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Config;
use App\Core\Response;
use App\Core\View;
use App\Models\ContentRepository;
use App\Models\Seo;

final class PageController
{
    /** Pages only served outside live (internal tools). */
    private const NOT_ON_LIVE = ['styleguide'];
    /** Templates that are not pages of their own. */
    private const NOT_ROUTABLE = ['404'];

    public static function home(): void
    {
        $data = ContentRepository::forPages();
        $site = isset($data['site']) ? json_decode(json_encode($data['site']), true) : null;   // stored as a JSON object
        View::page('index', $data, 200, ['path' => '', 'jsonld' => [Seo::organization($site)]]);
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
        // the old one-template pages (destination.html#korea) forward to clean addresses in the browser
        $meta = in_array($page, ['destination', 'program'], true) ? ['robots' => 'noindex, follow'] : ['path' => $page . '.html'];
        View::page($page, ContentRepository::forPages(), 200, $meta);
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

    /** /study-in-cyprus: one country guide at its own address */
    public static function studyIn(string $slug): void
    {
        $meta = Seo::destination($slug);
        if ($meta === null) {
            self::notFound();
            return;
        }
        View::page('destination', ContentRepository::forPages(), 200, $meta);
    }

    /** /program-gachon-mba: one program at its own address */
    public static function program(string $slug): void
    {
        $meta = Seo::program($slug);
        if ($meta === null) {
            self::notFound();
            return;
        }
        View::page('program', ContentRepository::forPages(), 200, $meta);
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

}
