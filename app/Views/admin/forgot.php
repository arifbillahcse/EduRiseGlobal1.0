<?php use App\Core\Csrf; $b = base_path(); ?>
<div class="pn-card pn-card--auth">
  <h1>Forgot your password?</h1>
  <?php if ($sent): ?>
    <div class="pn-alert pn-alert--success" role="status">If that email belongs to an admin account, a link to set a new password is on its way. The link works once and expires in 1 hour.</div>
    <p class="pn-muted">No email after a few minutes? Check the spam folder, or ask an Admin to send you a new link.</p>
  <?php else: ?>
    <p>Enter the email you sign in with. We will send you a link to set a new password.</p>
    <form method="post" action="<?= e($b) ?>/admin/forgot" class="pn-form">
      <?= Csrf::field() ?>
      <label>Email<input type="email" name="email" autocomplete="username" required autofocus></label>
      <button class="pn-btn" type="submit">Send the link</button>
    </form>
  <?php endif; ?>
  <p class="pn-muted"><a href="<?= e($b) ?>/admin/login">Back to sign in</a></p>
</div>
