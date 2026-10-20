<?php
use App\Core\Csrf;
use App\Core\Upload;
$b = base_path();
$action = $row ? "$b/admin/$key/" . (int) $row['id'] : "$b/admin/$key";
$hasFile = in_array('image', array_column($section['fields'], 'type'), true);
$imgSrc = static fn (string $p) => preg_match('#^https://#', $p) ? $p : "$b/$p";
?>
<header class="pn-head pn-head--row">
  <div>
    <h1><?= $row ? e((string) $row[$section['title']]) : 'Add ' . e($section['item']) ?></h1>
    <p class="pn-muted"><a href="<?= e("$b/admin/$key") ?>">← All <?= e(mb_strtolower($section['label'])) ?></a>
      <?php if ($view): ?> · <a href="<?= e("$b/$view") ?>" target="_blank" rel="noopener">View on website ↗</a><?php endif; ?></p>
  </div>
</header>
<?php if ($errors): ?>
  <div class="pn-alert pn-alert--error" role="alert"><strong>Not saved yet. Please fix:</strong><?php foreach ($errors as $er): ?><div><?= e($er) ?></div><?php endforeach; ?></div>
<?php endif; ?>
<form method="post" action="<?= e($action) ?>" class="pn-card pn-edit"<?= $hasFile ? ' enctype="multipart/form-data"' : '' ?>>
  <?= Csrf::field() ?>
  <?php if ($hasFile): ?><input type="hidden" name="MAX_FILE_SIZE" value="<?= Upload::MAX_BYTES ?>"><?php endif; ?>
  <div class="pn-row pn-row--head" aria-hidden="true"><span>English</span><span>বাংলা <small>(optional; shown when visitors choose বাংলা)</small></span></div>

  <?php foreach ($section['fields'] as $name => $f):
    if (!empty($f['admin']) && !$isAdmin) { continue; }
    if ($f['type'] === 'slug' && $row) { ?>
      <div class="pn-row"><div class="pn-field"><span class="pn-label"><?= e($f['label']) ?></span><code class="pn-code"><?= e((string) $row['slug']) ?></code></div></div>
    <?php continue; }
    $id = 'f-' . $name; $val = $form[$name] ?? ''; $req = !empty($f['required']) ? ' required' : '';
    $help = isset($f['help']) ? '<small class="pn-help" id="' . e($id) . '-h">' . e($f['help']) . '</small>' : '';
    $desc = isset($f['help']) ? ' aria-describedby="' . e($id) . '-h"' : '';
    $multi = in_array($f['type'], ['textarea', 'lines', 'pairs', 'paragraphs', 'json'], true);
    $rows = $f['rows'] ?? ($f['type'] === 'json' ? 5 : ($f['type'] === 'paragraphs' || $f['type'] === 'textarea' ? 6 : 4));
  ?>
  <div class="pn-row<?= empty($f['bn']) ? ' pn-row--solo' : '' ?>">
    <div class="pn-field">
      <?php if ($f['type'] === 'check'): ?>
        <label class="pn-check"><input type="checkbox" name="<?= e($name) ?>" value="1" <?= $val ? 'checked' : '' ?>> <?= e($f['label']) ?></label>
      <?php elseif ($f['type'] === 'levels'): ?>
        <fieldset class="pn-choice pn-choice--wrap"><legend><?= e($f['label']) ?></legend>
          <?php foreach ($levels as $lv): ?><label><input type="checkbox" name="<?= e($name) ?>[]" value="<?= e($lv) ?>" <?= in_array($lv, (array) $val, true) ? 'checked' : '' ?>> <?= e($lv) ?></label><?php endforeach; ?>
        </fieldset>
      <?php else: ?>
        <label for="<?= e($id) ?>" class="pn-label"><?= e($f['label']) ?><?= $req ? ' <span class="pn-req" aria-hidden="true">*</span>' : '' ?></label>
        <?php if ($f['type'] === 'destination'): ?>
          <select id="<?= e($id) ?>" name="<?= e($name) ?>"<?= $req ?>>
            <option value="">Choose a country</option>
            <?php foreach ($destinations as $did => $dname): ?><option value="<?= (int) $did ?>" <?= (string) $did === (string) $val ? 'selected' : '' ?>><?= e($dname) ?></option><?php endforeach; ?>
          </select>
        <?php elseif ($f['type'] === 'select'): ?>
          <select id="<?= e($id) ?>" name="<?= e($name) ?>"<?= $desc ?>>
            <?php foreach ($f['options'] as $ov => $ol): ?><option value="<?= e((string) $ov) ?>" <?= (string) $ov === (string) $val ? 'selected' : '' ?>><?= e($ol) ?></option><?php endforeach; ?>
          </select>
        <?php elseif ($multi): ?>
          <textarea id="<?= e($id) ?>" name="<?= e($name) ?>" rows="<?= (int) $rows ?>"<?= $req . $desc ?><?= $f['type'] === 'json' ? ' class="pn-mono" spellcheck="false"' : '' ?>><?= e((string) $val) ?></textarea>
        <?php elseif ($f['type'] === 'image'): ?>
          <div class="pn-image">
            <?php if ($val !== '' && Upload::validPath((string) $val)): ?><img src="<?= e($imgSrc((string) $val)) ?>" alt="" loading="lazy"><?php endif; ?>
            <div>
              <input id="<?= e($id) ?>" type="text" name="<?= e($name) ?>" value="<?= e((string) $val) ?>" placeholder="uploads/… or https://…"<?= $desc ?>>
              <label class="pn-file">Upload a new image (JPG, PNG or WebP, up to 5 MB)
                <input type="file" name="<?= e($name) ?>_file" accept="image/jpeg,image/png,image/webp"></label>
            </div>
          </div>
        <?php else:
          $type = ['date' => 'date', 'url' => 'url', 'number' => 'number'][$f['type']] ?? 'text'; ?>
          <input id="<?= e($id) ?>" type="<?= $type ?>" name="<?= e($name) ?>" value="<?= e((string) $val) ?>"<?= $req . $desc ?><?= isset($f['max']) && $type === 'text' ? ' maxlength="' . (int) $f['max'] . '"' : '' ?><?= $type === 'number' ? ' step="0.01"' : '' ?>>
        <?php endif; ?>
      <?php endif; ?>
      <?= $help ?>
    </div>
    <?php if (!empty($f['bn'])): $bv = $form['bn'][$name] ?? ''; $bid = 'bn-' . $name; ?>
    <div class="pn-field pn-field--bn" lang="bn">
      <label for="<?= e($bid) ?>" class="pn-label"><?= e($f['label']) ?> <span class="pn-muted">বাংলা</span></label>
      <?php if ($multi): ?>
        <textarea id="<?= e($bid) ?>" name="bn[<?= e($name) ?>]" rows="<?= (int) $rows ?>"><?= e((string) $bv) ?></textarea>
        <?php if (in_array($f['type'], ['lines', 'pairs'], true)): ?><small class="pn-help">Same order as the English, one per line. Write - for a line not translated yet.</small><?php endif; ?>
      <?php else: ?>
        <input id="<?= e($bid) ?>" type="text" name="bn[<?= e($name) ?>]" value="<?= e((string) $bv) ?>">
      <?php endif; ?>
    </div>
    <?php endif; ?>
  </div>
  <?php endforeach; ?>

  <div class="pn-row pn-row--solo pn-row--foot">
    <?php if ($can['hide']): ?>
      <label class="pn-check"><input type="checkbox" name="is_visible" value="1" <?= ($form['is_visible'] ?? 1) ? 'checked' : '' ?>> Show on website</label>
    <?php endif; ?>
    <button class="pn-btn" type="submit"><?= $row ? 'Save changes' : 'Add ' . e($section['item']) ?></button>
  </div>
</form>
