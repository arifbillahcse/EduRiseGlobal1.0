<?php
/**
 * EduRise Global — bootstrap. Loaded by public_html/index.php and the CLI
 * scripts in bin/. Sets up config, autoloading, error handling and timezone.
 */

declare(strict_types=1);

define('APP_ROOT', dirname(__DIR__));          // folder that holds app/, public_html/, storage/
define('APP_DIR', __DIR__);

/* ---------- autoload: App\Core\Router -> app/core/Router.php ---------- */
spl_autoload_register(static function (string $class): void {
    $map = [
        'App\\Core\\'        => APP_DIR . '/core/',
        'App\\Controllers\\' => APP_DIR . '/Controllers/',
        'App\\Models\\'      => APP_DIR . '/Models/',
    ];
    foreach ($map as $prefix => $dir) {
        if (str_starts_with($class, $prefix)) {
            $file = $dir . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
            if (is_file($file)) {
                require $file;
            }
            return;
        }
    }
});

require APP_DIR . '/Helpers/functions.php';

/* ---------- config ---------- */
$configFile = APP_DIR . '/config/config.php';
if (!is_file($configFile)) {
    http_response_code(500);
    error_log('EduRise: app/config/config.php is missing; copy config.example.php and fill it in.');
    exit(PHP_SAPI === 'cli' ? "Missing app/config/config.php (copy config.example.php).\n" : 'Site configuration missing.');
}
App\Core\Config::load(require $configFile);

// the web root: known to the front controller; command-line scripts read it from config (live: ~/public_html)
define('PUBLIC_DIR', rtrim(defined('WEB_ROOT') ? WEB_ROOT : (string) App\Core\Config::get('public_dir', APP_ROOT . '/public_html'), '/'));

date_default_timezone_set((string) App\Core\Config::get('timezone', 'Asia/Dhaka'));
mb_internal_encoding('UTF-8');

/* ---------- errors: never on screen on live, always in the log ---------- */
App\Core\ErrorHandler::register(
    (bool) App\Core\Config::get('debug', false),
    APP_ROOT . '/storage/logs/php-error.log'
);
