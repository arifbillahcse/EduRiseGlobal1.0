<?php
/**
 * Website routes. $router comes from public_html/index.php.
 * Page addresses stay the same as the static site (about.html ...), so
 * existing links, bookmarks and search results keep working.
 * Admin routes come first so /admin is never read as a page name.
 */

declare(strict_types=1);

use App\Controllers\Admin\AuthController;
use App\Controllers\Admin\PanelController;
use App\Controllers\Admin\UserController;
use App\Controllers\PageController;

/* ---------- admin panel ---------- */
$router->get('/admin', [PanelController::class, 'dashboard']);
$router->get('/admin/login', [AuthController::class, 'loginForm']);
$router->post('/admin/login', [AuthController::class, 'login']);
$router->post('/admin/logout', [AuthController::class, 'logout']);
$router->get('/admin/forgot', [AuthController::class, 'forgotForm']);
$router->post('/admin/forgot', [AuthController::class, 'forgot']);
$router->get('/admin/reset', [AuthController::class, 'resetForm']);
$router->post('/admin/reset', [AuthController::class, 'reset']);
$router->get('/admin/account', [PanelController::class, 'accountForm']);
$router->post('/admin/account', [PanelController::class, 'account']);
$router->get('/admin/users', [UserController::class, 'index']);
$router->get('/admin/users/new', [UserController::class, 'createForm']);
$router->post('/admin/users', [UserController::class, 'store']);
$router->get('/admin/users/{id}', [UserController::class, 'editForm']);
$router->post('/admin/users/{id}', [UserController::class, 'update']);
$router->post('/admin/users/{id}/link', [UserController::class, 'link']);
$router->get('/admin/{section}', [PanelController::class, 'section']);
$router->get('/admin.html', [PanelController::class, 'legacyDemo']);   // old demo dashboard address

/* ---------- website ---------- */
$router->get('/', [PageController::class, 'home']);
$router->get('/{page}.html', [PageController::class, 'show']);
$router->get('/study-in-{slug}', [PageController::class, 'studyIn']);
$router->get('/{page}', [PageController::class, 'withoutExtension']);

$router->notFound([PageController::class, 'notFound']);
