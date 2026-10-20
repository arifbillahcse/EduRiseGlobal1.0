<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Config;
use App\Core\FormToken;
use App\Models\Lead;
use Throwable;

/**
 * POST /enquiry — the homepage form, the contact form and the enquiry dialog.
 * Answers JSON to the page script, or a small HTML page when JavaScript is off.
 *
 * Order of checks: same site → rate limit → honeypot → form stamp → bot check
 * (Turnstile) → fields. Bots caught by the honeypot or the speed check get a
 * normal "thank you", so they learn nothing; nothing is saved.
 */
final class EnquiryController
{
    private const PER_MINUTE = 5;
    private const PER_HOUR = 20;

    public static function submit(): void
    {
        $json = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');

        if (!self::sameSite()) {
            self::reply($json, 403, ['form' => 'This form can only be sent from the EduRise website.']);
            return;
        }
        if (Auth::tooMany('lead', self::PER_MINUTE, 1) || Auth::tooMany('lead-hour', self::PER_HOUR, 60)) {
            self::reply($json, 429, ['form' => 'Too many messages from this connection. Please wait a minute, or message us on WhatsApp.']);
            return;
        }
        if (trim((string) ($_POST['website'] ?? '')) !== '') {
            self::reply($json, 200);                       // honeypot filled: a bot
            return;
        }
        $age = FormToken::age((string) ($_POST['ft'] ?? ''));
        if ($age === null || $age > FormToken::MAX_SECONDS) {
            self::reply($json, 400, ['form' => 'This page is too old to send. Please reload the page and send the form again.']);
            return;
        }
        if ($age < FormToken::MIN_SECONDS) {
            self::reply($json, 200);                       // sent faster than a person can type: a bot
            return;
        }
        if (!self::turnstileOk()) {
            self::reply($json, 400, ['form' => 'Please complete the “I am human” check above the button, then send again.']);
            return;
        }

        [$values, $errors] = Lead::validate($_POST);
        if ($errors) {
            self::reply($json, 422, $errors);
            return;
        }
        $page = self::page();
        $id = Lead::create($values, $page, Auth::ipHash());
        self::reply($json, 200, [], $values, $id);
    }

    /** A browser sending from another website gives itself away in Origin / Sec-Fetch-Site. */
    private static function sameSite(): bool
    {
        if (($_SERVER['HTTP_SEC_FETCH_SITE'] ?? 'same-origin') === 'cross-site') {
            return false;
        }
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin === '' || $origin === 'null') {
            return $origin === '';                         // no Origin (old browsers) is allowed; "null" is not
        }
        $mine = parse_url((string) Config::get('base_url'), PHP_URL_HOST);
        $host = $_SERVER['HTTP_HOST'] ?? '';
        $theirs = parse_url($origin, PHP_URL_HOST);
        return $theirs === $mine || $theirs === preg_replace('/:\d+$/', '', $host);
    }

    /** Cloudflare Turnstile, when keys are set in config. */
    private static function turnstileOk(): bool
    {
        $secret = (string) Config::get('turnstile.secret_key', '');
        if ($secret === '') {
            return true;
        }
        $token = (string) ($_POST['cf-turnstile-response'] ?? '');
        if ($token === '' || strlen($token) > 2048) {
            return false;
        }
        try {
            $ch = curl_init((string) Config::get('turnstile.verify_url', 'https://challenges.cloudflare.com/turnstile/v0/siteverify'));
            curl_setopt_array($ch, [
                CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8,
                CURLOPT_POSTFIELDS => http_build_query(['secret' => $secret, 'response' => $token, 'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '']),
            ]);
            $out = json_decode((string) curl_exec($ch), true);
            curl_close($ch);
            return is_array($out) && ($out['success'] ?? false) === true;
        } catch (Throwable $e) {
            error_log('EduRise Turnstile: ' . $e->getMessage());
            return false;                                   // fail closed: the visitor can still use WhatsApp
        }
    }

    /** The page the form was sent from, if it is on this site. */
    private static function page(): ?string
    {
        $ref = (string) ($_SERVER['HTTP_REFERER'] ?? '');
        $mine = rtrim((string) Config::get('base_url'), '/');
        return str_starts_with($ref, $mine) ? strtok($ref, '?#') : null;
    }

    /** JSON for the page script, or a small page for browsers without JavaScript. */
    private static function reply(bool $json, int $status, array $errors = [], array $values = [], ?int $id = null): void
    {
        http_response_code($status);
        header('Cache-Control: no-store');
        if ($json) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['ok' => !$errors, 'errors' => (object) $errors], JSON_UNESCAPED_UNICODE);
            return;
        }
        header('Content-Type: text/html; charset=utf-8');
        $back = self::page() ?? url('contact.html');
        $first = $values ? explode(' ', $values['name'])[0] : '';
        require APP_DIR . '/Views/form-result.php';
    }
}
