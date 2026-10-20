<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use Throwable;

/**
 * Search and share details for pages built from content: title, description,
 * canonical address, share image and structured data (JSON-LD).
 * Staff can override title and description per country and program; otherwise
 * they are written from the content itself.
 */
final class Seo
{
    public const SITE = 'EduRise Global';

    /** Visible country by address name, with what the page head needs. Null if missing or hidden. */
    public static function destination(string $slug): ?array
    {
        $row = self::row('SELECT slug, name, intro, levels, photo_src, seo_title, seo_description, updated_at FROM destinations WHERE slug = ? AND is_visible = 1', [$slug]);
        if ($row === false) {                                   // database down: the built-in content
            $d = self::seedItem('DESTINATIONS', $slug);
            $p = self::seed()['DEST_PHOTOS'][$slug] ?? [];
            $row = $d ? ['slug' => $slug, 'name' => $d['name'], 'intro' => $d['intro'] ?? '', 'levels' => json_encode($d['levels'] ?? []), 'photo_src' => $p['src'] ?? null] : null;
        }
        if (!$row) {
            return null;
        }
        $levels = implode(', ', (array) json_decode((string) ($row['levels'] ?? '[]'), true));
        return [
            'title'       => self::clean($row['seo_title'] ?? '') ?: "Study in {$row['name']} from Bangladesh | " . self::SITE,
            'description' => self::clip(self::clean($row['seo_description'] ?? '') ?: trim(self::clean((string) $row['intro']) . ($levels ? " Levels: $levels." : ''))),
            'path'        => 'study-in-' . $row['slug'],
            'image'       => self::imageUrl($row['photo_src'] ?? null),
            'route'       => ['id' => $row['slug']],
            'jsonld'      => [self::breadcrumb([['Home', ''], ['Destinations', 'destinations.html'], ["Study in {$row['name']}", 'study-in-' . $row['slug']]])],
        ];
    }

