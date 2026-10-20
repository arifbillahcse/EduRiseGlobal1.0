<?php use App\Core\Csrf; use App\Models\Lead; $b = base_path(); $l = $lead;
$digits = ltrim($l['phone'], '+');
$first = explode(' ', $l['name'])[0];
$wa = 'https://wa.me/' . $digits . '?text=' . rawurlencode("Hello $first, this is EduRise Global. Thank you for your enquiry" . ($l['interest'] ? " about {$l['interest']}" : '') . '.');
$rows = ['Phone' => $l['phone'], 'Email' => $l['email'], 'Qualification' => $l['qualification'], 'Country' => $l['country'], 'Asked about' => $l['interest'], 'Form' => $l['source'], 'Sent from' => $l['page'],
         'Received' => date('j M Y, H:i', strtotime($l['created_at'])) . ' (Dhaka time)']; ?>
<header class="pn-head pn-head--row">
  <div><h1><?= e($l['name']) ?></h1><p class="pn-muted"><a href="<?= e("$b/admin/leads") ?>">← All leads</a></p></div>
  <div class="pn-inline">
    <a class="pn-btn" href="<?= e($wa) ?>" target="_blank" rel="noopener">WhatsApp</a>
    <a class="pn-btn pn-btn--ghost" href="tel:<?= e($l['phone']) ?>">Call</a>
    <?php if ($l['email']): ?><a class="pn-btn pn-btn--ghost" href="mailto:<?= e($l['email']) ?>">Email</a><?php endif; ?>
  </div>
</header>
<div class="pn-two">
  <div class="pn-card">
    <dl class="pn-dl">
      <?php foreach ($rows as $k => $v): if ($v === null || $v === '') continue; ?>
        <dt><?= e($k) ?></dt><dd><?= $k === 'Sent from' ? '<a href="' . e($v) . '" target="_blank" rel="noopener">' . e($v) . '</a>' : e((string) $v) ?></dd>
      <?php endforeach; ?>
    </dl>
    <?php if ($l['message']): ?><h2>Message</h2><p class="pn-message"><?= nl2br(e($l['message'])) ?></p><?php endif; ?>
    <p class="pn-muted">Email to EduRise:
      <?php if (!$mails): ?>not sent (no inbox set).
      <?php else: $m = $mails[0]; ?>
        <?= $m['status'] === 'sent' ? 'sent ' . e(date('j M, H:i', strtotime($m['updated_at']))) . '.' : ($m['tries'] >= App\Core\Mailer::MAX_TRIES ? 'failed, no more retries: ' : 'not sent yet, next try ' . e(date('H:i', strtotime($m['send_after']))) . '. Last error: ') . ($m['status'] !== 'sent' ? e((string) $m['last_error']) : '') ?>
      <?php endif; ?></p>
    <?php if ($others): ?>
      <h2>Earlier enquiries from this number</h2>
      <ul class="pn-list"><?php foreach ($others as $o): ?><li><a href="<?= e("$b/admin/leads/" . (int) $o['id']) ?>"><?= e(date('j M Y', strtotime($o['created_at']))) ?></a> · <?= e($o['source']) ?><?= $o['interest'] ? ' · ' . e($o['interest']) : '' ?></li><?php endforeach; ?></ul>
    <?php endif; ?>
  </div>
  <form method="post" action="<?= e("$b/admin/leads/" . (int) $l['id']) ?>" class="pn-card pn-form">
    <?= Csrf::field() ?>
    <label>Status
      <select name="status"><?php foreach (Lead::STATUSES as $k => $label): ?><option value="<?= e($k) ?>" <?= $l['status'] === $k ? 'selected' : '' ?>><?= e($label) ?></option><?php endforeach; ?></select></label>
    <label>Counsellor’s note <span class="pn-muted">(only staff see this)</span>
      <textarea name="admin_note" rows="6"><?= e((string) $l['admin_note']) ?></textarea></label>
    <button class="pn-btn" type="submit">Save</button>
    <?php if ($isAdmin): ?><a class="pn-danger" href="<?= e("$b/admin/leads/" . (int) $l['id'] . '/delete') ?>">Delete this lead</a><?php endif; ?>
  </form>
</div>
