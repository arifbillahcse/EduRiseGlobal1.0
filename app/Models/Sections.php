<?php

declare(strict_types=1);

namespace App\Models;

/**
 * The editable content sections of the admin panel, in one place.
 * The generic editor (ContentController), the importer and the Bangla
 * dictionary for the website all read these definitions.
 *
 * Field types
 *   text, textarea, url, date, number, check
 *   slug        set when an item is added, then fixed (it is part of page addresses)
 *   destination destination_id, chosen from the destinations
 *   select      one of 'options'
 *   levels      ticks from LEVELS, stored as a JSON list
 *   lines       one item per line, stored as a JSON list
 *   pairs       "Label | value" per line, stored as [["Label", "value"], ...]; 'num' => true makes the value a number
 *   paragraphs  blank line between paragraphs; a JSON list (or one string when 'single' allows it)
 *   json        raw JSON for nested values (validated)
 *   image       a path in uploads/ or assets/, or an https:// address; can be replaced by uploading
 *
 * bn => true      a Bangla box is shown beside the English one
 * admin => true   only the Admin role sees and changes this field
 * Roles in 'can': add / hide / delete => 'editor' (Editors and Admins) or 'admin' (Admins only).
 */
final class Sections
{
    public const LEVELS = ['Foundation', 'Diploma', 'Bachelor’s', 'Master’s', 'Language'];

