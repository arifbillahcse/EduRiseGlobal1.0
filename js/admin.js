/* =====================================================================
   admin.js — staff dashboard PREVIEW (Phase 6, Package 2).
   Shows how EduRise staff will manage content without a developer:
   edit, hide/show, reorder and add items. In production this is a
   secure Laravel + Filament admin panel with real logins; here changes
   are saved in this browser only (see store.js).
   ===================================================================== */

/* what each collection looks like in the admin: list columns and edit form fields */
const ADMIN_COLLECTIONS = {
  universities: { label: 'Universities', icon: 'cap', canAdd: false,
    columns: [['name', 'University'], ['city', 'City']],
    fields: [['name', 'University name', 'text'], ['city', 'City', 'text'], ['summary', 'Summary', 'textarea']] },
  intakes: { label: 'Intakes', icon: 'calendar', canAdd: true,
    columns: [['title', 'Intake'], ['round', 'Round'], ['_status', 'Status']],
    fields: [['title', 'Title (university · program)', 'text'], ['dest', 'Country', 'dest'], ['intake', 'Intake', 'text'], ['round', 'Round name', 'text'],
             ['s', 'Applications open', 'date'], ['e', 'Applications close', 'date'], ['tba', 'Dates not announced yet', 'checkbox']],
    blank: { title: '', dest: 'korea', levels: ['Master’s'], intake: '', round: '', tba: true } },
  scholarships: { label: 'Scholarships', icon: 'award', canAdd: false,
    columns: [['university', 'University'], ['award', 'Scholarship']],
    fields: [['university', 'University', 'text'], ['award', 'Scholarship', 'text'], ['condition', 'Condition', 'text']] },
  destinations: { label: 'Destinations', icon: 'globe', canAdd: false,
    columns: [['name', 'Country'], ['code', 'Code']],
    fields: [['name', 'Country name', 'text'], ['intro', 'Introduction', 'textarea']] },
  team: { label: 'Team', icon: 'user', canAdd: false,
    columns: [['name', 'Name'], ['role', 'Role']],
    fields: [['name', 'Name', 'text'], ['role', 'Role', 'text'], ['bio', 'Short bio (homepage)', 'textarea']] },
  testimonials: { label: 'Testimonials', icon: 'check', canAdd: true,
    columns: [['name', 'Student'], ['university', 'University'], ['_consent', 'Consent']],
    fields: [['name', 'Student name', 'text'], ['destination', 'Country', 'text'], ['university', 'University', 'text'], ['program', 'Program', 'text'],
             ['quote', 'Story, in the student’s own words', 'textarea'], ['consent', 'The student gave written consent to publish this', 'checkbox']],
    blank: { name: '', destination: '', university: '', program: '', quote: '', consent: false },
    note: 'A story appears on the homepage only after the consent box is ticked.' },
  news: { label: 'News', icon: 'doc', canAdd: true,
    columns: [['title', 'Title'], ['_date', 'Date']],
    fields: [['title', 'Title', 'text'], ['date', 'Date', 'date'], ['tag', 'Category', 'tag'], ['summary', 'Summary', 'textarea'], ['body', 'Full text', 'textarea']],
    blank: { title: '', date: '', tag: 'Update', summary: '', body: '' } }
};

/* role-based access (demo): which sections each role can open */
const ROLES = {
  admin:      { label: 'Administrator',  sees: Object.keys(ADMIN_COLLECTIONS) },
  editor:     { label: 'Content editor', sees: ['universities', 'intakes', 'scholarships', 'destinations', 'testimonials', 'news'] },
  counsellor: { label: 'Counsellor',     sees: ['intakes', 'scholarships'] }
};

