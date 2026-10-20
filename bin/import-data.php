<?php
/**
 * EduRise Global — one-off import of the website content into the database.
 *
 * Reads database/seed/content.json (made from public_html/js/data.js by
 * `node bin/export-data.js`) and fills the content tables.
 *
 *     php bin/import-data.php            # only if the content tables are empty
 *     php bin/import-data.php --replace  # wipe the content tables first (asks to confirm)
 *
 * Leads, admin users and other system tables are never touched.
 */

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require dirname(__DIR__) . '/app/bootstrap.php';

use App\Core\Database;
use App\Models\Sections;

$replace = in_array('--replace', $argv, true);
$seedFile = APP_ROOT . '/database/seed/content.json';
$seed = json_decode((string) file_get_contents($seedFile), true, 512, JSON_THROW_ON_ERROR);

$contentTables = ['programs', 'scholarships', 'intakes', 'universities', 'gov_scholarships', 'team', 'offices', 'news', 'testimonials', 'policies', 'destinations'];

$pdo = Database::pdo();
$existing = (int) Database::value('SELECT COUNT(*) FROM destinations');
if ($existing > 0 && !$replace) {
    fwrite(STDERR, "The content tables already have data ($existing destinations). Nothing imported.\nRun with --replace to wipe the content tables and import again.\n");
    exit(1);
}
if ($replace && $existing > 0) {
    echo "This deletes ALL website content in the database (destinations, programs, team, news ...)\n"
       . "and any changes made in the admin panel, then imports content.json again.\nType yes to continue: ";
    if (trim((string) fgets(STDIN)) !== 'yes') {
        exit("Cancelled.\n");
    }
}

