<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Upload;
use App\Models\Content;
use App\Models\Sections;
use RuntimeException;

/**
 * One editor for every content section (destinations, programs, news ...),
 * driven by App\Models\Sections. Changes show on the website at once: pages
 * read the database on every request.
 */
final class ContentController extends BaseController
{
    /* ---------- pages ---------- */

    public static function index(string $key): void
    {
        $section = Sections::get($key);
        if ($section === null) {
            PanelController::section($key);              // sections that are not editable yet (Leads)
            return;
        }
        if (!$u = self::open($section)) {
            return;
        }
        self::render('content-list', [
            'title' => $section['label'], 'user' => $u, 'key' => $key, 'section' => $section,
            'rows' => Content::list($section), 'can' => self::permissions($section, $u),
        ]);
    }

    public static function createForm(string $key): void
    {
        if (!($section = Sections::get($key)) || !$u = self::open($section, 'add')) {
            self::notFoundUnless($section);
            return;
        }
        $row = ['is_visible' => $key === 'testimonials' ? 0 : 1, 'status' => 'draft', 'on_home' => 1];
        self::form($key, $section, $u, null, self::formValues($section, $row), [], 200);
    }

    public static function store(string $key): void
    {
        if (!($section = Sections::get($key)) || !$u = self::open($section, 'add')) {
            self::notFoundUnless($section);
            return;
        }
        if (!self::checkCsrf($u)) {
            return;
        }
        [$values, $form, $errors] = self::parse($section, $u, null);
        if ($errors) {
            self::form($key, $section, $u, null, $form, $errors, 422);
            return;
        }
        $id = Content::save($section, null, $values);
        \App\Core\Session::flash('success', ucfirst($section['item']) . ' added.' . self::visibilityNote($section, $values));
        self::redirect("/$key/$id");
    }

    public static function editForm(string $key, string $id): void
    {
        if (!($section = Sections::get($key)) || !$u = self::open($section)) {
            self::notFoundUnless($section);
            return;
        }
        $row = ctype_digit($id) ? Content::find($section, (int) $id) : null;
        if (!$row) {
            self::missing($u);
            return;
        }
        self::form($key, $section, $u, $row, self::formValues($section, $row), [], 200);
    }

    public static function update(string $key, string $id): void
    {
        if (!($section = Sections::get($key)) || !$u = self::open($section)) {
            self::notFoundUnless($section);
            return;
        }
        if (!self::checkCsrf($u)) {
            return;
        }
        $row = ctype_digit($id) ? Content::find($section, (int) $id) : null;
        if (!$row) {
            self::missing($u);
            return;
        }
        [$values, $form, $errors] = self::parse($section, $u, $row);
        if ($errors) {
            self::form($key, $section, $u, $row, $form, $errors, 422);
            return;
        }
        Content::save($section, (int) $row['id'], $values);
        \App\Core\Session::flash('success', 'Saved. The website shows the change now.' . self::visibilityNote($section, $values + $row));
        self::redirect("/$key/{$row['id']}");
    }

    public static function toggle(string $key, string $id): void
    {
        self::rowAction($key, $id, 'hide', static function (array $section, array $row): string {
            $show = !$row['is_visible'];
            Content::setVisible($section, (int) $row['id'], $show);
            return $show ? 'Shown on the website.' : 'Hidden from the website. It stays here in the admin.';
        });
    }

    public static function move(string $key, string $id): void
    {
        self::rowAction($key, $id, 'hide', static function (array $section, array $row): string {
            if (isset($section['order'])) {
                return '';
            }
            Content::move($section, (int) $row['id'], ($_POST['dir'] ?? '') === 'up' ? -1 : 1);
            return '';
        });
    }

