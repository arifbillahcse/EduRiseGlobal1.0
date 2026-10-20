<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Database;
use App\Core\Session;
use App\Models\Lead;

/**
 * Enquiries from the website. Editors and Admins see them and keep the
 * status and notes up to date; only Admins delete and export to CSV.
 */
final class LeadController extends BaseController
{
    private const PER_PAGE = 50;

    public static function index(): void
    {
        if (!$u = self::requireUser()) {
            return;
        }
        [$where, $params, $filters] = self::filters();
        $total = (int) Database::value("SELECT COUNT(*) FROM leads $where", $params);
        $pages = max(1, (int) ceil($total / self::PER_PAGE));
        $page = min($pages, max(1, (int) ($_GET['page'] ?? 1)));
        $rows = Database::all("SELECT * FROM leads $where ORDER BY created_at DESC, id DESC LIMIT " . self::PER_PAGE . ' OFFSET ' . (($page - 1) * self::PER_PAGE), $params);
        $counts = array_column(Database::all('SELECT status, COUNT(*) n FROM leads GROUP BY status'), 'n', 'status');
        $failed = (int) Database::value("SELECT COUNT(*) FROM mail_queue WHERE status = 'failed'");
        self::render('leads', [
            'title' => 'Leads', 'user' => $u, 'rows' => $rows, 'total' => $total, 'page' => $page, 'pages' => $pages,
            'filters' => $filters, 'counts' => $counts, 'failed' => $failed, 'isAdmin' => $u['role'] === 'admin',
        ]);
    }

    public static function show(string $id): void
    {
        if (!$u = self::requireUser()) {
            return;
        }
        $lead = self::find($id);
        if (!$lead) {
            self::missing($u);
            return;
        }
        $mails = Database::all('SELECT status, tries, last_error, send_after, updated_at FROM mail_queue WHERE lead_id = ? ORDER BY id DESC', [(int) $lead['id']]);
        $others = Database::all('SELECT id, created_at, source, interest FROM leads WHERE phone = ? AND id <> ? ORDER BY created_at DESC LIMIT 10', [$lead['phone'], (int) $lead['id']]);
        self::render('lead', ['title' => $lead['name'], 'user' => $u, 'lead' => $lead, 'mails' => $mails, 'others' => $others, 'isAdmin' => $u['role'] === 'admin']);
    }

    /** Status and counsellor's note. */
    public static function update(string $id): void
    {
        if (!$u = self::requireUser()) {
            return;
        }
        if (!self::checkCsrf($u)) {
            return;
        }
        $lead = self::find($id);
        if (!$lead) {
            self::missing($u);
            return;
        }
        $status = self::input('status');
        $note = mb_substr(str_replace("\r\n", "\n", (string) ($_POST['admin_note'] ?? '')), 0, 5000);
        if (!isset(Lead::STATUSES[$status])) {
            Session::flash('error', 'Choose a status.');
        } else {
            Database::run('UPDATE leads SET status = ?, admin_note = ? WHERE id = ?', [$status, trim($note) === '' ? null : trim($note), (int) $lead['id']]);
            Session::flash('success', 'Saved.');
        }
        self::redirect('/leads/' . (int) $lead['id']);
    }

    public static function deleteForm(string $id): void
    {
        if (!$u = self::requireAdmin()) {
            return;
        }
        $lead = self::find($id);
        if (!$lead) {
            self::missing($u);
            return;
        }
        self::render('lead-delete', ['title' => 'Delete lead', 'user' => $u, 'lead' => $lead]);
    }

    public static function delete(string $id): void
    {
        if (!$u = self::requireAdmin()) {
            return;
        }
        if (!self::checkCsrf($u)) {
            return;
        }
        $lead = self::find($id);
        if ($lead) {
            Database::run('DELETE FROM mail_queue WHERE lead_id = ?', [(int) $lead['id']]);
            Database::run('DELETE FROM leads WHERE id = ?', [(int) $lead['id']]);
            Session::flash('success', 'Lead deleted, with the emails about it.');
        }
        self::redirect('/leads');
    }

