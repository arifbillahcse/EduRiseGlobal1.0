<?php
/**
 * Website routes. $router comes from public_html/index.php.
 * Page addresses stay the same as the static site (about.html ...), so
 * existing links, bookmarks and search results keep working.
 */

declare(strict_types=1);

use App\Controllers\PageController;

$router->get('/', [PageController::class, 'home']);
$router->get('/{page}.html', [PageController::class, 'show']);
$router->get('/study-in-{slug}', [PageController::class, 'studyIn']);
$router->get('/{page}', [PageController::class, 'withoutExtension']);

$router->notFound([PageController::class, 'notFound']);
