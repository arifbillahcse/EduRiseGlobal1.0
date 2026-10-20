<?php use App\Core\Csrf; $b = base_path(); $name = (string) $row[$section['title']]; ?>
<header class="pn-head">
  <h1>Delete “<?= e($name) ?>”?</h1>
  <p class="pn-muted"><a href="<?= e("$b/admin/$key") ?>">← All <?= e(mb_strtolower($section['label'])) ?></a></p>
</header>
<div class="pn-card">
  <?php if ($dependants): ?>
    <p><strong>This <?= e($section['item']) ?> cannot be deleted yet.</strong> These still belong to it:</p>
    <ul><?php foreach ($dependants as $label => $n): ?><li><?= (int) $n ?> <?= e($label) ?></li><?php endforeach; ?></ul>
    <p>Hide it instead, so it disappears from the website but nothing is lost.</p>
  <?php else: ?>
    <p>Deleting cannot be undone. To take it off the website but keep it, use <strong>Hide</strong> instead.</p>
    <form method="post" action="<?= e("$b/admin/$key/" . (int) $row['id'] . '/delete') ?>" class="pn-inline">
      <?= Csrf::field() ?>
      <button class="pn-btn pn-btn--danger" type="submit">Delete permanently</button>
      <a href="<?= e("$b/admin/$key") ?>">Cancel</a>
    </form>
  <?php endif; ?>
</div>
