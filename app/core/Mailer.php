<?php

declare(strict_types=1);

namespace App\Core;

use RuntimeException;
use Throwable;

/**
 * Every email is saved in mail_queue first, then sent. A failed email stays
 * in the queue with its error, and bin/send-mail.php (cron, every 5 minutes)
 * tries again after 5, 15, 60, 180 and 720 minutes.
 *
 *   mail.transport = 'smtp' -> the domain mailbox (mail.smtp_*), the most reliable on cPanel
 *   mail.transport = 'mail' -> PHP mail() (cPanel's Exim)
 *   mail.transport = 'log'  -> written to storage/logs/mail.log (local development)
 *
 * Emails are plain text: whatever a visitor typed arrives as text, never as formatting or links in HTML.
 */
final class Mailer
{
    public const MAX_TRIES = 6;
    private const BACKOFF_MINUTES = [5, 15, 60, 180, 720];

    /** Queues an email and tries to send it now. Returns true if it went out. */
    public static function send(string $to, string $subject, string $body, ?string $replyTo = null, ?int $leadId = null): bool
    {
        if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException("Not a valid recipient: $to");
        }
        $replyTo = $replyTo !== null && filter_var($replyTo, FILTER_VALIDATE_EMAIL) ? $replyTo : null;
        Database::run(
            'INSERT INTO mail_queue (to_email, reply_to, subject, body, lead_id) VALUES (?, ?, ?, ?, ?)',
            [$to, $replyTo, self::oneLine($subject), $body, $leadId]
        );
        $id = (int) Database::pdo()->lastInsertId();
        return self::deliver(Database::all('SELECT * FROM mail_queue WHERE id = ?', [$id])[0]);
    }

    /** Sends queued and failed emails that are due. Used by bin/send-mail.php. */
    public static function processQueue(int $limit = 20): array
    {
        $rows = Database::all(
            "SELECT * FROM mail_queue WHERE status IN ('pending', 'failed') AND tries < ? AND send_after <= NOW() ORDER BY id LIMIT " . max(1, $limit),
            [self::MAX_TRIES]
        );
        $sent = 0;
        foreach ($rows as $row) {
            $sent += self::deliver($row) ? 1 : 0;
        }
        return ['tried' => count($rows), 'sent' => $sent];
    }

    private static function deliver(array $row): bool
    {
        $transport = (string) Config::get('mail.transport', 'log');
        $fromEmail = (string) Config::get('mail.from_email', 'noreply@eduriseglobal.bd');
        try {
            $message = self::message($row, $fromEmail);
            switch ($transport) {
                case 'smtp':
                    $port = (int) Config::get('mail.smtp_port', 465);
                    $secure = (string) Config::get('mail.smtp_secure', $port === 465 ? 'ssl' : ($port === 587 ? 'tls' : 'none'));
                    (new Smtp((string) Config::get('mail.smtp_host'), $port, $secure, (string) Config::get('mail.smtp_user', ''), (string) Config::get('mail.smtp_pass', '')))
                        ->send($fromEmail, $row['to_email'], $message['headers'] . "\r\n\r\n" . $message['body']);
                    break;
                case 'mail':
                    // mail() takes To and Subject separately
                    $headers = preg_replace('/^(To|Subject): .*\r\n/m', '', $message['headers'] . "\r\n");
                    if (!mail($row['to_email'], $message['subject'], $message['body'], rtrim($headers), '-f' . $fromEmail)) {
                        throw new RuntimeException('mail() returned false');
                    }
                    break;
                default:
                    $line = sprintf("----- %s\nTo: %s\n%sSubject: %s\n\n%s\n", date('Y-m-d H:i:s'), $row['to_email'],
                        $row['reply_to'] ? "Reply-To: {$row['reply_to']}\n" : '', $row['subject'], $row['body']);
                    if (file_put_contents(APP_ROOT . '/storage/logs/mail.log', $line, FILE_APPEND | LOCK_EX) === false) {
                        throw new RuntimeException('storage/logs/mail.log is not writable');
                    }
            }
            Database::run("UPDATE mail_queue SET status = 'sent', tries = tries + 1, last_error = NULL WHERE id = ?", [$row['id']]);
            if ($row['lead_id']) {
                Database::run('UPDATE leads SET emailed_at = NOW() WHERE id = ?', [$row['lead_id']]);
            }
            return true;
        } catch (Throwable $e) {
            $tries = (int) $row['tries'] + 1;
            $wait = self::BACKOFF_MINUTES[min($tries - 1, count(self::BACKOFF_MINUTES) - 1)];
            error_log("EduRise mail #{$row['id']} (try $tries): " . $e->getMessage());
            Database::run(
                "UPDATE mail_queue SET status = 'failed', tries = ?, last_error = ?, send_after = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE id = ?",
                [$tries, mb_substr($e->getMessage(), 0, 500), $wait, $row['id']]
            );
            return false;
        }
    }

    /** Headers and a base64 body (safe for Bangla and long lines). */
    private static function message(array $row, string $fromEmail): array
    {
        $fromName = (string) Config::get('mail.from_name', 'EduRise Global');
        $domain = substr(strrchr($fromEmail, '@') ?: '@localhost', 1);
        $subject = self::encode(self::oneLine($row['subject']));
        $h = [
            'Date: ' . date('r'),
            'From: ' . self::encode($fromName) . " <$fromEmail>",
            'To: <' . $row['to_email'] . '>',
        ];
        if (!empty($row['reply_to'])) {
            $h[] = 'Reply-To: <' . $row['reply_to'] . '>';
        }
        array_push($h,
            "Subject: $subject",
            'Message-ID: <' . bin2hex(random_bytes(12)) . "@$domain>",
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: base64',
            'X-Mailer: EduRise'
        );
        return ['headers' => implode("\r\n", $h), 'subject' => $subject, 'body' => rtrim(chunk_split(base64_encode($row['body']), 76, "\r\n"))];
    }

    /** No line breaks in headers (stops header injection). */
    private static function oneLine(string $s): string
    {
        return trim((string) preg_replace('/[\r\n]+/', ' ', $s));
    }

    /** RFC 2047 encoding so Bangla or special characters survive in headers. */
    private static function encode(string $s): string
    {
        return preg_match('/[^\x20-\x7E]/', $s) ? '=?UTF-8?B?' . base64_encode($s) . '?=' : $s;
    }
}
