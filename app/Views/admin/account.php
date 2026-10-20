<?php use App\Core\Csrf; use App\Models\AdminUser; $b = base_path(); ?>
<header class="pn-head">
  <h1>My account</h1>
  <p class="pn-muted"><?= e($user['name']) ?> · <?= e($user['email']) ?> · <?= e(AdminUser::ROLES[$user['role']]) ?></p>
</header>
<div class="pn-card">
  <h2>Change password</h2>
  <?php if ($errors): ?><div class="pn-alert pn-alert--error" role="alert"><?php foreach ($errors as $er): ?><div><?= e($er) ?></div><?php endforeach; ?></div><?php endif; ?>
  <form method="post" action="<?= e($b) ?>/admin/account" class="pn-form">
    <?= Csrf::field() ?>
    <input type="text" name="username" value="<?= e($user['email']) ?>" autocomplete="username" hidden>
    <label>Current password<input type="password" name="current_password" autocomplete="current-password" required></label>
    <label>New password <span class="pn-muted">(at least <?= AdminUser::MIN_PASSWORD ?> characters)</span><input type="password" name="password" autocomplete="new-password" minlength="<?= AdminUser::MIN_PASSWORD ?>" required></label>
    <label>Type it again<input type="password" name="password_confirm" autocomplete="new-password" required></label>
    <button class="pn-btn" type="submit">Change password</button>
  </form>
  <p class="pn-muted">Changing your password signs out every other device that uses your account.</p>
</div>
