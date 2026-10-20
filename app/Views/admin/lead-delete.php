<?php use App\Core\Csrf; $b = base_path(); ?>
<header class="pn-head"><h1>Delete the lead from <?= e($lead['name']) ?>?</h1><p class="pn-muted"><a href="<?= e("$b/admin/leads/" . (int) $lead['id']) ?>">← Back to the lead</a></p></header>
<div class="pn-card">
  <p>The enquiry and the emails about it are removed for good. Do this when the student asks for their details to be deleted, or for spam.</p>
  <form method="post" action="<?= e("$b/admin/leads/" . (int) $lead['id'] . '/delete') ?>" class="pn-inline"><?= Csrf::field() ?>
    <button class="pn-btn pn-btn--danger" type="submit">Delete permanently</button> <a href="<?= e("$b/admin/leads") ?>">Cancel</a></form>
</div>
