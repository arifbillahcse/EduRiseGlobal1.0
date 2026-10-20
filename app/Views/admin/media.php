<?php use App\Core\Csrf; use App\Core\Upload; $b = base_path(); ?>
<header class="pn-head">
  <h1>Media</h1>
  <p class="pn-muted">Images uploaded for the website. Only JPG, PNG and WebP up to 5 MB. Each image is checked, cleaned and given a random file name.</p>
</header>
<form method="post" action="<?= e($b) ?>/admin/media" enctype="multipart/form-data" class="pn-card pn-upload">
  <?= Csrf::field() ?>
  <input type="hidden" name="MAX_FILE_SIZE" value="<?= Upload::MAX_BYTES ?>">
  <div class="pn-field"><label class="pn-label" for="m-file">Image</label><input id="m-file" type="file" name="file" accept="image/jpeg,image/png,image/webp" required></div>
  <div class="pn-field"><label class="pn-label" for="m-alt">Description (alt text)</label><input id="m-alt" type="text" name="alt" maxlength="255" placeholder="What the image shows"></div>
  <button class="pn-btn" type="submit">Upload</button>
</form>
<?php if (!$rows): ?>
  <p class="pn-muted">No images uploaded yet. Photos already on the website live in assets/ and are not listed here.</p>
<?php else: ?>
<div class="pn-media">
  <?php foreach ($rows as $m): ?>
  <figure>
    <img src="<?= e($b . '/' . $m['path']) ?>" alt="<?= e((string) $m['alt_en']) ?>" loading="lazy" width="<?= (int) $m['width'] ?>" height="<?= (int) $m['height'] ?>">
    <figcaption>
      <code class="pn-code"><?= e($m['path']) ?></code>
      <span class="pn-muted"><?= (int) $m['width'] ?> × <?= (int) $m['height'] ?> · <?= e(number_format($m['size_bytes'] / 1024)) ?> KB · <?= e((string) ($m['uploader'] ?? '')) ?></span>
      <span class="pn-muted"><?= $m['used_in'] ? 'Used in: ' . e(implode(', ', $m['used_in'])) : 'Not used yet' ?></span>
      <form method="post" action="<?= e($b . '/admin/media/' . (int) $m['id']) ?>"><?= Csrf::field() ?>
        <input type="text" name="alt" value="<?= e((string) $m['alt_en']) ?>" maxlength="255" aria-label="Description"><button class="pn-link" type="submit">Save</button></form>
      <?php if ($isAdmin && !$m['used_in']): ?><a class="pn-danger" href="<?= e($b . '/admin/media/' . (int) $m['id'] . '/delete') ?>">Delete</a><?php endif; ?>
    </figcaption>
  </figure>
  <?php endforeach; ?>
</div>
<?php endif; ?>
