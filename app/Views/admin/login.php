<?php use App\Core\Csrf; $b = base_path(); ?>
<div class="pn-card pn-card--auth">
  <img class="pn-auth-logo" src="<?= e($b) ?>/assets/img/brand/logo-mark.png" alt="EduRise Global" width="48" height="48">
  <h1>Sign in to the admin panel</h1>
  <?php if ($error): ?><div class="pn-alert pn-alert--error" role="alert"><?= e($error) ?></div><?php endif; ?>
  <form method="post" action="<?= e($b) ?>/admin/login" class="pn-form">
    <?= Csrf::field() ?>
    <label>Username<input type="text" name="login" value="<?= e($login) ?>" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="190" required autofocus></label>
    <label>Password<input type="password" name="password" autocomplete="current-password" required></label>
    <button class="pn-btn" type="submit">Sign in</button>
  </form>
  <p class="pn-muted"><a href="<?= e($b) ?>/admin/forgot">Forgot your password?</a></p>
</div>