    public static function all(): array
    {
        return [
            'destinations' => [
                'table' => 'destinations', 'label' => 'Destinations', 'item' => 'country', 'title' => 'name',
                'can' => ['add' => 'admin', 'hide' => 'editor', 'delete' => 'admin'],
                'list' => ['code' => 'Code', 'city' => 'City'],
                'fields' => [
                    'name'         => ['type' => 'text', 'label' => 'Country name', 'bn' => true, 'required' => true, 'max' => 120],
                    'slug'         => ['type' => 'slug', 'label' => 'Address name', 'help' => 'Used in /study-in-<name> and destination.html#<name>. Fixed after the country is added.'],
                    'code'         => ['type' => 'text', 'label' => 'Airport / city code', 'max' => 3, 'help' => 'Three letters shown on cards, e.g. ICN'],
                    'city'         => ['type' => 'text', 'label' => 'City shown on cards', 'bn' => true, 'max' => 120],
                    'levels'       => ['type' => 'lines', 'label' => 'Study levels', 'bn' => true, 'help' => 'One per line, e.g. Bachelor’s'],
                    'intro'        => ['type' => 'textarea', 'label' => 'Introduction', 'bn' => true],
                    'highlights'   => ['type' => 'lines', 'label' => 'Highlights', 'bn' => true, 'help' => 'One per line'],
                    'requirements' => ['type' => 'pairs', 'label' => 'Requirements', 'bn' => true, 'help' => 'One per line: Label | requirement'],
                    'extra_docs'   => ['type' => 'lines', 'label' => 'Extra documents for this country', 'bn' => true, 'help' => 'One per line, added to the standard document list'],
                    'photo_src'    => ['type' => 'image', 'label' => 'Photo'],
                    'photo_alt'    => ['type' => 'text', 'label' => 'Photo description (alt text)', 'bn' => true, 'max' => 255],
                    'photo_by'     => ['type' => 'text', 'label' => 'Photographer', 'max' => 190, 'help' => 'For free-licence photos: credited on the policies page'],
                    'photo_license'     => ['type' => 'text', 'label' => 'Licence', 'max' => 80, 'help' => 'e.g. CC BY-SA 4.0'],
                    'photo_license_url' => ['type' => 'url', 'label' => 'Licence link'],
                    'photo_page'   => ['type' => 'url', 'label' => 'Photo source page'],
                    'photo_pos'    => ['type' => 'text', 'label' => 'Photo focus', 'max' => 20, 'help' => 'Which part stays visible when cropped, e.g. 50% 40%'],
                    'tbc'          => ['type' => 'check', 'label' => 'Details still to be confirmed (shows a TBC note)'],
                ],
            ],
            'programs' => [
                'table' => 'programs', 'label' => 'Programs', 'item' => 'program', 'title' => 'title',
                'can' => ['add' => 'editor', 'hide' => 'editor', 'delete' => 'admin'],
                'list' => ['university' => 'University', 'destination_id' => 'Country'],
                'fields' => [
                    'title'        => ['type' => 'text', 'label' => 'Program title', 'bn' => true, 'required' => true, 'max' => 255],
                    'slug'         => ['type' => 'slug', 'label' => 'Address name', 'help' => 'Used in program.html#<name>. Fixed after the program is added.'],
                    'destination_id' => ['type' => 'destination', 'label' => 'Country', 'required' => true],
                    'university'   => ['type' => 'text', 'label' => 'University (as shown)', 'bn' => true, 'required' => true, 'max' => 190],
                    'uni_slug'     => ['type' => 'text', 'label' => 'University address name', 'max' => 60, 'help' => 'Links to the university card, e.g. gachon. Leave empty for "various".'],
                    'city'         => ['type' => 'text', 'label' => 'City', 'bn' => true, 'max' => 190],
                    'levels'       => ['type' => 'levels', 'label' => 'Levels'],
                    'language'     => ['type' => 'text', 'label' => 'Teaching language', 'bn' => true, 'max' => 120],
                    'duration'     => ['type' => 'text', 'label' => 'Duration', 'bn' => true, 'max' => 60],
                    'visa'         => ['type' => 'text', 'label' => 'Visa', 'bn' => true, 'max' => 60],
                    'english'      => ['type' => 'json', 'label' => 'English requirement', 'help' => '{"ielts": 5.5, "text": "IELTS 5.5"} or {"none": true, "text": "No IELTS needed"}'],
                    'cgpa'         => ['type' => 'number', 'label' => 'Minimum CGPA', 'min' => 0, 'max' => 5, 'help' => 'Empty if not stated'],
                    'budget'       => ['type' => 'select', 'label' => 'Budget level (eligibility check)', 'options' => ['' => 'Not set', 'low' => 'Low', 'mid' => 'Medium', 'high' => 'High']],
                    'majors'       => ['type' => 'lines', 'label' => 'Majors', 'bn' => true, 'help' => 'One per line'],
                    'tuition'      => ['type' => 'json', 'label' => 'Tuition', 'help' => '{"amount": 5243000, "per": "semester", "cur": "KRW"} · a range: {"min": 2000, "max": 6000, "per": "year", "cur": "USD"} · null = ask a counsellor'],
                    'one_time'     => ['type' => 'pairs', 'label' => 'One-time fees', 'num' => true, 'help' => 'One per line: Fee name | amount (in the tuition currency)'],
                    'scholarships' => ['type' => 'json', 'label' => 'Scholarships', 'help' => '[{"label": "IELTS 5.5", "pct": 30, "scope": "first"}] · scope: first = first semester, all = whole program'],
                    'intakes'      => ['type' => 'lines', 'label' => 'Intakes', 'help' => 'Address names of intakes, one per line, e.g. gachon-r1'],
                    'milestones'   => ['type' => 'pairs', 'label' => 'Milestones', 'bn' => true, 'nullable' => true, 'help' => 'One per line: Step | date'],
                    'highlights'   => ['type' => 'lines', 'label' => 'Highlights', 'bn' => true, 'help' => 'One per line'],
                ],
            ],
            'universities' => [
                'table' => 'universities', 'label' => 'Universities', 'item' => 'university', 'title' => 'name',
                'can' => ['add' => 'editor', 'hide' => 'editor', 'delete' => 'admin'],
                'list' => ['city' => 'City', 'destination_id' => 'Country'],
                'fields' => [
                    'name'           => ['type' => 'text', 'label' => 'University name', 'bn' => true, 'required' => true, 'max' => 190],
                    'slug'           => ['type' => 'slug', 'label' => 'Address name'],
                    'destination_id' => ['type' => 'destination', 'label' => 'Country', 'required' => true],
                    'city'           => ['type' => 'text', 'label' => 'City', 'bn' => true, 'max' => 190],
                    'levels'         => ['type' => 'levels', 'label' => 'Levels'],
                    'summary'        => ['type' => 'textarea', 'label' => 'Summary', 'bn' => true],
                    'facts'          => ['type' => 'pairs', 'label' => 'Key facts', 'bn' => true, 'help' => 'One per line: Label | value, e.g. English | IELTS 5.5'],
                    'website_url'    => ['type' => 'url', 'label' => 'University website'],
                ],
            ],
            'intakes' => [
                'table' => 'intakes', 'label' => 'Intakes', 'item' => 'intake', 'title' => 'title',
                'can' => ['add' => 'editor', 'hide' => 'editor', 'delete' => 'admin'],
                'list' => ['round_label' => 'Round', 'starts_on' => 'Opens', 'ends_on' => 'Closes'],
                'fields' => [
                    'title'          => ['type' => 'text', 'label' => 'Title', 'bn' => true, 'required' => true, 'max' => 255, 'help' => 'e.g. Gachon University · MBA'],
                    'slug'           => ['type' => 'slug', 'label' => 'Address name', 'help' => 'Programs and scholarships link to an intake by this name.'],
                    'destination_id' => ['type' => 'destination', 'label' => 'Country', 'required' => true],
                    'levels'         => ['type' => 'levels', 'label' => 'Levels'],
                    'intake'         => ['type' => 'text', 'label' => 'Intake', 'bn' => true, 'max' => 60, 'help' => 'e.g. March 2027'],
                    'round_label'    => ['type' => 'text', 'label' => 'Round', 'bn' => true, 'max' => 120, 'help' => 'e.g. Round 1'],
                    'starts_on'      => ['type' => 'date', 'label' => 'First day to apply'],
                    'ends_on'        => ['type' => 'date', 'label' => 'Last day to apply'],
                    'tba'            => ['type' => 'check', 'label' => 'Dates not announced yet'],
                ],
            ],
            'scholarships' => [
                'table' => 'scholarships', 'label' => 'Scholarships', 'item' => 'scholarship offer', 'title' => 'university',
                'can' => ['add' => 'editor', 'hide' => 'editor', 'delete' => 'admin'],
                'list' => ['award' => 'Award', 'destination_id' => 'Country'],
                'fields' => [
                    'university'     => ['type' => 'text', 'label' => 'University', 'bn' => true, 'required' => true, 'max' => 190],
                    'slug'           => ['type' => 'slug', 'label' => 'Address name'],
                    'destination_id' => ['type' => 'destination', 'label' => 'Country', 'required' => true],
                    'levels'         => ['type' => 'levels', 'label' => 'Levels (for the filter)'],
                    'level_label'    => ['type' => 'text', 'label' => 'Level as shown', 'bn' => true, 'max' => 120, 'help' => 'e.g. Master’s (MBA)'],
                    'award'          => ['type' => 'text', 'label' => 'Award', 'bn' => true, 'max' => 190, 'help' => 'e.g. 50% tuition waiver'],
                    'condition_text' => ['type' => 'text', 'label' => 'Condition', 'bn' => true, 'max' => 255],
                    'intake_slug'    => ['type' => 'text', 'label' => 'Linked intake', 'max' => 60, 'help' => 'Address name of the intake, e.g. gachon-r1'],
                ],
            ],
            'gov-scholarships' => [
                'table' => 'gov_scholarships', 'label' => 'Government scholarships', 'item' => 'government scholarship', 'title' => 'name',
                'can' => ['add' => 'editor', 'hide' => 'editor', 'delete' => 'admin'],
                'list' => ['country' => 'Country', 'coverage' => 'Coverage'],
                'fields' => [
                    'name'        => ['type' => 'text', 'label' => 'Scholarship name', 'bn' => true, 'required' => true, 'max' => 190],
                    'code'        => ['type' => 'text', 'label' => 'Country code', 'required' => true, 'max' => 2, 'help' => 'Two letters shown on the card, e.g. UK'],
                    'country'     => ['type' => 'text', 'label' => 'Country', 'bn' => true, 'required' => true, 'max' => 120],
                    'coverage'    => ['type' => 'text', 'label' => 'Coverage', 'bn' => true, 'max' => 120],
                    'levels_text' => ['type' => 'text', 'label' => 'Levels', 'bn' => true, 'max' => 190],
                    'url'         => ['type' => 'url', 'label' => 'Official website'],
                    'note'        => ['type' => 'text', 'label' => 'Note', 'bn' => true, 'max' => 500],
                ],
            ],
            'team' => [
                'table' => 'team', 'label' => 'Leadership', 'item' => 'leader', 'title' => 'name',
                'can' => ['add' => 'admin', 'hide' => 'admin', 'delete' => 'admin'],
                'list' => ['role' => 'Role', 'on_home' => 'Homepage'],
                'fields' => [
                    'name'            => ['type' => 'text', 'label' => 'Name', 'required' => true, 'max' => 120],
                    'slug'            => ['type' => 'slug', 'label' => 'Address name', 'help' => 'Used in leadership.html#leader-<name>.'],
                    'role'            => ['type' => 'text', 'label' => 'Role', 'bn' => true, 'required' => true, 'max' => 190],
                    'also_role'       => ['type' => 'text', 'label' => 'Second role', 'bn' => true, 'max' => 190],
                    'location'        => ['type' => 'text', 'label' => 'Location', 'bn' => true, 'max' => 190],
                    'photo'           => ['type' => 'image', 'label' => 'Photo', 'help' => 'Square photo, at least 480 × 480'],
                    'bio'             => ['type' => 'textarea', 'label' => 'Short bio (homepage)', 'bn' => true],
                    'story'           => ['type' => 'paragraphs', 'label' => 'Full profile (leadership page)', 'bn' => true, 'single' => true, 'help' => 'Leave an empty line between paragraphs'],
                    'portfolio_label' => ['type' => 'text', 'label' => 'Portfolio heading', 'bn' => true, 'max' => 120, 'help' => 'Empty = "Portfolio"'],
                    'portfolio'       => ['type' => 'lines', 'label' => 'Portfolio', 'bn' => true, 'nullable' => true, 'help' => 'One per line'],
                    'motto'           => ['type' => 'text', 'label' => 'Motto', 'bn' => true, 'max' => 255],
                    'tags'            => ['type' => 'lines', 'label' => 'Tags', 'bn' => true, 'help' => 'One per line, e.g. Studied in Malaysia'],
                    'on_home'         => ['type' => 'check', 'label' => 'Show on the homepage'],
                ],
            ],
            'news' => [
                'table' => 'news', 'label' => 'News', 'item' => 'post', 'title' => 'title', 'order' => 'published_on DESC, id DESC',
                'can' => ['add' => 'editor', 'hide' => 'admin', 'delete' => 'admin'],
                'list' => ['published_on' => 'Date', 'status' => 'Status'],
                'fields' => [
                    'title'        => ['type' => 'text', 'label' => 'Title', 'bn' => true, 'required' => true, 'max' => 255],
                    'slug'         => ['type' => 'slug', 'label' => 'Address name'],
                    'published_on' => ['type' => 'date', 'label' => 'Date', 'required' => true],
                    'tag'          => ['type' => 'text', 'label' => 'Tag', 'bn' => true, 'max' => 60, 'help' => 'e.g. Intake, Scholarship'],
                    'summary'      => ['type' => 'textarea', 'label' => 'Summary', 'bn' => true],
                    'body'         => ['type' => 'textarea', 'label' => 'Full text', 'bn' => true, 'rows' => 10],
                    'status'       => ['type' => 'select', 'label' => 'Status', 'admin' => true, 'options' => ['draft' => 'Draft (not on the website)', 'published' => 'Published'],
                                       'help' => 'Editors save drafts; an Admin publishes.'],
                ],
            ],
            'testimonials' => [
                'table' => 'testimonials', 'label' => 'Testimonials', 'item' => 'story', 'title' => 'name',
                'can' => ['add' => 'editor', 'hide' => 'admin', 'delete' => 'admin'],
                'list' => ['destination' => 'Country', 'consent' => 'Consent', 'verified' => 'Checked'],
                'note' => 'A story appears on the website only when it is shown, checked by an Admin, and the student’s written consent is on file.',
                'fields' => [
                    'name'        => ['type' => 'text', 'label' => 'Student name', 'required' => true, 'max' => 120],
                    'slug'        => ['type' => 'slug', 'label' => 'Address name'],
                    'destination' => ['type' => 'text', 'label' => 'Country', 'bn' => true, 'max' => 120],
                    'university'  => ['type' => 'text', 'label' => 'University', 'bn' => true, 'max' => 190],
                    'program'     => ['type' => 'text', 'label' => 'Program', 'bn' => true, 'max' => 190],
                    'quote'       => ['type' => 'textarea', 'label' => 'Story, in the student’s own words', 'bn' => true, 'required' => true],
                    'consent'     => ['type' => 'check', 'label' => 'Written consent from the student is on file', 'admin' => true],
                    'verified'    => ['type' => 'check', 'label' => 'Checked: a real EduRise student', 'admin' => true],
                ],
            ],
            'offices' => [
                'table' => 'offices', 'label' => 'Offices', 'item' => 'office', 'title' => 'name', 'admin' => true,
                'can' => ['add' => 'admin', 'hide' => 'admin', 'delete' => 'admin'],
                'list' => ['tag' => 'Type', 'country' => 'Country'],
                'fields' => [
                    'name'      => ['type' => 'text', 'label' => 'Office name', 'bn' => true, 'required' => true, 'max' => 190],
                    'tag'       => ['type' => 'text', 'label' => 'Type', 'bn' => true, 'max' => 80, 'help' => 'e.g. Head office, Branch'],
                    'country'   => ['type' => 'text', 'label' => 'Country', 'bn' => true, 'required' => true, 'max' => 120],
                    'address'   => ['type' => 'text', 'label' => 'Address', 'bn' => true, 'max' => 500],
                    'map_query' => ['type' => 'text', 'label' => 'Map search text', 'max' => 255, 'help' => 'What Google Maps should search for'],
                    'tbc'       => ['type' => 'check', 'label' => 'Address still to be confirmed (shows a TBC note)'],
                ],
            ],
            'policies' => [
                'table' => 'policies', 'label' => 'Policies', 'item' => 'policy', 'title' => 'title', 'admin' => true,
                'can' => ['add' => 'admin', 'hide' => 'admin', 'delete' => 'admin'],
                'list' => [],
                'fields' => [
                    'title'      => ['type' => 'text', 'label' => 'Title', 'bn' => true, 'required' => true, 'max' => 190],
                    'slug'       => ['type' => 'slug', 'label' => 'Address name', 'help' => 'Used in policies.html#<name>.'],
                    'paragraphs' => ['type' => 'paragraphs', 'label' => 'Text', 'bn' => true, 'required' => true, 'help' => 'Leave an empty line between paragraphs'],
                ],
            ],
        ];
    }

