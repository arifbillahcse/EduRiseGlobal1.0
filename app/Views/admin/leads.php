<?php use App\Models\Lead; $b = base_path(); $qs = static fn (array $over) => http_build_query(array_filter($over + $filters, static fn ($v) => $v !== '' && $v !== null)); ?>
<header class="pn-head pn-head--row">
  <div>
    <h1>Leads</h1>
    <p class="pn-muted">Enquiries from the website forms. Each one is saved here first, then emailed to EduRise.</p>
  </div>
  <?php if ($isAdmin): ?><a class="pn-btn pn-btn--ghost" href="<?= e("$b/admin/leads/export?" . $qs([])) ?>">Download CSV</a><?php endif; ?>
</header>
<?php if ($failed && $isAdmin): ?>
  <div class="pn-alert pn-alert--error" role="status"><?= (int) $failed ?> email<?= $failed === 1 ? '' : 's' ?> could not be sent yet and will be tried again automatically. The leads are safe here. If this stays, check the email settings in config.php and the send-mail cron job.</div>
<?php endif; ?>
<nav class="pn-tabs" aria-label="Filter by status">
  <a href="<?= e("$b/admin/leads?" . $qs(['status' => '', 'page' => null])) ?>" <?= $filters['status'] === '' ? 'aria-current="page"' : '' ?>>All <span><?= (int) array_sum($counts) ?></span></a>
  <?php foreach (Lead::STATUSES as $k => $label): ?>
    <a href="<?= e("$b/admin/leads?" . $qs(['status' => $k, 'page' => null])) ?>" <?= $filters['status'] === $k ? 'aria-current="page"' : '' ?>><?= e($label) ?> <span><?= (int) ($counts[$k] ?? 0) ?></span></a>
  <?php endforeach; ?>
</nav>
<form method="get" action="<?= e("$b/admin/leads") ?>" class="pn-filter">
  <?php if ($filters['status'] !== ''): ?><input type="hidden" name="status" value="<?= e($filters['status']) ?>"><?php endif; ?>
  <label class="pn-sr" for="lq">Search</label>
  <input id="lq" type="search" name="q" value="<?= e($filters['q']) ?>" placeholder="Name, phone, email or interest">
  <label class="pn-sr" for="ls">Form</label>
  <select id="ls" name="source"><option value="">All forms</option><?php foreach (Lead::SOURCES as $s): ?><option <?= $filters['source'] === $s ? 'selected' : '' ?>><?= e($s) ?></option><?php endforeach; ?></select>
  <button class="pn-btn" type="submit">Search</button>
  <?php if ($filters['q'] !== '' || $filters['source'] !== ''): ?><a href="<?= e("$b/admin/leads?" . http_build_query(array_filter(['status' => $filters['status']]))) ?>">Clear</a><?php endif; ?>
</form>
<div class="pn-card pn-card--flush">
  <table class="pn-table">
    <thead><tr><th>Received</th><th>Name</th><th>Phone</th><th>Asked about</th><th>Form</th><th>Status</th></tr></thead>
    <tbody>
    <?php if (!$rows): ?><tr><td colspan="6" class="pn-muted"><?= $total === 0 && !array_filter($filters) ? 'No enquiries yet. They appear here as soon as someone sends a form on the website.' : 'Nothing matches.' ?></td></tr><?php endif; ?>
    <?php foreach ($rows as $r): ?>
      <tr class="<?= $r['status'] === 'new' ? 'is-new' : '' ?>">
        <td class="pn-nowrap"><?= e(date('j M, H:i', strtotime($r['created_at']))) ?></td>
        <td><a href="<?= e("$b/admin/leads/" . (int) $r['id']) ?>"><strong><?= e($r['name']) ?></strong></a><?= $r['email'] ? '<br><span class="pn-muted">' . e($r['email']) . '</span>' : '' ?></td>
        <td class="pn-nowrap tnum"><?= e($r['phone']) ?></td>
        <td><?= e((string) ($r['interest'] ?: $r['country'] ?: '–')) ?><?= $r['qualification'] ? '<br><span class="pn-muted">' . e($r['qualification']) . '</span>' : '' ?></td>
        <td><?= e($r['source']) ?></td>
        <td><span class="pn-badge pn-status--<?= e($r['status']) ?>"><?= e(Lead::STATUSES[$r['status']] ?? $r['status']) ?></span></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php if ($pages > 1): ?>
<nav class="pn-pager" aria-label="Pages">
  <?php if ($page > 1): ?><a href="<?= e("$b/admin/leads?" . $qs(['page' => $page - 1])) ?>">← Newer</a><?php endif; ?>
  <span class="pn-muted">Page <?= (int) $page ?> of <?= (int) $pages ?> · <?= (int) $total ?> leads</span>
  <?php if ($page < $pages): ?><a href="<?= e("$b/admin/leads?" . $qs(['page' => $page + 1])) ?>">Older →</a><?php endif; ?>
</nav>
<?php endif; ?>
