<?php
/**
 * EduRise Global — configuration template.
 *
 * Copy this file to app/config/config.php on each server (local, staging, live)
 * and fill in the real values there. config.php is ignored by Git and must
 * never be committed.
 */

return [
    // local | staging | live
    'env'      => 'local',
    'debug'    => true,                       // must be false on live
    'base_url' => 'http://localhost:8000',   // no trailing slash; https://staging.eduriseglobal.bd on staging
    'timezone' => 'Asia/Dhaka',

    'db' => [
        'host'    => 'localhost',
        'port'    => 3306,
        'name'    => 'edurise_local',          // edurise_staging / edurise_live on cPanel
        'user'    => 'edurise_user',
        'pass'    => 'change-me',
        'charset' => 'utf8mb4',
    ],

    'mail' => [
        'transport'  => 'log',                    // log = write to storage/logs/mail.log (local) · mail = send (staging/live)
        'from_email' => 'noreply@eduriseglobal.bd',
        'from_name'  => 'EduRise Global',
        'smtp_host'  => 'mail.eduriseglobal.bd',
        'smtp_port'  => 465,
        'smtp_user'  => 'noreply@eduriseglobal.bd',
        'smtp_pass'  => 'change-me',
        'lead_to'    => 'TBC@eduriseglobal.bd',  // inbox that receives new leads (EduRise to confirm)
    ],

    'security' => [
        // Long random string, different on every server.
        // Generate with: php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"
        'app_key'        => 'change-me',
        'session_name'   => 'edurise_sid',
        'login_max_tries'=> 5,                   // per 15 minutes, per email and per IP
    ],

    'uploads' => [
        'dir'       => __DIR__ . '/../../public_html/uploads',
        'max_bytes' => 5 * 1024 * 1024,
        'allowed'   => ['image/jpeg', 'image/png', 'image/webp'],
    ],
];