    public static function get(string $key): ?array
    {
        return self::all()[$key] ?? null;
    }

    /** Section key for a table name. */
    public static function forTable(string $table): ?string
    {
        foreach (self::all() as $key => $s) {
            if ($s['table'] === $table) {
                return $key;
            }
        }
        return null;
    }

    /**
     * English => Bangla pairs from a row's bn column, for the website's
     * Bangla switch. Lists and pairs are matched item by item.
     */
    public static function bnPairs(array $section, array $row): array
    {
        $bn = $row['bn'] ?? null;
        $bn = is_string($bn) ? json_decode($bn, true) : $bn;
        if (!is_array($bn)) {
            return [];
        }
        $pairs = [];
        $add = static function ($en, $b) use (&$pairs): void {
            if (is_string($en) && is_string($b) && trim($en) !== '' && trim($b) !== '') {
                $pairs[trim($en)] = trim($b);
            }
        };
        foreach ($section['fields'] as $name => $f) {
            if (empty($f['bn']) || !isset($bn[$name])) {
                continue;
            }
            $en = $row[$name] ?? null;
            if (is_string($en) && in_array($f['type'], ['lines', 'pairs', 'paragraphs'], true)) {
                $en = json_decode($en, true);
            }
            $b = $bn[$name];
            if (is_array($en)) {
                $b = is_array($b) ? $b : [$b];
                foreach (array_values($en) as $i => $item) {
                    $bi = array_values($b)[$i] ?? null;
                    if (is_array($item)) {               // pairs: [label, value]
                        foreach (array_values($item) as $j => $part) {
                            $add($part, is_array($bi) ? (array_values($bi)[$j] ?? null) : null);
                        }
                    } else {
                        $add($item, is_array($bi) ? null : $bi);
                    }
                }
            } else {
                $add($en, is_array($b) ? implode("\n\n", $b) : $b);
            }
        }
        return $pairs;
    }
}
