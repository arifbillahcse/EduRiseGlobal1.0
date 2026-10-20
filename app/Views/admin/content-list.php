<?php use App\Core\Csrf; $b = base_path(); $ordered = !isset($section['order']); ?>
<header class="pn-head pn-head--row">
  <div>
    <h1><?= e($section['label']) ?></h1>
    <p class="pn-muted"><?= count($rows) ?> in total<?= isset($section['note']) ? ' · ' . e($section['note']) : '' ?></p>
  </div>
  <?php if ($can['add']): ?><a class="pn-btn" href="<?= e("$b/admin/$key/new") ?>">Add <?= e($section['item']) ?></a><?php endif; ?>
</header>
<div class="pn-card pn-card--flush">
  <table class="pn-table">
    <thead><tr>
      <th><?= e($section['fields'][$section['title']]['label']) ?></th>
      <?php foreach ($section['list'] as $label): ?><th><?= e($label) ?></th><?php endforeach; ?>
      <th>On website</th>
      <th><span class="pn-sr">Actions</span></th>
    </tr></thead>
    <tbody>
    <?php if (!$rows): ?><tr><td colspan="<?= count($section['list']) + 3 ?>" class="pn-muted">Nothing here yet.</td></tr><?php endif; ?>
    <?php foreach ($rows as $i => $r): $id = (int) $r['id']; $base = "$b/admin/$key/$id"; ?>
      <tr class="<?= $r['is_visible'] ? '' : 'is-off' ?>">
        <td><a href="<?= e($base) ?>"><strong><?= e((string) $r[$section['title']]) ?></strong></a></td>
        <?php foreach ($section['list'] as $col => $label):
          $v = $col === 'destination_id' ? ($r['destination_name'] ?? '') : ($r[$col] ?? '');
          if (($section['fields'][$col]['type'] ?? '') === 'check') { $v = $v ? 'Yes' : 'No'; }
          if ($col === 'status') { $v = $v === 'published' ? 'Published' : 'Draft'; } ?>
          <td><?= e((string) $v) ?></td>
        <?php endforeach; ?>
        <td><?= $r['is_visible'] ? '<span class="pn-badge pn-badge--on">Shown</span>' : '<span class="pn-badge">Hidden</span>' ?></td>
        <td class="pn-actions">
          <a href="<?= e($base) ?>">Edit</a>
          <?php if ($can['hide']): ?>
            <form method="post" action="<?= e("$base/visible") ?>"><?= Csrf::field() ?><button class="pn-link" type="submit"><?= $r['is_visible'] ? 'Hide' : 'Show' ?></button></form>
            <?php if ($ordered): ?>
              <form method="post" action="<?= e("$base/move") ?>"><?= Csrf::field() ?><input type="hidden" name="dir" value="up"><button class="pn-icon" type="submit" aria-label="Move up" <?= $i === 0 ? 'disabled' : '' ?>>↑</button></form>
              <form method="post" action="<?= e("$base/move") ?>"><?= Csrf::field() ?><input type="hidden" name="dir" value="down"><button class="pn-icon" type="submit" aria-label="Move down" <?= $i === count($rows) - 1 ? 'disabled' : '' ?>>↓</button></form>
            <?php endif; ?>
          <?php endif; ?>
          <?php if ($can['delete']): ?><a class="pn-danger" href="<?= e("$base/delete") ?>">Delete</a><?php endif; ?>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>
