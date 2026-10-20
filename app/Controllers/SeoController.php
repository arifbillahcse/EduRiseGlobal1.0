<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Config;
use App\Models\Seo;

/** sitemap.xml and robots.txt, written from the database and the server's environment. */
final class SeoController
{
    /** Every public page, country and program that is shown on the website. */
    public static function sitemap(): void
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        foreach (Seo::sitemap() as [$path, $lastmod]) {
            $xml .= '  <url><loc>' . htmlspecialchars(url($path), ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</loc>'
                  . ($lastmod ? "<lastmod>$lastmod</lastmod>" : '') . "</url>\n";
        }
        $xml .= "</urlset>\n";
        header('Content-Type: application/xml; charset=utf-8');
        header('Cache-Control: max-age=3600');
        echo $xml;
    }

    /** Live: everything except the admin and internal pages. Staging and local: nothing. */
    public static function robots(): void
    {
        header('Content-Type: text/plain; charset=utf-8');
        header('Cache-Control: max-age=3600');
        if (!Config::isLive()) {
            echo "# " . Config::get('env') . " server: not for search engines\nUser-agent: *\nDisallow: /\n";
            return;
        }
        echo "User-agent: *\nDisallow: /admin\nDisallow: /styleguide.html\nDisallow: /checklist.html\n\nSitemap: " . url('sitemap.xml') . "\n";
    }
}
