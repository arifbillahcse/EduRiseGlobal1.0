<?php
/**
 * EduRise Global — send queued emails again (failed or not yet sent).
 * cPanel → Cron Jobs, every 5 minutes:
 *     php /home/<user>/staging/bin/send-mail.php >/dev/null 2>&1
 * Only one copy runs at a time.
 */

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require dirname(__DIR__) . '/app/bootstrap.php';

$lock = fopen(APP_ROOT . '/storage/cache/send-mail.lock', 'c');
if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) {
    exit("Another send-mail is still running.\n");
}
$r = App\Core\Mailer::processQueue(50);
echo date('Y-m-d H:i:s') . " tried {$r['tried']}, sent {$r['sent']}\n";
flock($lock, LOCK_UN);
