<?php
/**
 * Website routes. $router comes from public_html/index.php.
 * Page addresses stay the same as the static site (about.html ...), so
 * existing links, bookmarks and search results keep working.
 * Admin routes come first so /admin is never read as a page name.
 */

declare(strict_types=1);

use App\Controllers\Admin\AuthController;
use App\Controllers\Admin\ContentController;
use App\Controllers\Admin\LeadController;
use App\Controllers\Admin\MediaController;
use App\Controllers\Admin\SettingsController;
use App\Controllers\Admin\PanelController;
use App\Controllers\Admin\UserController;
use App\Controllers\EnquiryController;
use App\Controllers\PageController;
use App\Controllers\SeoController;

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
$router->get('/admin/leads', [LeadController::class, 'index']);
$router->get('/admin/leads/export', [LeadController::class, 'export']);
$router->get('/admin/leads/{id}', [LeadController::class, 'show']);
$router->post('/admin/leads/{id}', [LeadController::class, 'update']);
$router->get('/admin/leads/{id}/delete', [LeadController::class, 'deleteForm']);
$router->post('/admin/leads/{id}/delete', [LeadController::class, 'delete']);
$router->get('/admin/media', [MediaController::class, 'index']);
$router->post('/admin/media', [MediaController::class, 'upload']);
$router->post('/admin/media/{id}', [MediaController::class, 'describe']);
$router->get('/admin/media/{id}/delete', [MediaController::class, 'deleteForm']);
$router->post('/admin/media/{id}/delete', [MediaController::class, 'delete']);
$router->get('/admin/settings', [SettingsController::class, 'form']);
$router->post('/admin/settings', [SettingsController::class, 'save']);

/* content sections (destinations, programs, news ...): App\Models\Sections */
$router->get('/admin/{key}', [ContentController::class, 'index']);
$router->get('/admin/{key}/new', [ContentController::class, 'createForm']);
$router->post('/admin/{key}', [ContentController::class, 'store']);
$router->get('/admin/{key}/{id}', [ContentController::class, 'editForm']);
$router->post('/admin/{key}/{id}', [ContentController::class, 'update']);
$router->post('/admin/{key}/{id}/visible', [ContentController::class, 'toggle']);
$router->post('/admin/{key}/{id}/move', [ContentController::class, 'move']);
$router->get('/admin/{key}/{id}/delete', [ContentController::class, 'deleteForm']);
$router->post('/admin/{key}/{id}/delete', [ContentController::class, 'delete']);
$router->get('/admin.html', [PanelController::class, 'legacyDemo']);   // old demo dashboard address

/* ---------- website ---------- */
$router->get('/', [PageController::class, 'home']);
$router->get('/{page}.html', [PageController::class, 'show']);
$router->get('/study-in-{slug}', [PageController::class, 'studyIn']);
$router->get('/program-{slug}', [PageController::class, 'program']);
$router->post('/enquiry', [EnquiryController::class, 'submit']);
$router->get('/sitemap.xml', [SeoController::class, 'sitemap']);
$router->get('/robots.txt', [SeoController::class, 'robots']);
$router->get('/{page}', [PageController::class, 'withoutExtension']);

$router->notFound([PageController::class, 'notFound']);