    public static function deleteForm(string $key, string $id): void
    {
        if (!($section = Sections::get($key)) || !$u = self::open($section, 'delete')) {
            self::notFoundUnless($section);
            return;
        }
        $row = ctype_digit($id) ? Content::find($section, (int) $id) : null;
        if (!$row) {
            self::missing($u);
            return;
        }
        self::render('content-delete', [
            'title' => 'Delete', 'user' => $u, 'key' => $key, 'section' => $section, 'row' => $row,
            'dependants' => Content::dependants($section, (int) $row['id']),
        ]);
    }

    public static function delete(string $key, string $id): void
    {
        self::rowAction($key, $id, 'delete', static function (array $section, array $row): string {
            if (Content::dependants($section, (int) $row['id'])) {
                return '!Not deleted: other content still belongs to this ' . $section['item'] . '. Hide it instead, or move that content first.';
            }
            Content::delete($section, (int) $row['id']);
            return ucfirst($section['item']) . ' “' . $row[$section['title']] . '” deleted.';
        });
    }

    /* ---------- helpers: access ---------- */

    /** Signed-in user allowed into the section (and, if given, allowed to do $action), else null. */
    private static function open(array $section, ?string $action = null): ?array
    {
        $u = !empty($section['admin']) ? self::requireAdmin() : self::requireUser();
        if ($u === null) {
            return null;
        }
        if ($action !== null && !self::permissions($section, $u)[$action]) {
            self::forbidden($u);
            return null;
        }
        return $u;
    }

    /** add / hide / delete => bool for this user */
    private static function permissions(array $section, array $user): array
    {
        $out = [];
        foreach (['add', 'hide', 'delete'] as $a) {
            $need = $section['can'][$a] ?? 'admin';
            $out[$a] = $user['role'] === 'admin' || $need === 'editor';
        }
        return $out;
    }

    /** An unknown section name: the admin 404 page (after the usual sign-in check). */
    private static function notFoundUnless(?array $section): void
    {
        if ($section === null && ($u = self::requireUser())) {
            self::render('error', ['title' => 'Not found', 'user' => $u, 'status' => 404, 'heading' => 'Page not found', 'message' => 'This admin page does not exist.'], 404);
        }
    }

    private static function missing(array $u): void
    {
        self::render('error', ['title' => 'Not found', 'user' => $u, 'status' => 404, 'heading' => 'Not found', 'message' => 'This item does not exist, or it was deleted.'], 404);
    }

    /** POST action on one row: checks the role, CSRF and that the row exists, then redirects to the list. */
    private static function rowAction(string $key, string $id, string $action, callable $do): void
    {
        if (!($section = Sections::get($key)) || !$u = self::open($section, $action)) {
            self::notFoundUnless($section);
            return;
        }
        if (!self::checkCsrf($u)) {
            return;
        }
        $row = ctype_digit($id) ? Content::find($section, (int) $id) : null;
        if (!$row) {
            self::missing($u);
            return;
        }
        $msg = $do($section, $row);
        if ($msg !== '') {
            \App\Core\Session::flash($msg[0] === '!' ? 'error' : 'success', ltrim($msg, '!'));
        }
        self::redirect("/$key");
    }

    private static function visibilityNote(array $section, array $values): string
    {
        if ($section['table'] === 'news' && ($values['status'] ?? '') !== 'published') {
            return ' It is a draft: an Admin publishes it.';
        }
        if ($section['table'] === 'testimonials' && !(($values['is_visible'] ?? 0) && ($values['consent'] ?? 0) && ($values['verified'] ?? 0))) {
            return ' It appears on the website once an Admin has checked it and confirmed consent.';
        }
        if (isset($values['is_visible']) && !$values['is_visible']) {
            return ' It is hidden from the website.';
        }
        return '';
    }

    /* ---------- the form ---------- */

    private static function form(string $key, array $section, array $u, ?array $row, array $form, array $errors, int $status): void
    {
        $perm = self::permissions($section, $u);
        self::render('content-form', [
            'title' => ($row ? 'Edit ' : 'Add ') . $section['item'], 'user' => $u, 'key' => $key, 'section' => $section,
            'row' => $row, 'form' => $form, 'errors' => $errors, 'can' => $perm,
            'destinations' => isset($section['fields']['destination_id']) ? Content::destinations() : [],
            'levels' => Sections::LEVELS, 'isAdmin' => $u['role'] === 'admin',
            'view' => $row ? self::viewUrl($key, $row) : null,
        ], $status);
    }

