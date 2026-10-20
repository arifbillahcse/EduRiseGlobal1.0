<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Database;
use App\Core\Session;

/** Admin only: contact details, social links, promo bar and exchange rates. */
final class SettingsController extends BaseController
{
    /** Text settings in SITE: key => [label, has Bangla, help] */
    private const SITE = [
        'phone'            => ['Phone (as shown)', false, 'e.g. +880 1321-216402'],
        'whatsapp'         => ['WhatsApp number', false, 'Digits only, with country code: 8801321216402'],
        'email'            => ['Email', false, ''],
        'address'          => ['Head office address', true, ''],
        'offices'          => ['Offices line in the footer', true, ''],
        'hours'            => ['Opening hours', true, ''],
        'whatsappGreeting' => ['WhatsApp first message', true, 'Pre-filled when a visitor taps the WhatsApp button'],
    ];
    private const SOCIAL = ['facebook' => 'Facebook page', 'instagram' => 'Instagram', 'linkedin' => 'LinkedIn'];

    public static function form(): void
    {
        if (!$u = self::requireAdmin()) {
            return;
        }
        self::show($u, self::current(), [], 200);
    }

    public static function save(): void
    {
        if (!$u = self::requireAdmin()) {
            return;
        }
        if (!self::checkCsrf($u)) {
            return;
        }
        $cur = self::current();
        $errors = [];
        $site = $cur['site'];
        $siteBn = [];
        foreach (self::SITE as $key => [$label, $bn]) {
            $v = self::input("site_$key");
            if (mb_strlen($v) > 300) {
                $errors[] = "$label is too long.";
            }
            $site[$key] = $v;
            if ($bn && self::input("bn_$key") !== '') {
                $siteBn[$key] = self::input("bn_$key");
            }
        }
        if ($site['whatsapp'] !== '' && !preg_match('/^\d{8,15}$/', $site['whatsapp'])) {
            $errors[] = 'WhatsApp number: digits only, with the country code (8 to 15 digits).';
        }
        if ($site['email'] !== '' && !filter_var($site['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Email is not a valid address.';
        }
        $social = [];
        foreach (self::SOCIAL as $key => $label) {
            $v = self::input("social_$key");
            if ($v !== '' && !preg_match('#^https://[^\s"\'<>]+$#', $v)) {
                $errors[] = "$label must be a link starting with https://";
            }
            $social[$key] = $v;
        }
        $site['social'] = $social;

        // promo bar: English lines, Bangla lines in the same order
        $en = array_values(array_filter(array_map('trim', explode("\n", str_replace("\r", '', self::input('promo')))), 'strlen'));
        $bnLines = array_map('trim', explode("\n", str_replace("\r", '', self::input('promo_bn'))));
        $bnLines = array_values(array_filter($bnLines, 'strlen'));
        $promo = [];
        foreach ($en as $i => $m) {
            if (mb_strlen($m) > 200) {
                $errors[] = 'Promo message ' . ($i + 1) . ' is too long (at most 200 characters).';
            }
            $b = $bnLines[$i] ?? '';
            $promo[] = ['en' => $m, 'bn' => $b === '-' ? '' : $b];
        }

        $rates = [];
        foreach ($cur['rates'] as $cur3 => $old) {
            $v = str_replace(',', '', self::input("rate_$cur3"));
            if (!is_numeric($v) || $v <= 0 || $v > 100000) {
                $errors[] = "Rate for $cur3 must be a number above 0.";
                $rates[$cur3] = $v;
                continue;
            }
            $rates[$cur3] = $v + 0;
        }

        $new = ['site' => $site, 'site_bn' => $siteBn, 'promo' => $promo, 'rates' => $rates, 'rates_updated' => $cur['rates_updated']];
        if ($errors) {
            self::show($u, $new, $errors, 422);
            return;
        }
        if ($rates != $cur['rates']) {
            $new['rates_updated'] = date('Y-m-d');
        }
        foreach ($new as $key => $value) {
            Database::run(
                'INSERT INTO settings (setting_key, value_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE value_json = VALUES(value_json)',
                [$key, json_encode($key === 'site_bn' ? (object) $value : $value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]
            );
        }
        Session::flash('success', 'Settings saved. The website shows them now.');
        self::redirect('/settings');
    }

    private static function current(): array
    {
        $s = [];
        foreach (Database::all('SELECT setting_key, value_json FROM settings') as $r) {
            $s[$r['setting_key']] = json_decode($r['value_json'], true);
        }
        return [
            'site' => (array) ($s['site'] ?? []), 'site_bn' => (array) ($s['site_bn'] ?? []),
            'promo' => (array) ($s['promo'] ?? []), 'rates' => (array) ($s['rates'] ?? []),
            'rates_updated' => (string) ($s['rates_updated'] ?? ''),
        ];
    }

    private static function show(array $u, array $v, array $errors, int $status): void
    {
        self::render('settings', ['title' => 'Settings', 'user' => $u, 'v' => $v, 'errors' => $errors,
            'siteFields' => self::SITE, 'socialFields' => self::SOCIAL], $status);
    }
}
