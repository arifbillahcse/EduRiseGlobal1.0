<?php use App\Core\Csrf; use App\Models\AdminUser; $b = base_path(); ?>
<div class="pn-card pn-card--auth">
  <?php if ($token === null): ?>
    <h1>This link has expired</h1>
    <p>Set-password links work once and expire after 1 hour (48 hours for a new account). This one has already been used or is too old.</p>
    <p><a class="pn-btn" href="<?= e($b) ?>/admin/forgot">Get a new link</a></p>
  <?php else: ?>
    <h1>Set a new password</h1>
    <?php if ($errors): ?><div class="pn-alert pn-alert--error" role="alert"><?php foreach ($errors as $er): ?><div><?= e($er) ?></div><?php endforeach; ?></div><?php endif; ?>
    <form method="post" action="<?= e($b) ?>/admin/reset" class="pn-form">
      <?= Csrf::field() ?>
      <input type="hidden" name="token" value="<?= e($token) ?>">
      <label>New password <span class="pn-muted">(at least <?= AdminUser::MIN_PASSWORD ?> characters)</span><input type="password" name="password" autocomplete="new-password" minlength="<?= AdminUser::MIN_PASSWORD ?>" required autofocus></label>
      <label>Type it again<input type="password" name="password_confirm" autocomplete="new-password" required></label>
      <button class="pn-btn" type="submit">Save password</button>
    </form>
  <?php endif; ?>
</div>
