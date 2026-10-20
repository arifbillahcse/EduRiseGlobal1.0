<?php $b = base_path(); ?>
<div class="pn-card <?= $user ? '' : 'pn-card--auth' ?>">
  <h1><?= e($heading) ?></h1>
  <p><?= e($message) ?></p>
  <p><a href="<?= e($b) ?>/admin">Back to the dashboard</a></p>
</div>