    /**
     * Admin only: the filtered list as CSV for Excel. UTF-8 with a BOM so Bangla
     * shows correctly; any cell that could start a formula (= + - @) is made plain text.
     */
    public static function export(): void
    {
        if (!$u = self::requireAdmin()) {
            return;
        }
        [$where, $params] = self::filters();
        $rows = Database::all("SELECT * FROM leads $where ORDER BY created_at DESC, id DESC", $params);
        $cols = ['created_at' => 'Date', 'name' => 'Name', 'phone' => 'Phone', 'email' => 'Email', 'qualification' => 'Qualification',
                 'country' => 'Country', 'interest' => 'Asked about', 'message' => 'Message', 'source' => 'Form', 'status' => 'Status', 'admin_note' => 'Note'];
        $out = fopen('php://temp', 'w+');
        fwrite($out, "\xEF\xBB\xBF");
        fputcsv($out, array_values($cols), ',', '"', '');
        foreach ($rows as $r) {
            $line = [];
            foreach (array_keys($cols) as $c) {
                $v = (string) ($r[$c] ?? '');
                if ($c === 'status') {
                    $v = Lead::STATUSES[$v] ?? $v;
                } elseif ($c === 'created_at') {
                    $v = substr($v, 0, 16);
                } elseif ($c !== 'phone') {                       // phone is checked digits (+880...), safe as it is
                    $v = self::csvSafe($v);
                }
                $line[] = $v;
            }
            fputcsv($out, $line, ',', '"', '');
        }
        rewind($out);
        $csv = stream_get_contents($out);
        fclose($out);
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="edurise-leads-' . date('Y-m-d') . '.csv"');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        echo $csv;
    }

    /** A value Excel or Google Sheets would read as a formula gets a leading apostrophe. */
    public static function csvSafe(string $v): string
    {
        return preg_match('/^[=+\-@\t\r]/u', $v) ? "'" . $v : $v;
    }

    /* ---------- helpers ---------- */

    /** WHERE clause from ?status=&source=&q= (values are always bound). */
    private static function filters(): array
    {
        $f = [
            'status' => is_string($_GET['status'] ?? null) && isset(Lead::STATUSES[$_GET['status']]) ? $_GET['status'] : '',
            'source' => is_string($_GET['source'] ?? null) && in_array($_GET['source'], Lead::SOURCES, true) ? $_GET['source'] : '',
            'q'      => is_string($_GET['q'] ?? null) ? mb_substr(trim($_GET['q']), 0, 100) : '',
        ];
        $w = [];
        $p = [];
        if ($f['status'] !== '') {
            $w[] = 'status = ?';
            $p[] = $f['status'];
        }
        if ($f['source'] !== '') {
            $w[] = 'source = ?';
            $p[] = $f['source'];
        }
        if ($f['q'] !== '') {
            $like = '%' . addcslashes($f['q'], '%_\\') . '%';
            $digits = preg_replace('/\D/', '', $f['q']);
            $w[] = '(name LIKE ? OR email LIKE ? OR interest LIKE ? OR country LIKE ?' . (strlen($digits) >= 4 ? ' OR phone LIKE ?' : '') . ')';
            array_push($p, $like, $like, $like, $like);
            if (strlen($digits) >= 4) {
                $p[] = '%' . substr($digits, -10) . '%';
            }
        }
        return [$w ? 'WHERE ' . implode(' AND ', $w) : '', $p, $f];
    }

    private static function find(string $id): ?array
    {
        if (!ctype_digit($id)) {
            return null;
        }
        $rows = Database::all('SELECT * FROM leads WHERE id = ?', [(int) $id]);
        return $rows[0] ?? null;
    }

    private static function missing(array $u): void
    {
        self::render('error', ['title' => 'Not found', 'user' => $u, 'status' => 404, 'heading' => 'Lead not found', 'message' => 'It may have been deleted.'], 404);
    }
}
