<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Config;
use App\Core\Database;
use App\Core\Mailer;
use Throwable;

/** Enquiries from the website forms. Saved first; the email to EduRise follows. */
final class Lead
{
    public const STATUSES = ['new' => 'New', 'contacted' => 'Contacted', 'applied' => 'Applied', 'converted' => 'Converted', 'not_interested' => 'Not interested'];
    public const SOURCES = ['home' => 'Homepage form', 'contact' => 'Contact page', 'enquiry' => 'Enquiry form'];

    /**
     * Checks a submitted form. Returns [clean values, errors by field name].
     * The messages match the ones the website shows under each field.
     */
    public static function validate(array $in): array
    {
        $get = static fn (string $k, int $max) => mb_substr(trim((string) preg_replace('/\s+/u', ' ', is_string($in[$k] ?? null) ? $in[$k] : '')), 0, $max + 1);
        $v = [
            'name'          => $get('name', 120),
            'phone'         => self::normalisePhone(is_string($in['phone'] ?? null) ? $in['phone'] : ''),
            'email'         => mb_strtolower($get('email', 190)),
            'qualification' => $get('qual', 60),
            'country'       => $get('country', 120),
            'interest'      => $get('interest', 255),
            'message'       => mb_substr(trim(str_replace("\r\n", "\n", is_string($in['msg'] ?? null) ? $in['msg'] : '')), 0, 2001),
            'source'        => self::SOURCES[$in['source'] ?? ''] ?? 'Website',
        ];
        $e = [];
        if (mb_strlen($v['name']) < 2 || mb_strlen($v['name']) > 120) {
            $e['name'] = 'Enter your full name.';
        }
        if ($v['phone'] === null) {
            $e['phone'] = 'Enter a Bangladeshi mobile number, for example 01712-345678.';
        }
        if ($v['email'] !== '' && (mb_strlen($v['email']) > 190 || !filter_var($v['email'], FILTER_VALIDATE_EMAIL))) {
            $e['email'] = 'Enter a valid email address, or leave it empty.';
        }
        if ($v['qualification'] === '' || mb_strlen($v['qualification']) > 60) {
            $e['qual'] = 'Choose your highest qualification.';
        }
        if (mb_strlen($v['message']) > 2000) {
            $e['msg'] = 'Please keep the message under 2,000 characters.';
        }
        if (mb_strlen($v['country']) > 120 || mb_strlen($v['interest']) > 255) {
            $e['interest'] = 'Please shorten the details.';
        }
        return [$v, $e];
    }

    /** 01712-345678, +880 1712 345678, 8801712345678 -> +8801712345678; anything else -> null */
    public static function normalisePhone(string $raw): ?string
    {
        $d = preg_replace('/[\s\-().]/', '', $raw);
        if (!preg_match('/^(?:\+?880|0)(1[3-9]\d{8})$/', (string) $d, $m)) {
            return null;
        }
        return '+880' . $m[1];
    }

    /** Saves the lead, then emails EduRise. An email problem never loses the lead. */
    public static function create(array $v, ?string $page, string $ipHash): int
    {
        Database::run(
            'INSERT INTO leads (name, phone, email, qualification, country, interest, message, source, page, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [$v['name'], $v['phone'], $v['email'] ?: null, $v['qualification'] ?: null, $v['country'] ?: null, $v['interest'] ?: null,
             $v['message'] ?: null, $v['source'], $page ? mb_substr($page, 0, 255) : null, $ipHash]
        );
        $id = (int) Database::pdo()->lastInsertId();
        try {
            $to = self::inbox();
            if ($to !== null) {
                $about = $v['interest'] ?: $v['country'];
                Mailer::send($to, 'New enquiry: ' . $v['name'] . ($about ? " ($about)" : ''), self::emailBody($id, $v, $page), $v['email'] ?: null, $id);
            } else {
                error_log("EduRise lead #$id: no inbox set for lead emails (mail.lead_to or the email in Settings).");
            }
        } catch (Throwable $e) {
            error_log("EduRise lead #$id saved, email not queued: " . $e->getMessage());
        }
        return $id;
    }

    /** Where lead emails go: mail.lead_to, else the email address in Settings. */
    public static function inbox(): ?string
    {
        $to = (string) Config::get('mail.lead_to', '');
        if (filter_var($to, FILTER_VALIDATE_EMAIL) && !str_starts_with(strtolower($to), 'tbc@')) {
            return $to;
        }
        try {
            $site = json_decode((string) Database::value("SELECT value_json FROM settings WHERE setting_key = 'site'"), true);
            $to = (string) ($site['email'] ?? '');
        } catch (Throwable) {
            return null;
        }
        return filter_var($to, FILTER_VALIDATE_EMAIL) ? $to : null;
    }

    /** Plain text: whatever the student typed stays text. */
    private static function emailBody(int $id, array $v, ?string $page): string
    {
        $wa = 'https://wa.me/' . ltrim($v['phone'], '+');
        $lines = [
            'New enquiry from the website', '',
            'Name:          ' . $v['name'],
            'Phone:         ' . $v['phone'] . "   (WhatsApp: $wa)",
            'Email:         ' . ($v['email'] ?: '-'),
            'Qualification: ' . ($v['qualification'] ?: '-'),
            'Country:       ' . ($v['country'] ?: '-'),
            'Asked about:   ' . ($v['interest'] ?: '-'),
        ];
        if ($v['message'] !== '') {
            $lines[] = '';
            $lines[] = 'Message:';
            $lines[] = $v['message'];
        }
        array_push($lines, '',
            'Form:          ' . $v['source'],
            'Page:          ' . ($page ?: '-'),
            'Received:      ' . date('j M Y, H:i') . ' (Dhaka time)', '',
            'Open in the admin: ' . url("admin/leads/$id"),
            'Reply to this email to answer the student' . ($v['email'] ? '.' : ' (no email given: call or WhatsApp).'));
        return implode("\n", $lines) . "\n";
    }
}
