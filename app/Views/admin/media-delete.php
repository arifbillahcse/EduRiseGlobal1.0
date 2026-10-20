<?php use App\Core\Csrf; $b = base_path(); ?>
<header class="pn-head"><h1>Delete this image?</h1><p class="pn-muted"><a href="<?= e($b) ?>/admin/media">← Media</a></p></header>
<div class="pn-card">
  <p><code class="pn-code"><?= e($m['path']) ?></code></p>
  <?php if ($usedIn): ?>
    <p><strong>It cannot be deleted:</strong> it is used in <?= e(implode(', ', $usedIn)) ?>. Choose another image there first.</p>
  <?php else: ?>
    <p>The file is removed from the server. This cannot be undone.</p>
    <form method="post" action="<?= e($b . '/admin/media/' . (int) $m['id'] . '/delete') ?>" class="pn-inline"><?= Csrf::field() ?>
      <button class="pn-btn pn-btn--danger" type="submit">Delete permanently</button> <a href="<?= e($b) ?>/admin/media">Cancel</a></form>
  <?php endif; ?>
</div>
