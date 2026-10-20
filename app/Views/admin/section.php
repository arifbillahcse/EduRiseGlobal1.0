<header class="pn-head">
  <h1><?= e($section['label']) ?></h1>
  <p class="pn-muted"><?= e($section['note']) ?></p>
</header>
<div class="pn-card">
  <p><strong>Editing arrives in Phase <?= (int) $section['phase'] ?>.</strong> Until then this content comes from the database import of the current website.</p>
  <?php if ($section['admin']): ?><p class="pn-muted">Only the Admin role can open this section.</p><?php endif; ?>
</div>
