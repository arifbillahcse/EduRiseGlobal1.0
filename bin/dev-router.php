<?php
/**
 * Local development only: lets PHP's built-in server act like the .htaccess.
 *     php -S localhost:8000 -t public_html bin/dev-router.php
 */
$file = __DIR__ . '/../public_html' . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (is_file($file) && !str_ends_with($file, '.php')) {
    return false;                       // css, js, images: served as files
}
require __DIR__ . '/../public_html/index.php';
