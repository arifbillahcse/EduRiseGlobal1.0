<?php
/** Shown after a form is sent with JavaScript turned off. @var array $errors @var string $back @var string $first */
$labels = ['name' => 'Full name', 'phone' => 'Phone / WhatsApp', 'email' => 'Email', 'qual' => 'Highest qualification', 'msg' => 'Message', 'interest' => 'Details', 'form' => ''];
$ok = !$errors;
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title><?= $ok ? 'Thank you' : 'Please check the form' ?> | EduRise Global</title>
<link rel="stylesheet" href="<?= e(asset('css/tokens.css')) ?>">
<link rel="stylesheet" href="<?= e(asset('css/base.css')) ?>">
<link rel="stylesheet" href="<?= e(asset('css/components.css')) ?>">
</head>
<body>
<main class="container" style="max-width:640px;padding:12vh 16px">
  <div class="card" style="padding:32px">
    <a href="<?= e(url('')) ?>"><img src="<?= e(url('assets/img/brand/logo-mark.png')) ?>" alt="EduRise Global" width="48" height="48"></a>
    <?php if ($ok): ?>
      <h1 class="h2" style="margin:16px 0 8px">Thank you<?= $first !== '' ? ', ' . e($first) : '' ?></h1>
      <p>Your message has reached EduRise Global. A counsellor will call you soon, usually on the same working day.</p>
      <p><a class="btn btn--go" href="<?= e($back) ?>">Back to the website</a></p>
    <?php else: ?>
      <h1 class="h2" style="margin:16px 0 8px">Please check the form</h1>
      <p>Nothing was sent yet. Go back, fix the following and send again:</p>
      <ul>
        <?php foreach ($errors as $field => $msg): ?>
          <li><?= ($labels[$field] ?? '') !== '' ? '<b>' . e($labels[$field]) . ':</b> ' : '' ?><?= e($msg) ?></li>
        <?php endforeach; ?>
      </ul>
      <p><a class="btn btn--go" href="<?= e($back) ?>">Back to the form</a></p>
    <?php endif; ?>
  </div>
</main>
</body>
</html>
