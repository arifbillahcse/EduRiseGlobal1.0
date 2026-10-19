<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use Throwable;

/**
 * Reads the website content from the database and returns it in the exact
 * shape js/data.js uses, so the existing page scripts render it unchanged.
 * Only visible rows are returned.
 */
final class ContentRepository
{
    private static ?array $cache = null;
    private static bool $loaded = false;

    /**
     * Everything the pages need, keyed for window.EDURISE_DB.
     * Returns null when the database cannot be read: the pages then fall back
     * to the content built into js/data.js, and the error is logged.
     */
    public static function forPages(): ?array
    {
        if (self::$loaded) {
            return self::$cache;
        }
        self::$loaded = true;
        try {
            self::$cache = self::load();
        } catch (Throwable $e) {
            error_log('EduRise content: database unavailable, using built-in data. ' . $e->getMessage());
            self::$cache = null;
        }
        return self::$cache;
    }

    private static function load(): array
    {
        $out = [];

        // ---------- settings ----------
        foreach (Database::all('SELECT setting_key, value_json FROM settings') as $row) {
            $key = match ($row['setting_key']) {
                'site'          => 'site',
                'rates'         => 'rates',
                'rates_updated' => 'ratesUpdated',
                'living_costs'  => 'livingCosts',
                default         => null,
            };
            if ($key !== null) {
                $out[$key] = self::json($row['value_json']);
            }
        }

        // ---------- destinations + their photos ----------
        $destSlug = [];                                  // destinations.id -> slug, for the other tables
        $out['destinations'] = [];
        $out['destPhotos'] = new \stdClass();
        foreach (Database::all('SELECT * FROM destinations WHERE is_visible = 1 ORDER BY sort_order, id') as $r) {
            $destSlug[$r['id']] = $r['slug'];
            $d = [
                'id'           => $r['slug'],
                'code'         => $r['code'],
                'city'         => $r['city'],
                'name'         => $r['name'],
                'levels'       => self::json($r['levels']),
                'intro'        => $r['intro'],
                'highlights'   => self::json($r['highlights']),
                'requirements' => self::json($r['requirements']),
                'extraDocs'    => self::json($r['extra_docs']),
            ];
            if ($r['tbc']) {
                $d['tbc'] = true;
            }
            $out['destinations'][] = $d;
            if ($r['photo_src']) {
                $out['destPhotos']->{$r['slug']} = [
                    'src' => $r['photo_src'], 'alt' => $r['photo_alt'], 'by' => $r['photo_by'],
                    'license' => $r['photo_license'], 'licenseUrl' => $r['photo_license_url'],
                    'page' => $r['photo_page'], 'pos' => $r['photo_pos'],
                ];
            }
        }
        $dest = static fn ($id) => $destSlug[$id] ?? null;
        // rows of hidden countries are left out everywhere
        $visible = static fn (array $rows) => array_values(array_filter($rows, static fn ($r) => isset($destSlug[$r['destination_id']])));

        // ---------- universities ----------
        $out['universities'] = array_map(static fn ($r) => [
            'id'      => $r['slug'],
            'name'    => $r['name'],
            'dest'    => $dest($r['destination_id']),
            'city'    => $r['city'],
            'levels'  => self::json($r['levels']),
            'summary' => $r['summary'],
            'facts'   => self::json($r['facts']),
        ], $visible(Database::all('SELECT * FROM universities WHERE is_visible = 1 ORDER BY sort_order, id')));

        // ---------- intakes ----------
        $out['intakes'] = array_map(static function ($r) use ($dest) {
            $i = [
                'id'     => $r['slug'],
                'dest'   => $dest($r['destination_id']),
                'title'  => $r['title'],
                'levels' => self::json($r['levels']),
                'intake' => $r['intake'],
                'round'  => $r['round_label'],
            ];
            if ($r['tba'] || !$r['starts_on']) {
                $i['tba'] = true;
            } else {
                $i['s'] = $r['starts_on'];
                $i['e'] = $r['ends_on'];
            }
            return $i;
        }, $visible(Database::all('SELECT * FROM intakes WHERE is_visible = 1 ORDER BY sort_order, id')));

        // ---------- university scholarship offers ----------
        $out['scholarships'] = array_map(static fn ($r) => [
            'id'         => $r['slug'],
            'university' => $r['university'],
            'dest'       => $dest($r['destination_id']),
            'levels'     => self::json($r['levels']),
            'level'      => $r['level_label'],
            'award'      => $r['award'],
            'condition'  => $r['condition_text'],
            'intakeId'   => $r['intake_slug'],
        ], $visible(Database::all('SELECT * FROM scholarships WHERE is_visible = 1 ORDER BY sort_order, id')));

        // ---------- government scholarships ----------
        $out['govScholarships'] = array_map(static function ($r) {
            $g = [
                'code' => $r['code'], 'name' => $r['name'], 'country' => $r['country'],
                'coverage' => $r['coverage'], 'levels' => $r['levels_text'], 'url' => $r['url'],
            ];
            if ($r['note']) {
                $g['note'] = $r['note'];
            }
            return $g;
        }, Database::all('SELECT * FROM gov_scholarships WHERE is_visible = 1 ORDER BY sort_order, id'));

        // ---------- programs (detail pages) ----------
        $out['programs'] = array_map(static function ($r) use ($dest) {
            $p = [
                'id'           => $r['slug'],
                'university'   => $r['university'],
                'uni'          => $r['uni_slug'],
                'dest'         => $dest($r['destination_id']),
                'city'         => $r['city'],
                'title'        => $r['title'],
                'levels'       => self::json($r['levels']),
                'language'     => $r['language'],
                'duration'     => $r['duration'],
                'visa'         => $r['visa'],
                'english'      => self::json($r['english']),
                'cgpa'         => $r['cgpa'] === null ? null : (float) $r['cgpa'],
                'budget'       => $r['budget'],
                'majors'       => self::json($r['majors']),
                'tuition'      => self::json($r['tuition']),
                'oneTime'      => self::json($r['one_time']),
                'scholarships' => self::json($r['scholarships']),
                'intakes'      => self::json($r['intakes']),
                'highlights'   => self::json($r['highlights']),
            ];
            if ($r['milestones'] !== null) {
                $p['milestones'] = self::json($r['milestones']);
            }
            return $p;
        }, $visible(Database::all('SELECT * FROM programs WHERE is_visible = 1 ORDER BY sort_order, id')));

        // ---------- team ----------
        $out['team'] = array_map(static function ($r) {
            $t = [
                'id'       => $r['slug'],
                'name'     => $r['name'],
                'role'     => $r['role'],
                'location' => (string) $r['location'],
                'photo'    => $r['photo'],
                'bio'      => $r['bio'],
                'story'    => self::json($r['story']),
                'tags'     => self::json($r['tags']),
            ];
            foreach (['also_role' => 'alsoRole', 'portfolio_label' => 'portfolioLabel', 'motto' => 'motto'] as $col => $key) {
                if ($r[$col] !== null && $r[$col] !== '') {
                    $t[$key] = $r[$col];
                }
            }
            if ($r['portfolio'] !== null) {
                $t['portfolio'] = self::json($r['portfolio']);
            }
            if (!$r['on_home']) {
                $t['onHome'] = false;
            }
            return $t;
        }, Database::all('SELECT * FROM team WHERE is_visible = 1 ORDER BY sort_order, id'));

        // ---------- offices ----------
        $out['offices'] = array_map(static fn ($r) => [
            'tag' => $r['tag'], 'country' => $r['country'], 'name' => $r['name'],
            'address' => $r['address'], 'map' => $r['map_query'], 'tbc' => (bool) $r['tbc'],
        ], Database::all('SELECT * FROM offices WHERE is_visible = 1 ORDER BY sort_order, id'));

        // ---------- news (published only, newest first) ----------
        $out['news'] = array_map(static fn ($r) => [
            'id' => $r['slug'], 'date' => $r['published_on'], 'tag' => $r['tag'],
            'title' => $r['title'], 'summary' => $r['summary'], 'body' => $r['body'],
        ], Database::all("SELECT * FROM news WHERE is_visible = 1 AND status = 'published' ORDER BY published_on DESC, sort_order, id"));

        // ---------- testimonials: only real, checked stories with written consent ----------
        $out['testimonials'] = array_map(static fn ($r) => [
            'id' => $r['slug'], 'name' => $r['name'], 'destination' => $r['destination'],
            'university' => $r['university'], 'program' => $r['program'], 'quote' => $r['quote'], 'consent' => true,
        ], Database::all('SELECT * FROM testimonials WHERE is_visible = 1 AND verified = 1 AND consent = 1 ORDER BY sort_order, id'));

        // ---------- policies ----------
        $out['policies'] = array_map(static fn ($r) => [
            'id' => $r['slug'], 'title' => $r['title'], 'paragraphs' => self::json($r['paragraphs']),
        ], Database::all('SELECT * FROM policies WHERE is_visible = 1 ORDER BY sort_order, id'));

        return $out;
    }

    /** Decode a JSON column, keeping {} as an object (so it re-encodes as {}). */
    private static function json(?string $value): mixed
    {
        return $value === null ? null : json_decode($value, false, 512, JSON_THROW_ON_ERROR);
    }
}
