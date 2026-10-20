<?php $b = base_path(); $isAdmin = $user['role'] === 'admin'; ?>
<header class="pn-head">
  <h1>Hello, <?= e(strtok($user['name'], ' ')) ?></h1>
  <p class="pn-muted">You are signed in as <?= e(App\Models\AdminUser::ROLES[$user['role']]) ?>.
    <?php if ($user['last_login_at']): ?>Last sign-in: <?= e(date('j M Y, H:i', strtotime($user['last_login_at']))) ?> (Dhaka time).<?php endif; ?></p>
</header>
<div class="pn-grid">
  <?php foreach ($sections as $slug => $s): if ($s['admin'] && !$isAdmin) continue; ?>
    <a class="pn-tile" href="<?= e("$b/admin/$slug") ?>">
      <strong><?= e($s['label']) ?><?php if ($slug === 'leads' && !empty($newLeads)): ?> <span class="pn-count"><?= (int) $newLeads ?> new</span><?php endif; ?></strong>
      <span><?= e($s['note']) ?></span>
      <?php if ($s['phase']): ?><em class="pn-soon">Arrives in Phase <?= (int) $s['phase'] ?></em><?php endif; ?>
    </a>
  <?php endforeach; ?>
</div>
