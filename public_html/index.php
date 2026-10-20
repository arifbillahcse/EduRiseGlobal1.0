<?php
/**
 * EduRise Global — front controller. Every request that is not a real file
 * (css, js, images) comes here; see .htaccess.
 */

declare(strict_types=1);

define('WEB_ROOT', __DIR__);
// staging and local: app/ sits beside public_html; live: in ~/edurise beside ~/public_html
foreach ([dirname(__DIR__) . '/app', dirname(__DIR__) . '/edurise/app'] as $app) {
    if (is_file("$app/bootstrap.php")) {
        require "$app/bootstrap.php";
        break;
    }
}
if (!defined('APP_DIR')) {
    http_response_code(500);
    exit('Site files incomplete.');
}

App\Core\Response::securityHeaders();
if (!App\Core\Access::guard()) {                // staging: whole-site password (config.php → access)
    exit;
}

$router = new App\Core\Router();
require APP_DIR . '/routes.php';
$router->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', App\Core\Router::currentPath());