    /** Visible program (of a visible country) by address name. */
    public static function program(string $slug): ?array
    {
        $row = self::row(
            'SELECT p.slug, p.title, p.university, p.city, p.duration, p.language, p.english, p.highlights, p.seo_title, p.seo_description,
                    d.name AS country, d.photo_src
             FROM programs p JOIN destinations d ON d.id = p.destination_id
             WHERE p.slug = ? AND p.is_visible = 1 AND d.is_visible = 1', [$slug]);
        if ($row === false) {
            $p = self::seedItem('PROGRAMS', $slug);
            $d = $p ? self::seedItem('DESTINATIONS', $p['dest']) : null;
            $row = $p ? ['slug' => $slug, 'title' => $p['title'], 'university' => $p['university'], 'city' => $p['city'] ?? '', 'duration' => $p['duration'] ?? '',
                'language' => $p['language'] ?? '', 'english' => json_encode($p['english'] ?? null), 'highlights' => json_encode($p['highlights'] ?? []),
                'country' => $d['name'] ?? '', 'photo_src' => self::seed()['DEST_PHOTOS'][$p['dest']]['src'] ?? null] : null;
        }
        if (!$row) {
            return null;
        }
        $english = json_decode((string) ($row['english'] ?? ''), true)['text'] ?? '';
        $first = ((array) json_decode((string) ($row['highlights'] ?? '[]'), true))[0] ?? '';
        $auto = "{$row['title']} at {$row['university']}, {$row['city']}, {$row['country']}."
              . ($row['duration'] ? " Duration: {$row['duration']}." : '') . ($english ? " English: $english." : '') . ($first ? " $first." : '');
        $description = self::clip(self::clean($row['seo_description'] ?? '') ?: self::clean($auto));
        return [
            'title'       => self::clean($row['seo_title'] ?? '') ?: "{$row['title']}, {$row['university']} | " . self::SITE,
            'description' => $description,
            'path'        => 'program-' . $row['slug'],
            'image'       => self::imageUrl($row['photo_src'] ?? null),
            'route'       => ['id' => $row['slug']],
            'jsonld'      => [
                self::breadcrumb([['Home', ''], ['Programs', 'programs.html'], [$row['title'], 'program-' . $row['slug']]]),
                array_filter(['@context' => 'https://schema.org', '@type' => 'Course', 'name' => $row['title'], 'description' => $description,
                 'provider' => ['@type' => 'CollegeOrUniversity', 'name' => $row['university']],
                 'inLanguage' => $row['language'] ?: null, 'url' => url('program-' . $row['slug'])], static fn ($v) => $v !== null),
            ],
        ];
    }

    /** The organisation, for the homepage: name, logo, contact and social profiles. */
    public static function organization(?array $site): array
    {
        $site = $site ?? (self::seed()['SITE'] ?? []);
        $same = array_values(array_filter((array) ($site['social'] ?? []), static fn ($u) => is_string($u) && str_starts_with($u, 'https://')));
        return array_filter([
            '@context' => 'https://schema.org', '@type' => 'EducationalOrganization',
            'name' => self::SITE, 'url' => url(''), 'logo' => url('assets/img/brand/logo-mark.png'),
            'slogan' => $site['tagline'] ?? null,
            'telephone' => $site['phone'] ?? null, 'email' => $site['email'] ?? null,
            'address' => !empty($site['address']) ? ['@type' => 'PostalAddress', 'streetAddress' => $site['address'], 'addressLocality' => 'Dhaka', 'addressCountry' => 'BD'] : null,
            'sameAs' => $same ?: null,
        ], static fn ($v) => $v !== null && $v !== '');
    }

    /** Pages listed in the sitemap: [path, last change (Y-m-d) or null]. Hidden items are left out. */
    public static function sitemap(): array
    {
        $pages = ['', 'destinations.html', 'programs.html', 'universities.html', 'scholarships.html', 'services.html', 'about.html',
                  'leadership.html', 'news.html', 'contact.html', 'eligibility.html', 'cost-estimator.html', 'policies.html'];
        try {
            $latest = (string) Database::value("SELECT MAX(t) FROM (SELECT MAX(updated_at) t FROM destinations UNION ALL SELECT MAX(updated_at) FROM programs
                UNION ALL SELECT MAX(updated_at) FROM news UNION ALL SELECT MAX(updated_at) FROM team UNION ALL SELECT MAX(updated_at) FROM universities) x");
            $out = array_map(static fn ($p) => [$p, $latest ? substr($latest, 0, 10) : null], $pages);
            foreach (Database::all('SELECT slug, updated_at FROM destinations WHERE is_visible = 1 ORDER BY sort_order, id') as $r) {
                $out[] = ['study-in-' . $r['slug'], substr($r['updated_at'], 0, 10)];
            }
            foreach (Database::all('SELECT p.slug, p.updated_at FROM programs p JOIN destinations d ON d.id = p.destination_id
                                    WHERE p.is_visible = 1 AND d.is_visible = 1 ORDER BY p.sort_order, p.id') as $r) {
                $out[] = ['program-' . $r['slug'], substr($r['updated_at'], 0, 10)];
            }
            return $out;
        } catch (Throwable $e) {
            error_log('EduRise sitemap: ' . $e->getMessage());
            $out = array_map(static fn ($p) => [$p, null], $pages);
            foreach (self::seed()['DESTINATIONS'] ?? [] as $d) {
                $out[] = ['study-in-' . $d['id'], null];
            }
            foreach (self::seed()['PROGRAMS'] ?? [] as $p) {
                $out[] = ['program-' . $p['id'], null];
            }
            return $out;
        }
    }

    /* ---------- helpers ---------- */

    private static function breadcrumb(array $items): array
    {
        $list = [];
        foreach ($items as $i => [$name, $path]) {
            $list[] = ['@type' => 'ListItem', 'position' => $i + 1, 'name' => $name, 'item' => url($path)];
        }
        return ['@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => $list];
    }

    /** Absolute address of a content image, or the default share image. */
    private static function imageUrl(?string $src): string
    {
        if ($src && str_starts_with($src, 'https://')) {
            return $src;
        }
        if ($src && preg_match('#^(uploads|assets)/#', $src)) {
            return url($src);
        }
        return url('assets/img/brand/og-image.png');
    }

    /** One line of plain text. */
    private static function clean(string $s): string
    {
        return trim((string) preg_replace('/\s+/u', ' ', strip_tags($s)));
    }

    /** At most 160 characters, cut at a word, for search result snippets. */
    private static function clip(string $s, int $max = 160): string
    {
        if (mb_strlen($s) <= $max) {
            return $s;
        }
        $cut = mb_substr($s, 0, $max - 1);
        $sp = mb_strrpos($cut, ' ');
        return rtrim(mb_substr($cut, 0, $sp ?: $max - 1), ' ,.;:') . '…';
    }

    /** A row, null if not found, or false if the database cannot be read. */
    private static function row(string $sql, array $params): array|null|false
    {
        try {
            $rows = Database::all($sql, $params);
            return $rows[0] ?? null;
        } catch (Throwable $e) {
            error_log('EduRise SEO: database unavailable. ' . $e->getMessage());
            return false;
        }
    }

    private static function seed(): array
    {
        static $seed = null;
        if ($seed === null) {
            $f = APP_ROOT . '/database/seed/content.json';
            $seed = is_file($f) ? (json_decode((string) file_get_contents($f), true) ?: []) : [];
        }
        return $seed;
    }

    private static function seedItem(string $list, string $id): ?array
    {
        foreach (self::seed()[$list] ?? [] as $item) {
            if (($item['id'] ?? null) === $id) {
                return $item;
            }
        }
        return null;
    }
}
