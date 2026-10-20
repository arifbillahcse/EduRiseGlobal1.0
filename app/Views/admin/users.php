<?php use App\Core\Csrf; use App\Models\AdminUser; $b = base_path(); ?>
<header class="pn-head pn-head--row">
  <div><h1>Users</h1><p class="pn-muted">Admins can do everything. Editors change content, but not settings, offices, policies or users.</p></div>
  <a class="pn-btn" href="<?= e($b) ?>/admin/users/new">Add a user</a>
</header>
<?php if ($link): ?>
  <div class="pn-card pn-card--note">
    <p><strong>Set-password link for <?= e($link['email']) ?></strong> (also emailed). Shown only now; send it privately if the email does not arrive.</p>
    <input class="pn-copy" type="text" readonly value="<?= e($link['url']) ?>" aria-label="Set-password link">
  </div>
<?php endif; ?>
<div class="pn-card pn-card--flush">
  <table class="pn-table">
    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last sign-in</th><th><span class="pn-sr">Actions</span></th></tr></thead>
    <tbody>
    <?php foreach ($users as $row): ?>
      <tr class="<?= $row['is_active'] ? '' : 'is-off' ?>">
        <td><?= e($row['name']) ?><?= (int) $row['id'] === (int) $user['id'] ? ' <span class="pn-muted">(you)</span>' : '' ?></td>
        <td><?= e($row['email']) ?></td>
        <td><span class="pn-role pn-role--<?= e($row['role']) ?>"><?= e(AdminUser::ROLES[$row['role']]) ?></span></td>
        <td><?= $row['is_active'] ? 'Active' : 'Turned off' ?></td>
        <td><?= $row['last_login_at'] ? e(date('j M Y, H:i', strtotime($row['last_login_at']))) : '<span class="pn-muted">Never</span>' ?></td>
        <td class="pn-actions">
          <a href="<?= e($b . '/admin/users/' . (int) $row['id']) ?>">Edit</a>
          <?php if ($row['is_active']): ?>
          <form method="post" action="<?= e($b . '/admin/users/' . (int) $row['id'] . '/link') ?>"><?= Csrf::field() ?><button class="pn-link" type="submit">Send set-password link</button></form>
          <?php endif; ?>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>
