/* =====================================================================
   store.js — the content layer between data.js and the pages (Phase 6).

   On the live site, staff edit content in the admin panel and the pages
   read it from the database. In this demo the admin preview (admin.html)
   saves its changes in the visitor's own browser, and every page reads
   lists through Store.list(), so changes made there show up on the site.

   Per collection, the saved state holds:
   order  – ids in display order        hidden – ids not shown on the site
   edits  – { id: { field: value } }    added  – items created in the admin
   ===================================================================== */
const Store = (() => {
  const KEY = 'edurise-admin-demo';
  const SOURCES = {
    destinations: () => DESTINATIONS,
    universities: () => UNIVERSITIES,
    intakes:      () => INTAKES,
    scholarships: () => SCHOLARSHIP_OFFERS,
    team:         () => TEAM,
    testimonials: () => TESTIMONIALS,
    news:         () => NEWS
  };
  let state = store.get(KEY, {});
  const col = name => (state[name] = state[name] || { order: [], hidden: [], edits: {}, added: [] });
  const save = () => store.set(KEY, state);

  /* items of a collection, edits applied, in saved order.
     { withHidden: true } also returns hidden items, each with ._hidden */
  function list(name, { withHidden = false } = {}) {
    const c = col(name);
    const items = SOURCES[name]().concat(c.added)
      .map(item => Object.assign({}, item, c.edits[item.id] || {}, { _hidden: c.hidden.includes(item.id), _added: c.added.some(a => a.id === item.id) }));
    const pos = id => { const i = c.order.indexOf(id); return i === -1 ? 1e6 : i; };
    items.sort((a, b) => pos(a.id) - pos(b.id));
    return withHidden ? items : items.filter(i => !i._hidden);
  }
  const get = (name, id) => list(name, { withHidden: true }).find(i => i.id === id);

  /* ---------- revision history (DOCX §6.1, Package 3) ----------
     Every change is logged with who made it, when, and a copy of the content
     before the change, so any earlier version can be restored. */
  const HKEY = 'edurise-admin-history', HMAX = 40;
  let actor = 'Staff';
  const history = () => store.get(HKEY, []);
  const LABEL_FIELDS = ['name', 'title', 'university'];
  const itemLabel = (name, id) => { const it = id && get(name, id); return it ? (LABEL_FIELDS.map(f => it[f]).find(Boolean) || id) : ''; };
  function record(action, name, id, change, detail = '') {
    const before = JSON.stringify(state);
    const label = itemLabel(name, id);
    change();
    const h = history();
    h.unshift({ at: new Date().toISOString(), who: actor, action, collection: name || '', label, detail, before });
    store.set(HKEY, h.slice(0, HMAX));
  }
  function restore(index) {
    const h = history(), entry = h[index];
    if (!entry) return;
    record('Restored', '', null, () => { state = JSON.parse(entry.before); save(); },
      `to the version before “${entry.action}${entry.label ? ' ' + entry.label : ''}”`);
  }
  const setActor = who => { actor = who; };

  function update(name, id, fields) {
    const cur = get(name, id) || {};
    const changed = Object.keys(fields).filter(k => JSON.stringify(cur[k]) !== JSON.stringify(fields[k]));
    if (!changed.length) return;
    record('Edited', name, id, () => {
      const c = col(name);
      const added = c.added.find(a => a.id === id);
      if (added) Object.assign(added, fields);
      else c.edits[id] = Object.assign(c.edits[id] || {}, fields);
      save();
    }, changed.join(', '));
  }
  function add(name, item) {
    item.id = item.id || name + '-' + Date.now().toString(36);
    const before = JSON.stringify(state);
    const c = col(name);
    c.added.push(item);
    c.order = list(name, { withHidden: true }).map(i => i.id).filter(i => i !== item.id);
    c.order.unshift(item.id);                       // new items appear first
    save();
    const h = history();
    h.unshift({ at: new Date().toISOString(), who: actor, action: 'Added', collection: name, label: itemLabel(name, item.id), detail: '', before });
    store.set(HKEY, h.slice(0, HMAX));
    return item.id;
  }
  function remove(name, id) {                       // only items created in the admin can be deleted
    record('Deleted', name, id, () => {
      const c = col(name);
      c.added = c.added.filter(a => a.id !== id);
      c.order = c.order.filter(i => i !== id);
      save();
    });
  }
  function setHidden(name, id, hidden) {
    record(hidden ? 'Hidden' : 'Shown', name, id, () => {
      const c = col(name);
      c.hidden = c.hidden.filter(i => i !== id);
      if (hidden) c.hidden.push(id);
      save();
    });
  }
  function move(name, id, step) {
    const ids = list(name, { withHidden: true }).map(i => i.id);
    const i = ids.indexOf(id), j = i + step;
    if (i < 0 || j < 0 || j >= ids.length) return;
    record(step < 0 ? 'Moved up' : 'Moved down', name, id, () => {
      [ids[i], ids[j]] = [ids[j], ids[i]];
      col(name).order = ids;
      save();
    });
  }
  function reset() { record('Reset all content', '', null, () => { state = {}; save(); }); }
  const hasChanges = () => Object.values(state).some(c => c.order.length || c.hidden.length || c.added.length || Object.keys(c.edits).length);

  return { list, get, update, add, remove, setHidden, move, reset, hasChanges, history, restore, setActor, collections: Object.keys(SOURCES) };
})();

/* =====================================================================
   Leads (Phase 8, Package 3): every enquiry from the website is saved
   with a status, so counsellors can follow up from the staff dashboard.
   In this demo leads are kept in the visitor's own browser; on the live
   site they are stored in the database and also sent to WhatsApp.
   ===================================================================== */
const Leads = (() => {
  const KEY = 'edurise-leads';
  const STATUSES = ['New', 'Contacted', 'Applied', 'Converted', 'Not interested'];
  const all = () => store.get(KEY, []);
  const save = list => store.set(KEY, list);
  function add({ name, phone, email = '', qual = '', interest = '', source = 'Website' }) {
    const list = all();
    list.unshift({ id: 'lead-' + Date.now().toString(36), date: new Date().toISOString(), name, phone, email, qual, interest, source, status: 'New' });
    save(list);
  }
  function setStatus(id, status) { save(all().map(l => l.id === id ? Object.assign(l, { status }) : l)); }
  function remove(id) { save(all().filter(l => l.id !== id)); }
  function csv() {
    const cols = ['date', 'name', 'phone', 'email', 'qual', 'interest', 'source', 'status'];
    const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    return [cols.join(','), ...all().map(l => cols.map(c => q(c === 'date' ? l.date.slice(0, 16).replace('T', ' ') : l[c])).join(','))].join('\n');
  }
  return { all, add, setStatus, remove, csv, STATUSES };
})();
