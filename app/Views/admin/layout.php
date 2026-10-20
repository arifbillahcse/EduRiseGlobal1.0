<?php
/** @var string $content  @var string $title  @var ?array $user  @var array $flash  @var array $sections */
use App\Core\Csrf;
$b = base_path();
$here = (string) parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
$isAdmin = ($user['role'] ?? '') === 'admin';
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title><?= e($title) ?> | EduRise admin</title>
<link rel="icon" type="image/png" href="<?= e($b) ?>/assets/img/brand/logo-mark.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="<?= e(asset('css/tokens.css')) ?>">
<link rel="stylesheet" href="<?= e(asset('css/panel.css')) ?>">
</head>
<body class="<?= $user ? 'pn' : 'pn pn--auth' ?>">
<?php if ($user): ?>
<aside class="pn-side">
  <a class="pn-brand" href="<?= e($b) ?>/admin">
    <img src="<?= e($b) ?>/assets/img/brand/logo-mark.png" alt="" width="32" height="32">
    <span>EduRise <small>Admin</small></span>
  </a>
  <nav class="pn-nav" aria-label="Admin sections">
    <a href="<?= e($b) ?>/admin" <?= $here === "$b/admin" ? 'aria-current="page"' : '' ?>>Dashboard</a>
    <?php foreach ($sections as $slug => $s): if ($s['admin'] && !$isAdmin) continue; $href = "$b/admin/$slug"; ?>
      <a href="<?= e($href) ?>" <?= str_starts_with($here, $href) ? 'aria-current="page"' : '' ?>>
        <?= e($s['label']) ?><?php if ($s['phase']): ?> <span class="pn-soon">Phase <?= (int) $s['phase'] ?></span><?php endif; ?>
      </a>
    <?php endforeach; ?>
  </nav>
  <div class="pn-me">
    <a href="<?= e($b) ?>/admin/account"><?= e($user['name']) ?></a>
    <span class="pn-role pn-role--<?= e($user['role']) ?>"><?= e(App\Models\AdminUser::ROLES[$user['role']] ?? $user['role']) ?></span>
    <form method="post" action="<?= e($b) ?>/admin/logout"><?= Csrf::field() ?><button class="pn-link" type="submit">Sign out</button></form>
    <a class="pn-link" href="<?= e($b) ?>/" target="_blank" rel="noopener">View website ↗</a>
  </div>
</aside>
<?php endif; ?>
<main class="pn-main" id="main">
  <?php foreach ($flash as $f): ?>
    <div class="pn-alert pn-alert--<?= e($f['type']) ?>" role="status"><?= e($f['message']) ?></div>
  <?php endforeach; ?>
  <?= $content ?>
</main>
</body>
</html>
