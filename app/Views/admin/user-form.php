<?php use App\Core\Csrf; use App\Models\AdminUser; $b = base_path(); $action = $edit ? "$b/admin/users/" . (int) $edit['id'] : "$b/admin/users"; ?>
<header class="pn-head">
  <h1><?= $edit ? 'Edit ' . e($edit['name']) : 'Add a user' ?></h1>
  <p class="pn-muted"><a href="<?= e($b) ?>/admin/users">← All users</a></p>
</header>
<div class="pn-card">
  <?php if ($errors): ?><div class="pn-alert pn-alert--error" role="alert"><?php foreach ($errors as $er): ?><div><?= e($er) ?></div><?php endforeach; ?></div><?php endif; ?>
  <form method="post" action="<?= e($action) ?>" class="pn-form">
    <?= Csrf::field() ?>
    <label>Name<input type="text" name="name" value="<?= e($form['name']) ?>" maxlength="120" required></label>
    <label>Username <span class="pn-muted">(for signing in: 3–40 characters, a–z, 0–9, dot, dash or underscore)</span><input type="text" name="username" value="<?= e($form['username'] ?? '') ?>" maxlength="40" pattern="[a-zA-Z0-9][a-zA-Z0-9._\-]{2,39}" autocapitalize="none" spellcheck="false" autocomplete="off" required></label>
    <?php if ($edit): ?>
      <p><span class="pn-label">Email</span><?= e($edit['email']) ?></p>
    <?php else: ?>
      <label>Email<input type="email" name="email" value="<?= e($form['email']) ?>" required></label>
    <?php endif; ?>
    <fieldset class="pn-choice">
      <legend>Role</legend>
      <?php foreach (AdminUser::ROLES as $k => $label): ?>
        <label><input type="radio" name="role" value="<?= e($k) ?>" <?= $form['role'] === $k ? 'checked' : '' ?>> <?= e($label) ?></label>
      <?php endforeach; ?>
    </fieldset>
    <?php if ($edit): ?>
      <label class="pn-check"><input type="checkbox" name="is_active" value="1" <?= $form['is_active'] ? 'checked' : '' ?>> Can sign in (untick to turn the account off)</label>
    <?php else: ?>
      <p class="pn-muted">They get an email with a link to set their own password (valid 48 hours).</p>
    <?php endif; ?>
    <button class="pn-btn" type="submit"><?= $edit ? 'Save' : 'Add user' ?></button>
  </form>
</div>
