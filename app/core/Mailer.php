<?php

declare(strict_types=1);

namespace App\Core;

use Throwable;

/**
 * Every email is saved in mail_queue first, then sent.
 *   mail.transport = 'mail' -> PHP mail() (cPanel's Exim, signed with the domain's DKIM)
 *   mail.transport = 'log'  -> written to storage/logs/mail.log (local development)
 * Failed sends stay in the queue with the error; a cron job retries them (Phase 5).
 */
final class Mailer
{
    public static function send(string $to, string $subject, string $body): bool
    {
        Database::run(
            'INSERT INTO mail_queue (to_email, subject, body) VALUES (?, ?, ?)',
            [$to, $subject, $body]
        );
        $id = (int) Database::pdo()->lastInsertId();
        return self::deliver($id, $to, $subject, $body);
    }

    private static function deliver(int $id, string $to, string $subject, string $body): bool
    {
        $transport = (string) Config::get('mail.transport', 'log');
        $fromEmail = (string) Config::get('mail.from_email', 'noreply@eduriseglobal.bd');
        $fromName  = (string) Config::get('mail.from_name', 'EduRise Global');

        try {
            if ($transport === 'mail') {
                $headers = [
                    'From'                      => self::encode($fromName) . " <$fromEmail>",
                    'Reply-To'                  => $fromEmail,
                    'MIME-Version'              => '1.0',
                    'Content-Type'              => 'text/plain; charset=UTF-8',
                    'Content-Transfer-Encoding' => '8bit',
                    'X-Mailer'                  => 'EduRise',
                ];
                $ok = mail($to, self::encode($subject), $body, $headers, '-f' . $fromEmail);
                if (!$ok) {
                    throw new \RuntimeException('mail() returned false');
                }
            } else {
                $line = sprintf("----- %s\nTo: %s\nSubject: %s\n\n%s\n", date('Y-m-d H:i:s'), $to, $subject, $body);
                file_put_contents(APP_ROOT . '/storage/logs/mail.log', $line, FILE_APPEND | LOCK_EX);
            }
            Database::run("UPDATE mail_queue SET status = 'sent', tries = tries + 1, last_error = NULL WHERE id = ?", [$id]);
            return true;
        } catch (Throwable $e) {
            error_log('EduRise mail: ' . $e->getMessage());
            Database::run(
                "UPDATE mail_queue SET status = 'failed', tries = tries + 1, last_error = ?, send_after = DATE_ADD(NOW(), INTERVAL 5 MINUTE) WHERE id = ?",
                [mb_substr($e->getMessage(), 0, 500), $id]
            );
            return false;
        }
    }

    /** RFC 2047 encoding so Bangla or special characters survive in headers. */
    private static function encode(string $s): string
    {
        return preg_match('/[^\x20-\x7E]/', $s) ? '=?UTF-8?B?' . base64_encode($s) . '?=' : $s;
    }
}