const Admin = (() => {
  let role = null, section = 'dashboard', editing = null;

  /* ---------- sign-in (demo: choose a role, no password) ---------- */
  function renderSignIn() {
    $('#adminApp').innerHTML = `<div class="signin card">
      <div class="signin__brand"><img src="assets/img/brand/logo-mark.png" alt="" width="71" height="40"><div><b>EduRise Global</b><span>Staff dashboard</span></div></div>
      <h1>Sign in</h1>
      <p class="muted">This is a preview. Choose a role to see what each type of staff account can manage. The live panel uses real accounts and passwords.</p>
      <div class="signin__roles">${Object.entries(ROLES).map(([k, r]) => `<button type="button" class="role-btn" data-role="${k}">
        <b>${r.label}</b><span>${r.sees.length === Object.keys(ADMIN_COLLECTIONS).length ? 'All sections' : r.sees.map(s => ADMIN_COLLECTIONS[s].label).join(', ')}</span>${icon('arrow')}</button>`).join('')}</div>
      <a class="link-arrow" href="index.html">${icon('arrow')}Back to the website</a>
    </div>`;
    $$('.role-btn').forEach(b => b.addEventListener('click', () => { role = b.dataset.role; section = 'dashboard'; renderApp(); }));
  }

  /* ---------- shell ---------- */
  function renderApp() {
    const allowed = ROLES[role].sees;
    $('#adminApp').innerHTML = `
      <header class="adm-top">
        <div class="adm-top__brand"><img src="assets/img/brand/logo-mark.png" alt="" width="57" height="32"><b>EduRise</b><span class="pkg pkg--2">Package 2</span></div>
        <div class="adm-top__right">
          <span class="adm-user">${icon('user', 'icon--sm')}${ROLES[role].label}</span>
          <a class="btn btn--ghost btn--sm" href="index.html" target="_blank" rel="noopener">View website</a>
          <button type="button" class="btn btn--ghost btn--sm" id="admSignOut">Sign out</button>
        </div>
      </header>
      <div class="adm">
        <nav class="adm-nav" aria-label="Admin sections">
          <button type="button" class="adm-nav__item" data-section="dashboard">${icon('filter')}Dashboard</button>
          ${allowed.map(k => `<button type="button" class="adm-nav__item" data-section="${k}">${icon(ADMIN_COLLECTIONS[k].icon)}${ADMIN_COLLECTIONS[k].label}</button>`).join('')}
        </nav>
        <main class="adm-main" id="admMain" tabindex="-1"></main>
      </div>`;
    $('#admSignOut').addEventListener('click', () => { role = null; renderSignIn(); });
    $$('.adm-nav__item').forEach(b => b.addEventListener('click', () => { section = b.dataset.section; renderSection(); $('#admMain').focus(); }));
    renderSection();
  }

  function renderSection() {
    $$('.adm-nav__item').forEach(b => b.setAttribute('aria-current', String(b.dataset.section === section)));
    if (section === 'dashboard') renderDashboard(); else renderCollection(section);
  }

  /* ---------- dashboard ---------- */
  function renderDashboard() {
    const intakes = Store.list('intakes').map(i => ({ i, st: windowStatus(i) }));
    const open = intakes.filter(x => x.st.state === 'open' || x.st.state === 'closing');
    const closing = intakes.filter(x => x.st.state === 'closing');
    const stats = [
      ['Open intakes', open.length], ['Closing within 3 days', closing.length],
      ['Universities listed', Store.list('universities').length], ['News posts', Store.list('news').length]
    ];
    const allowed = ROLES[role].sees;
    $('#admMain').innerHTML = `
      <div class="adm-head"><div><h1>Dashboard</h1><p class="muted">Signed in as ${ROLES[role].label}.</p></div>
        ${Store.hasChanges() ? `<button type="button" class="btn btn--ghost btn--sm" id="admReset">Reset demo data</button>` : ''}</div>
      <div class="adm-stats">${stats.map(s => `<div class="adm-stat"><span>${s[0]}</span><b class="tnum">${s[1]}</b></div>`).join('')}</div>
      <div class="adm-grid">
        <section class="card"><h2 class="h3">Needs attention</h2>
          ${closing.length ? `<ul class="adm-list">${closing.map(x => `<li><span>${esc(x.i.title)}</span>${statusChip(x.st)}</li>`).join('')}</ul>` : '<p class="muted">No intakes close in the next 3 days.</p>'}
          ${publishedStories().length === 0 ? `<p class="note">No student stories are published yet, so the homepage hides the testimonials section. Add one with the student’s consent.</p>` : ''}
        </section>
        <section class="card"><h2 class="h3">Content</h2>
          <ul class="adm-list">${allowed.map(k => `<li><button type="button" class="adm-link" data-goto="${k}">${ADMIN_COLLECTIONS[k].label}</button><b class="tnum">${Store.list(k, { withHidden: true }).length}</b></li>`).join('')}</ul>
        </section>
      </div>
      <p class="note">Enquiries go straight to WhatsApp in Package 2, so they are not stored here. A lead list with status tracking is part of Package 3.</p>`;
    $$('[data-goto]').forEach(b => b.addEventListener('click', () => { section = b.dataset.goto; renderSection(); }));
    const reset = $('#admReset');
    if (reset) reset.addEventListener('click', () => { Store.reset(); Toast.show('Demo data reset to the original content.'); renderDashboard(); });
  }

  /* ---------- collection table ---------- */
  function cell(item, key) {
    if (key === '_status') return statusChip(windowStatus(item));
    if (key === '_consent') return item.consent ? '<span class="chip chip--open">Given</span>' : '<span class="chip chip--soon">Missing</span>';
    if (key === '_date') return item.date ? `<span class="tnum">${formatDate(item.date)}</span>` : '—';
    return esc(item[key] || '—');
  }
  function renderCollection(name) {
    const cfg = ADMIN_COLLECTIONS[name];
    const items = Store.list(name, { withHidden: true });
    $('#admMain').innerHTML = `
      <div class="adm-head"><div><h1>${cfg.label}</h1><p class="muted">${items.length} ${items.length === 1 ? 'item' : 'items'}. Changes appear on the website straight away.</p></div>
        ${cfg.canAdd ? `<button type="button" class="btn btn--brand btn--sm" id="admAdd">+ Add ${cfg.label.toLowerCase().replace(/s$/, '')}</button>` : ''}</div>
      ${cfg.note ? `<p class="note">${cfg.note}</p>` : ''}
      ${items.length ? `<div class="card adm-table-card"><div class="table-wrap"><table class="adm-table">
        <thead><tr><th scope="col">Order</th>${cfg.columns.map(c => `<th scope="col">${c[1]}</th>`).join('')}<th scope="col">On website</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
        <tbody>${items.map((it, i) => `<tr class="${it._hidden ? 'is-hidden' : ''}" data-id="${it.id}">
          <td class="adm-order"><button type="button" data-act="up" aria-label="Move up" ${i === 0 ? 'disabled' : ''}>↑</button><button type="button" data-act="down" aria-label="Move down" ${i === items.length - 1 ? 'disabled' : ''}>↓</button></td>
          ${cfg.columns.map((c, ci) => `<td${ci === 0 ? ' class="adm-title"' : ''}>${cell(it, c[0])}</td>`).join('')}
          <td><label class="switch"><input type="checkbox" data-act="visible" ${it._hidden ? '' : 'checked'} aria-label="Show ${esc(it[cfg.columns[0][0]] || 'item')} on the website"><span></span></label></td>
          <td class="adm-actions"><button type="button" class="btn btn--ghost btn--sm" data-act="edit">Edit</button>${it._added ? `<button type="button" class="btn btn--ghost btn--sm adm-del" data-act="delete">Delete</button>` : ''}</td>
        </tr>`).join('')}</tbody></table></div></div>`
      : `<div class="empty">${icon(cfg.icon, 'icon--lg')}<p>No ${cfg.label.toLowerCase()} yet.</p>${cfg.canAdd ? '<p class="muted small">Use the Add button to create the first one.</p>' : ''}</div>`}`;

    const add = $('#admAdd');
    if (add) add.addEventListener('click', () => openEditor(name, null));
    $$('.adm-table [data-act]').forEach(el => {
      const id = el.closest('tr').dataset.id, act = el.dataset.act;
      if (act === 'visible') el.addEventListener('change', () => { Store.setHidden(name, id, !el.checked); Toast.show(el.checked ? 'Shown on the website' : 'Hidden from the website'); renderCollection(name); });
      else el.addEventListener('click', () => {
        if (act === 'up') Store.move(name, id, -1);
        if (act === 'down') Store.move(name, id, 1);
        if (act === 'edit') return openEditor(name, id);
        if (act === 'delete') { Store.remove(name, id); Toast.show('Deleted'); }
        renderCollection(name);
      });
    });
  }

  /* ---------- edit / add form (in a dialog) ---------- */
  function fieldHTML([key, label, type], item) {
    const v = item[key] ?? '';
    const id = 'adm-' + key;
    if (type === 'textarea') return `<div class="field"><label class="field__label" for="${id}">${label}</label><textarea class="field__control" id="${id}" name="${key}" rows="4">${esc(v)}</textarea></div>`;
    if (type === 'checkbox') return `<label class="choice"><input type="checkbox" id="${id}" name="${key}" ${v ? 'checked' : ''}> ${label}</label>`;
    if (type === 'dest') return `<div class="field"><label class="field__label" for="${id}">${label}</label><select class="field__control" id="${id}" name="${key}">${DESTINATIONS.map(d => `<option value="${d.id}" ${d.id === v ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select></div>`;
    if (type === 'tag') return `<div class="field"><label class="field__label" for="${id}">${label}</label><select class="field__control" id="${id}" name="${key}">${['Intake', 'Scholarship', 'Update'].map(t => `<option ${t === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div>`;
    return `<div class="field"><label class="field__label" for="${id}">${label}</label><input class="field__control" id="${id}" name="${key}" type="${type}" value="${esc(v)}"><span class="field__error">This field is required.</span></div>`;
  }
  function openEditor(name, id) {
    const cfg = ADMIN_COLLECTIONS[name];
    const item = id ? Store.get(name, id) : Object.assign({}, cfg.blank);
    editing = { name, id };
    const dlg = $('#admDialog');
    dlg.innerHTML = `<div class="modal__head"><div><span class="eyebrow" style="margin:0 0 6px">${cfg.label}</span><h2>${id ? 'Edit' : 'Add new'}</h2></div>
        <button type="button" class="modal__close" aria-label="Close">${icon('close')}</button></div>
      <form class="modal__body" id="admForm" novalidate>${cfg.fields.map(f => fieldHTML(f, item)).join('')}
        <div class="adm-form-actions"><button type="submit" class="btn btn--brand">Save</button><button type="button" class="btn btn--ghost btn--sm" id="admCancel">Cancel</button></div>
      </form>`;
    $('.modal__close', dlg).addEventListener('click', () => dlg.close());
    $('#admCancel').addEventListener('click', () => dlg.close());
    $('#admForm').addEventListener('input', e => {        // clear the error as soon as the field is filled
      const f = e.target.closest('.field');
      if (f && e.target.value.trim()) f.classList.remove('field--error');
    });
    $('#admForm').addEventListener('submit', e => {
      e.preventDefault();
      const form = e.target, data = {};
      cfg.fields.forEach(([key, , type]) => { const el = form.elements[key]; data[key] = type === 'checkbox' ? el.checked : el.value.trim(); });
      const first = cfg.fields[0][0];
      const titleField = form.elements[first].closest('.field');
      titleField.classList.toggle('field--error', !data[first]);
      if (!data[first]) { form.elements[first].focus(); return; }
      if (name === 'intakes') {                       // a dated intake needs both dates in the right order
        if (!data.tba && (!data.s || !data.e || data.s > data.e)) { Toast.show('Add both dates (open before close), or tick "Dates not announced yet".'); return; }
        if (data.tba) { data.s = ''; data.e = ''; }
      }
      if (editing.id) Store.update(name, editing.id, data);
      else Store.add(name, Object.assign({}, cfg.blank, data));
      dlg.close();
      Toast.show('Saved. Open the website to see the change.');
      renderCollection(name);
    });
    dlg.showModal();
    setTimeout(() => { const f = $('#admForm .field__control, #admForm input', dlg); if (f) f.focus(); }, 30);
  }

  function init() {
    const dlg = document.createElement('dialog');
    dlg.className = 'modal modal--wide';
    dlg.id = 'admDialog';
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    document.body.appendChild(dlg);
    renderSignIn();
  }
  return { init };
})();
