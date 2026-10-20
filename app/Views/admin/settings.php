<?php use App\Core\Csrf; $b = base_path();
$promoEn = implode("\n", array_column($v['promo'], 'en'));
$promoBn = implode("\n", array_map(static fn ($p) => ($p['bn'] ?? '') === '' ? '-' : $p['bn'], $v['promo'])); ?>
<header class="pn-head"><h1>Settings</h1><p class="pn-muted">Shown across the whole website: header, footer, contact page and WhatsApp buttons.</p></header>
<?php if ($errors): ?><div class="pn-alert pn-alert--error" role="alert"><strong>Not saved yet. Please fix:</strong><?php foreach ($errors as $er): ?><div><?= e($er) ?></div><?php endforeach; ?></div><?php endif; ?>
<form method="post" action="<?= e($b) ?>/admin/settings" class="pn-card pn-edit">
  <?= Csrf::field() ?>
  <div class="pn-row pn-row--head" aria-hidden="true"><span>Contact details</span><span>বাংলা</span></div>
  <?php foreach ($siteFields as $key => [$label, $hasBn, $help]): ?>
  <div class="pn-row<?= $hasBn ? '' : ' pn-row--solo' ?>">
    <div class="pn-field"><label class="pn-label" for="s-<?= e($key) ?>"><?= e($label) ?></label>
      <input id="s-<?= e($key) ?>" type="text" name="site_<?= e($key) ?>" value="<?= e((string) ($v['site'][$key] ?? '')) ?>" maxlength="300">
      <?php if ($help): ?><small class="pn-help"><?= e($help) ?></small><?php endif; ?></div>
    <?php if ($hasBn): ?><div class="pn-field pn-field--bn" lang="bn"><label class="pn-label" for="sb-<?= e($key) ?>"><?= e($label) ?> <span class="pn-muted">বাংলা</span></label>
      <input id="sb-<?= e($key) ?>" type="text" name="bn_<?= e($key) ?>" value="<?= e((string) ($v['site_bn'][$key] ?? '')) ?>" maxlength="300"></div><?php endif; ?>
  </div>
  <?php endforeach; ?>
  <div class="pn-row pn-row--head" aria-hidden="true"><span>Social links</span><span></span></div>
  <?php foreach ($socialFields as $key => $label): ?>
  <div class="pn-row pn-row--solo"><div class="pn-field"><label class="pn-label" for="so-<?= e($key) ?>"><?= e($label) ?></label>
    <input id="so-<?= e($key) ?>" type="url" name="social_<?= e($key) ?>" value="<?= e((string) ($v['site']['social'][$key] ?? '')) ?>" placeholder="https://…"><small class="pn-help">Empty = the icon is shown as “link to be added”.</small></div></div>
  <?php endforeach; ?>
  <div class="pn-row pn-row--head" aria-hidden="true"><span>Promo bar (top of every page)</span><span>বাংলা</span></div>
  <div class="pn-row">
    <div class="pn-field"><label class="pn-label" for="s-promo">Messages, one per line</label><textarea id="s-promo" name="promo" rows="5"><?= e($promoEn) ?></textarea><small class="pn-help">They rotate every few seconds. Keep each under 120 characters.</small></div>
    <div class="pn-field pn-field--bn" lang="bn"><label class="pn-label" for="s-promo-bn">Messages <span class="pn-muted">বাংলা</span></label><textarea id="s-promo-bn" name="promo_bn" rows="5"><?= e($promoBn) ?></textarea><small class="pn-help">Same order, one per line. Write - for a line not translated yet.</small></div>
  </div>
  <div class="pn-row pn-row--head" aria-hidden="true"><span>Exchange rates (1 unit = ? taka)</span><span></span></div>
  <div class="pn-row pn-row--solo"><div class="pn-field">
    <div class="pn-rates"><?php foreach ($v['rates'] as $cur => $rate): ?>
      <label class="pn-label">1 <?= e($cur) ?> = <input type="text" inputmode="decimal" name="rate_<?= e($cur) ?>" value="<?= e((string) $rate) ?>" size="8"> ৳</label>
    <?php endforeach; ?></div>
    <small class="pn-help">Used by the cost estimator and every taka figure. Last updated: <?= e($v['rates_updated'] ?: 'unknown') ?> (updates itself when you change a rate).</small>
  </div></div>
  <div class="pn-row pn-row--solo pn-row--foot"><button class="pn-btn" type="submit">Save settings</button></div>
</form>