    /** Where the item is on the website (for the "View on website" link). */
    private static function viewUrl(string $key, array $row): ?string
    {
        $slug = (string) ($row['slug'] ?? '');
        return match ($key) {
            'destinations' => "study-in-$slug",
            'programs'     => "program.html#$slug",
            'universities', 'intakes' => 'universities.html',
            'scholarships', 'gov-scholarships' => 'scholarships.html',
            'team'         => "leadership.html#leader-$slug",
            'news'         => 'news.html',
            'offices'      => 'contact.html',
            'policies'     => "policies.html#$slug",
            default        => null,
        };
    }

    /** Database row -> the strings and lists the form shows. */
    private static function formValues(array $section, array $row): array
    {
        $bn = json_decode((string) ($row['bn'] ?? ''), true) ?: [];
        $form = ['is_visible' => (int) ($row['is_visible'] ?? 1), 'bn' => []];
        foreach ($section['fields'] as $name => $f) {
            $v = $row[$name] ?? null;
            $form[$name] = self::toText($f, $v, true);
            if (!empty($f['bn'])) {
                $form['bn'][$name] = self::toText($f, $bn[$name] ?? null, false);
            }
        }
        return $form;
    }

    /** One stored value as form text. $json = the value is a JSON string from the database. */
    private static function toText(array $f, mixed $v, bool $json): mixed
    {
        $decode = static fn ($x) => $json && is_string($x) ? json_decode($x, true) : $x;
        switch ($f['type']) {
            case 'lines':
                return implode("\n", array_map(static fn ($x) => self::cell($x, $json), (array) ($decode($v) ?? [])));
            case 'pairs':
                return implode("\n", array_map(static fn ($p) => implode(' | ', array_map(static fn ($x) => self::cell($x, $json), (array) $p)), (array) ($decode($v) ?? [])));
            case 'paragraphs':
                $p = $decode($v);
                return is_array($p) ? implode("\n\n", $p) : (string) $p;
            case 'levels':
                return (array) ($decode($v) ?? []);
            case 'json':
                return $v === null ? '' : json_encode(json_decode((string) $v), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
            case 'check':
                return (int) $v;
            case 'number':
                return $v === null ? '' : rtrim(rtrim((string) $v, '0'), '.');
            default:
                return (string) ($v ?? '');
        }
    }

    /** A list item as text; in a Bangla list an empty item is shown as "-" so the lines stay in step. */
    private static function cell(mixed $x, bool $english): string
    {
        $x = (string) $x;
        return (!$english && trim($x) === '') ? '-' : $x;
    }

    /**
     * Reads and checks the posted form.
     * @return array{0: array, 1: array, 2: array} [database values, form values to show again, errors]
     */
    private static function parse(array $section, array $u, ?array $row): array
    {
        $isAdmin = $u['role'] === 'admin';
        $values = [];
        $errors = [];
        $form = ['bn' => []];
        $bnOut = [];
        $postBn = is_array($_POST['bn'] ?? null) ? $_POST['bn'] : [];

        foreach ($section['fields'] as $name => $f) {
            $label = $f['label'];
            // fields only an Admin may change keep their value for Editors
            if (!empty($f['admin']) && !$isAdmin) {
                $keep = $row[$name] ?? ($f['type'] === 'select' ? array_key_first($f['options']) : 0);
                $values[$name] = $keep;
                $form[$name] = self::toText($f, $keep, true);
                continue;
            }
            $raw = $_POST[$name] ?? null;
            $text = is_string($raw) ? trim(str_replace("\r\n", "\n", $raw)) : '';
            $form[$name] = $f['type'] === 'levels' ? (is_array($raw) ? array_values(array_filter($raw, 'is_string')) : []) : ($f['type'] === 'check' ? (int) isset($_POST[$name]) : $text);

            if (!empty($f['required']) && $f['type'] !== 'check' && $text === '' && $f['type'] !== 'levels' && $f['type'] !== 'slug') {
                $errors[] = "$label is required.";
                continue;
            }
            if (isset($f['max']) && mb_strlen($text) > $f['max']) {
                $errors[] = "$label is too long (at most {$f['max']} characters).";
                continue;
            }

            switch ($f['type']) {
                case 'slug':
                    if ($row !== null) {
                        continue 2;                         // fixed after creation
                    }
                    $slug = self::slugify($text !== '' ? $text : (string) ($_POST[$section['title']] ?? ''));
                    $form[$name] = $slug;
                    if ($slug === '') {
                        $errors[] = "$label is required.";
                    } elseif (Content::slugTaken($section, $slug)) {
                        $errors[] = "$label “{$slug}” is already used. Choose another.";
                    } else {
                        $values[$name] = $slug;
                    }
                    break;
                case 'text':
                case 'textarea':
                    $values[$name] = $text === '' ? null : $text;
                    break;
                case 'url':
                    if ($text !== '' && (!filter_var($text, FILTER_VALIDATE_URL) || !preg_match('#^https?://#i', $text))) {
                        $errors[] = "$label must be a web address starting with https://";
                    }
                    $values[$name] = $text === '' ? null : $text;
                    break;
                case 'date':
                    $d = \DateTimeImmutable::createFromFormat('!Y-m-d', $text);
                    if ($text !== '' && (!$d || $d->format('Y-m-d') !== $text)) {
                        $errors[] = "$label is not a valid date.";
                    }
                    $values[$name] = $text === '' ? null : $text;
                    break;
                case 'number':
                    if ($text !== '' && (!is_numeric($text) || (isset($f['min']) && $text < $f['min']) || (isset($f['max']) && $text > $f['max']))) {
                        $errors[] = "$label must be a number" . (isset($f['min'], $f['max']) ? " from {$f['min']} to {$f['max']}" : '') . '.';
                    }
                    $values[$name] = $text === '' ? null : $text;
                    break;
                case 'check':
                    $values[$name] = isset($_POST[$name]) ? 1 : 0;
                    break;
                case 'select':
                    if (!array_key_exists($text, $f['options'])) {
                        $errors[] = "Choose a value for $label.";
                    }
                    $values[$name] = $text === '' ? null : $text;
                    break;
                case 'destination':
                    $dest = Content::destinations();
                    if (!ctype_digit($text) || !isset($dest[(int) $text])) {
                        $errors[] = "Choose a country for $label.";
                    } else {
                        $values[$name] = (int) $text;
                    }
                    break;
                case 'levels':
                    $values[$name] = json_encode(array_values(array_intersect(Sections::LEVELS, $form[$name])), JSON_UNESCAPED_UNICODE);
                    break;
                case 'lines':
                    $list = self::lines($text);
                    $values[$name] = (!$list && !empty($f['nullable'])) ? null : json_encode($list, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                    break;
                case 'pairs':
                    $pairs = [];
                    foreach (self::lines($text) as $n => $line) {
                        if (!str_contains($line, '|')) {
                            $errors[] = "$label, line " . ($n + 1) . ': put a | between the label and the value.';
                            continue;
                        }
                        [$a, $b] = array_map('trim', explode('|', $line, 2));
                        if (!empty($f['num'])) {
                            $num = str_replace(',', '', $b);
                            if (!is_numeric($num)) {
                                $errors[] = "$label, line " . ($n + 1) . ': the amount must be a number.';
                                continue;
                            }
                            $b = $num + 0;
                        }
                        $pairs[] = [$a, $b];
                    }
                    $values[$name] = (!$pairs && !empty($f['nullable'])) ? null : json_encode($pairs, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                    break;
                case 'paragraphs':
                    $paras = self::paragraphs($text);
                    if (!empty($f['required']) && !$paras) {
                        $errors[] = "$label is required.";
                    }
                    $store = (!empty($f['single']) && count($paras) === 1) ? $paras[0] : $paras;
                    $values[$name] = $paras ? json_encode($store, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;
                    break;
                case 'json':
                    if ($text === '' || $text === 'null') {
                        $values[$name] = null;
                        break;
                    }
                    try {
                        $decoded = json_decode($text, false, 32, JSON_THROW_ON_ERROR);
                        if (!is_array($decoded) && !is_object($decoded)) {
                            throw new \JsonException('not a list or object');
                        }
                        $values[$name] = json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                    } catch (\JsonException) {
                        $errors[] = "$label is not valid JSON. Check the brackets, quotes and commas against the example.";
                    }
                    break;
                case 'image':
                    $path = $text;
                    $file = $_FILES[$name . '_file'] ?? null;
                    if (is_array($file) && ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
                        try {
                            $path = Upload::image($file, (int) $u['id'], (string) ($_POST[$section['title']] ?? ''))['path'];
                            $form[$name] = $path;
                        } catch (RuntimeException $e) {
                            $errors[] = "$label: " . $e->getMessage();
                        }
                    } elseif (!Upload::validPath($path)) {
                        $errors[] = "$label must be a file in uploads/ or assets/, or an https:// address.";
                    }
                    $values[$name] = $path === '' ? null : $path;
                    break;
            }

            // the Bangla box
            if (!empty($f['bn'])) {
                $b = is_string($postBn[$name] ?? null) ? trim(str_replace("\r\n", "\n", $postBn[$name])) : '';
                $form['bn'][$name] = $b;
                if ($b !== '') {
                    $dash = static fn (string $x): string => $x === '-' ? '' : $x;
                    $bnOut[$name] = match ($f['type']) {
                        'lines'      => array_map($dash, self::lines($b)),
                        'pairs'      => array_map(static fn ($l) => array_map(static fn ($x) => $dash(trim($x)), explode('|', $l, 2)), self::lines($b)),
                        'paragraphs' => count($p = self::paragraphs($b)) === 1 && !empty($f['single']) ? $p[0] : $p,
                        default      => $b,
                    };
                }
            }
        }

        // section rules
        if ($section['table'] === 'intakes' && !($values['tba'] ?? 0)) {
            if (empty($values['starts_on']) || empty($values['ends_on'])) {
                $errors[] = 'Enter the first and last day to apply, or tick “Dates not announced yet”.';
            } elseif ($values['starts_on'] > $values['ends_on']) {
                $errors[] = 'The last day to apply is before the first day.';
            }
        }
        if ($section['table'] === 'destinations' && !empty($values['photo_pos']) && !preg_match('/^\d{1,3}% \d{1,3}%$/', $values['photo_pos'])) {
            $errors[] = 'Photo focus must look like 50% 40% (across, then down).';
        }
        if ($section['table'] === 'programs') {
            $errors = array_merge($errors, self::checkProgram($values));
        }
        if ($section['table'] === 'news' && !$isAdmin && $row === null) {
            $values['status'] = 'draft';
        }

        $values['bn'] = $bnOut ? json_encode($bnOut, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;

        // Show on website: only for those allowed to hide
        $perm = self::permissions($section, $u);
        $form['is_visible'] = (int) isset($_POST['is_visible']);
        if ($perm['hide']) {
            $values['is_visible'] = $form['is_visible'];
        } elseif ($row === null) {
            $values['is_visible'] = $section['table'] === 'testimonials' ? 0 : 1;
        }
        return [$values, $form, $errors];
    }

    /**
     * The nested program fields must have exactly the shape the program pages
     * and the cost estimator expect (numbers stay numbers, fixed words stay fixed).
     */
    private static function checkProgram(array $v): array
    {
        $e = [];
        $num = static fn ($x, $min, $max) => (is_int($x) || is_float($x)) && $x >= $min && $x <= $max;
        $str = static fn ($x, $max = 300) => is_string($x) && mb_strlen($x) <= $max;
        $keysOnly = static fn (array $o, array $allowed) => !array_diff(array_keys($o), $allowed);

        $en = isset($v['english']) ? json_decode($v['english'], true) : null;
        if (!is_array($en) || array_is_list($en) || !$keysOnly($en, ['ielts', 'none', 'text']) || !$str($en['text'] ?? null, 200)
            || (isset($en['ielts']) && !$num($en['ielts'], 0, 9)) || (isset($en['none']) && !is_bool($en['none'])) || (!isset($en['ielts']) && empty($en['none']))) {
            $e[] = 'English requirement: use {"ielts": 5.5, "text": "IELTS 5.5"} or {"none": true, "text": "No IELTS needed"}.';
        }

        $rates = json_decode((string) \App\Core\Database::value("SELECT value_json FROM settings WHERE setting_key = 'rates'"), true) ?: [];
        $t = isset($v['tuition']) ? json_decode($v['tuition'], true) : null;
        if ($t !== null) {
            $ok = is_array($t) && !array_is_list($t) && $keysOnly($t, ['amount', 'min', 'max', 'per', 'cur', 'note'])
                && in_array($t['per'] ?? null, ['semester', 'year'], true) && is_string($t['cur'] ?? null) && isset($rates[$t['cur']])
                && (isset($t['amount']) ? $num($t['amount'], 0, 1e10) && !isset($t['min']) : ($num($t['min'] ?? null, 0, 1e10) && $num($t['max'] ?? null, 0, 1e10) && $t['min'] <= $t['max']))
                && (!isset($t['note']) || $str($t['note'], 300));
            if (!$ok) {
                $e[] = 'Tuition: use {"amount": 5243000, "per": "semester", "cur": "KRW"} or {"min": 2000, "max": 6000, "per": "year", "cur": "USD"}. '
                     . 'per is semester or year; cur must be one of the currencies in Settings → Exchange rates (' . implode(', ', array_keys($rates)) . ').';
            }
        }

        $sch = isset($v['scholarships']) ? json_decode($v['scholarships'], true) : [];
        $ok = is_array($sch) && array_is_list($sch);
        foreach ($ok ? $sch : [] as $x) {
            if (!is_array($x) || !$keysOnly($x, ['label', 'pct', 'scope', 'upTo']) || !$str($x['label'] ?? null, 120) || !$num($x['pct'] ?? null, 0, 100)
                || !in_array($x['scope'] ?? null, ['first', 'all'], true) || (isset($x['upTo']) && !is_bool($x['upTo']))) {
                $ok = false;
            }
        }
        if (!$ok) {
            $e[] = 'Scholarships: a list like [{"label": "IELTS 5.5", "pct": 30, "scope": "first"}]; pct from 0 to 100, scope first or all. Use [] for none.';
        }

        foreach ((array) json_decode((string) ($v['intakes'] ?? '[]'), true) as $slug) {
            if (!preg_match('/^[a-z0-9-]{1,60}$/', (string) $slug)) {
                $e[] = 'Intakes: use the intakes’ address names, one per line (letters, digits and dashes).';
                break;
            }
        }
        return $e;
    }

    /** Non-empty trimmed lines. */
    private static function lines(string $text): array
    {
        return array_values(array_filter(array_map('trim', explode("\n", $text)), static fn ($l) => $l !== ''));
    }

    private static function paragraphs(string $text): array
    {
        return array_values(array_filter(array_map('trim', preg_split('/\n\s*\n/', $text)), static fn ($p) => $p !== ''));
    }

    private static function slugify(string $s): string
    {
        $s = strtolower(trim($s));
        $s = strtr($s, ['’' => '', "'" => '', '&' => 'and']);
        $s = preg_replace('/[^a-z0-9]+/', '-', $s);
        return substr(trim((string) $s, '-'), 0, 60);
    }
}