$j = static fn (mixed $v): ?string => $v === null ? null : json_encode($v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
// Bangla already in js/i18n.js is copied into each row's bn column, so the admin shows it
$BN = $seed['BN'] ?? [];
$tr = static function (mixed $v) use ($BN): mixed {
    if (is_array($v)) {
        return array_map(static fn ($x) => is_array($x) ? array_map(static fn ($y) => is_string($y) ? ($BN[trim($y)] ?? '') : '', $x) : (is_string($x) ? ($BN[trim($x)] ?? '') : ''), $v);
    }
    return is_string($v) ? ($BN[trim($v)] ?? '') : '';
};
/** true if a translated value holds any Bangla at all (lists are checked item by item) */
function bn_filled(mixed $v): bool
{
    if (is_array($v)) {
        foreach ($v as $x) {
            if (bn_filled($x)) {
                return true;
            }
        }
        return false;
    }
    return is_string($v) && $v !== '';
}
$filled = 'bn_filled';
$withBn = static function (string $table, array $row) use ($tr, $filled): array {
    $key = Sections::forTable($table);
    if ($key === null) {
        return $row;
    }
    $bn = [];
    foreach (Sections::get($key)['fields'] as $name => $f) {
        if (empty($f['bn']) || !isset($row[$name])) {
            continue;
        }
        $v = in_array($f['type'], ['lines', 'pairs', 'paragraphs'], true) ? json_decode((string) $row[$name], true) : $row[$name];
        $t = $tr($v);
        if ($filled($t)) {
            $bn[$name] = $t;
        }
    }
    $row['bn'] = $bn ? json_encode($bn, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;
    return $row;
};
$insert = static function (string $table, array $row) use ($withBn): int {
    $row = $withBn($table, $row);
    $cols = array_keys($row);
    $sql = sprintf('INSERT INTO %s (%s) VALUES (%s)', $table, implode(', ', $cols), implode(', ', array_map(static fn ($c) => ':' . $c, $cols)));
    Database::run($sql, $row);
    return (int) Database::pdo()->lastInsertId();
};

$pdo->beginTransaction();
try {
    if ($replace) {
        foreach ($contentTables as $t) {
            $pdo->exec("DELETE FROM $t");
        }
        $pdo->exec("DELETE FROM settings WHERE setting_key IN ('site', 'site_bn', 'promo', 'rates', 'rates_updated', 'living_costs')");
    }
    $counts = [];

    // settings
    foreach (['site' => 'SITE', 'rates' => 'RATES', 'rates_updated' => 'RATES_UPDATED', 'living_costs' => 'LIVING_COSTS'] as $key => $src) {
        $insert('settings', ['setting_key' => $key, 'value_json' => $j($seed[$src])]);
    }
    $siteBn = array_filter(array_map(static fn ($v) => is_string($v) ? ($BN[trim($v)] ?? '') : '', $seed['SITE']));
    $insert('settings', ['setting_key' => 'site_bn', 'value_json' => $j((object) $siteBn)]);
    $insert('settings', ['setting_key' => 'promo', 'value_json' => $j(array_map(static fn ($m) => ['en' => $m, 'bn' => $BN[trim($m)] ?? ''], $seed['RIBBON_MSGS'] ?? []))]);

    // destinations (+ photos); data.js already holds them in the client's order
    $destId = [];
    foreach ($seed['DESTINATIONS'] as $i => $d) {
        $p = $seed['DEST_PHOTOS'][$d['id']] ?? [];
        $destId[$d['id']] = $insert('destinations', [
            'slug' => $d['id'], 'name' => $d['name'], 'code' => $d['code'] ?? null, 'city' => $d['city'] ?? null,
            'levels' => $j($d['levels'] ?? []), 'intro' => $d['intro'] ?? null, 'highlights' => $j($d['highlights'] ?? []),
            'requirements' => $j($d['requirements'] ?? []), 'extra_docs' => $j($d['extraDocs'] ?? []),
            'photo_src' => $p['src'] ?? null, 'photo_alt' => $p['alt'] ?? null, 'photo_by' => $p['by'] ?? null,
            'photo_license' => $p['license'] ?? null, 'photo_license_url' => $p['licenseUrl'] ?? null,
            'photo_page' => $p['page'] ?? null, 'photo_pos' => $p['pos'] ?? null,
            'sort_order' => ($i + 1) * 10, 'tbc' => empty($d['tbc']) ? 0 : 1,
        ]);
    }
    $counts['destinations'] = count($destId);
    $destOf = static function (string $slug) use ($destId): int {
        if (!isset($destId[$slug])) {
            throw new RuntimeException("Unknown destination '$slug' in content.json");
        }
        return $destId[$slug];
    };

    foreach ($seed['UNIVERSITIES'] as $i => $u) {
        $insert('universities', [
            'slug' => $u['id'], 'destination_id' => $destOf($u['dest']), 'name' => $u['name'], 'city' => $u['city'] ?? null,
            'levels' => $j($u['levels'] ?? []), 'summary' => $u['summary'] ?? null, 'facts' => $j($u['facts'] ?? []),
            'sort_order' => ($i + 1) * 10, 'tbc' => 1,          // sample data from Facebook posts
        ]);
    }
    $counts['universities'] = count($seed['UNIVERSITIES']);

    foreach ($seed['INTAKES'] as $i => $n) {
        $insert('intakes', [
            'slug' => $n['id'], 'destination_id' => $destOf($n['dest']), 'title' => $n['title'], 'levels' => $j($n['levels'] ?? []),
            'intake' => $n['intake'] ?? null, 'round_label' => $n['round'] ?? null,
            'starts_on' => $n['s'] ?? null, 'ends_on' => $n['e'] ?? null, 'tba' => empty($n['tba']) ? 0 : 1,
            'sort_order' => ($i + 1) * 10, 'tbc' => 1,
        ]);
    }
    $counts['intakes'] = count($seed['INTAKES']);

    foreach ($seed['SCHOLARSHIP_OFFERS'] as $i => $s) {
        $insert('scholarships', [
            'slug' => $s['id'], 'destination_id' => $destOf($s['dest']), 'university' => $s['university'], 'levels' => $j($s['levels'] ?? []),
            'level_label' => $s['level'] ?? null, 'award' => $s['award'] ?? null, 'condition_text' => $s['condition'] ?? null,
            'intake_slug' => $s['intakeId'] ?? null, 'sort_order' => ($i + 1) * 10, 'tbc' => 1,
        ]);
    }
    $counts['scholarships'] = count($seed['SCHOLARSHIP_OFFERS']);

    foreach ($seed['GOV_SCHOLARSHIPS'] as $i => $g) {
        $insert('gov_scholarships', [
            'code' => $g['code'], 'name' => $g['name'], 'country' => $g['country'], 'coverage' => $g['coverage'] ?? null,
            'levels_text' => $g['levels'] ?? null, 'url' => $g['url'] ?? null, 'note' => $g['note'] ?? null, 'sort_order' => ($i + 1) * 10,
        ]);
    }
    $counts['gov_scholarships'] = count($seed['GOV_SCHOLARSHIPS']);

    foreach ($seed['PROGRAMS'] as $i => $p) {
        $insert('programs', [
            'slug' => $p['id'], 'destination_id' => $destOf($p['dest']), 'university' => $p['university'], 'uni_slug' => $p['uni'] ?? null,
            'city' => $p['city'] ?? null, 'title' => $p['title'], 'levels' => $j($p['levels'] ?? []), 'language' => $p['language'] ?? null,
            'duration' => $p['duration'] ?? null, 'visa' => $p['visa'] ?? null, 'english' => $j($p['english'] ?? null),
            'cgpa' => $p['cgpa'] ?? null, 'budget' => $p['budget'] ?? null, 'majors' => $j($p['majors'] ?? []),
            'tuition' => $j($p['tuition'] ?? null), 'one_time' => $j($p['oneTime'] ?? []), 'scholarships' => $j($p['scholarships'] ?? []),
            'intakes' => $j($p['intakes'] ?? []), 'milestones' => $j($p['milestones'] ?? null), 'highlights' => $j($p['highlights'] ?? []),
            'sort_order' => ($i + 1) * 10, 'tbc' => 1,
        ]);
    }
    $counts['programs'] = count($seed['PROGRAMS']);

    foreach ($seed['TEAM'] as $i => $t) {
        $insert('team', [
            'slug' => $t['id'], 'name' => $t['name'], 'role' => $t['role'], 'also_role' => $t['alsoRole'] ?? null,
            'location' => ($t['location'] ?? '') === '' ? null : $t['location'], 'photo' => $t['photo'] ?? null, 'bio' => $t['bio'] ?? null,
            'story' => $j($t['story'] ?? null), 'portfolio_label' => $t['portfolioLabel'] ?? null, 'portfolio' => $j($t['portfolio'] ?? null),
            'motto' => $t['motto'] ?? null, 'tags' => $j($t['tags'] ?? []), 'on_home' => ($t['onHome'] ?? true) ? 1 : 0,
            'sort_order' => ($i + 1) * 10,
        ]);
    }
    $counts['team'] = count($seed['TEAM']);

    foreach ($seed['OFFICES'] as $i => $o) {
        $insert('offices', [
            'tag' => $o['tag'] ?? null, 'country' => $o['country'], 'name' => $o['name'], 'address' => $o['address'] ?? null,
            'map_query' => $o['map'] ?? null, 'sort_order' => ($i + 1) * 10, 'tbc' => empty($o['tbc']) ? 0 : 1,
        ]);
    }
    $counts['offices'] = count($seed['OFFICES']);

    foreach ($seed['NEWS'] as $i => $n) {
        $insert('news', [
            'slug' => $n['id'], 'published_on' => $n['date'], 'tag' => $n['tag'] ?? null, 'title' => $n['title'],
            'summary' => $n['summary'] ?? null, 'body' => $n['body'] ?? null, 'status' => 'published',
            'sort_order' => ($i + 1) * 10, 'tbc' => 1,
        ]);
    }
    $counts['news'] = count($seed['NEWS']);

    foreach ($seed['TESTIMONIALS'] as $i => $t) {
        $insert('testimonials', [
            'slug' => $t['id'], 'name' => $t['name'], 'destination' => $t['destination'] ?? null, 'university' => $t['university'] ?? null,
            'program' => $t['program'] ?? null, 'quote' => $t['quote'],
            // imported stories still need an admin to confirm consent and check them before they appear
            'consent' => 0, 'verified' => 0, 'is_visible' => 0, 'sort_order' => ($i + 1) * 10,
        ]);
    }
    $counts['testimonials'] = count($seed['TESTIMONIALS']);

    foreach ($seed['POLICIES'] as $i => $p) {
        $insert('policies', ['slug' => $p['id'], 'title' => $p['title'], 'paragraphs' => $j($p['paragraphs']), 'sort_order' => ($i + 1) * 10, 'tbc' => 1]);
    }
    $counts['policies'] = count($seed['POLICIES']);

    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    fwrite(STDERR, 'Import failed, nothing was changed: ' . $e->getMessage() . PHP_EOL);
    exit(1);
}

foreach ($counts as $table => $n) {
    printf("%-18s %d\n", $table, $n);
}
echo "Import finished.\n";
