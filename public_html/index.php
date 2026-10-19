<?php
/**
 * EduRise Global — front controller. Every request that is not a real file
 * (css, js, images) comes here; see .htaccess.
 */

declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';

App\Core\Response::securityHeaders();

$router = new App\Core\Router();
require APP_DIR . '/routes.php';
$router->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', App\Core\Router::currentPath());
