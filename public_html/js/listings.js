/* =====================================================================
   listings.js — Package 2 features (Phase 5):
   FilterBar (country + level) · Enquiry dialog (opens WhatsApp) ·
   universities · intakes · scholarship offers · destination filter
   ===================================================================== */

/* ---------- filter bar ----------
   FilterBar.mount(el, { countries: true, levels: true, onChange(filters) }) */
const FilterBar = (() => {
  let uid = 0;
  function mount(el, { countries = true, levels = true, onChange }) {
    const id = 'f' + (++uid);
    const countryOpts = DESTINATIONS.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('');
    const levelOpts = LEVELS.map(l => `<option value="${esc(l)}">${esc(l)}</option>`).join('');
    el.classList.add('filters');
    el.innerHTML = `
      ${countries ? `<div class="field"><label class="field__label" for="${id}-c">Country</label><select class="field__control" id="${id}-c" data-filter="country"><option value="">All countries</option>${countryOpts}</select></div>` : ''}
      ${levels ? `<div class="field"><label class="field__label" for="${id}-l">Study level</label><select class="field__control" id="${id}-l" data-filter="level"><option value="">All levels</option>${levelOpts}</select></div>` : ''}
      <button type="button" class="btn btn--ghost btn--sm filters__reset">${icon('close', 'icon--sm')}Clear</button>
      <p class="filters__count" aria-live="polite"></p>`;
    const read = () => ({
      country: (el.querySelector('[data-filter="country"]') || {}).value || '',
      level: (el.querySelector('[data-filter="level"]') || {}).value || ''
    });
    const update = () => {
      const f = read();
      el.querySelector('.filters__reset').hidden = !f.country && !f.level;
      const n = onChange(f);
      el.querySelector('.filters__count').textContent = `${n} ${n === 1 ? 'result' : 'results'}`;
    };
    el.addEventListener('change', update);
    el.querySelector('.filters__reset').addEventListener('click', () => {
      el.querySelectorAll('select').forEach(s => { s.value = ''; });
      update();
    });
    update();
  }
  /* true when an item matches the filters; item needs { dest, levels } */
  const matches = (item, f) => (!f.country || item.dest === f.country) && (!f.level || (item.levels || []).includes(f.level));
  return { mount, matches };
})();

/* ---------- empty state for a filtered list ---------- */
const emptyHTML = what => `<div class="empty">${icon('search', 'icon--lg')}<p>No ${what} match these filters.</p><p class="muted small">Try another country or level, or <a data-site-href="whatsapp" href="${waLink(SITE.whatsappGreeting)}" target="_blank" rel="noopener">ask a counsellor</a>.</p></div>`;

/* ---------- enquiry dialog ----------
   Any element with data-enquire="Item name" opens it. On submit the details
   open in WhatsApp, pre-filled to EduRise's number, and the lead is saved on
   the server (it appears under Leads in the admin and is emailed to EduRise). */
const Enquiry = (() => {
  let dialog, form, interest;

  function build() {
    dialog = document.createElement('dialog');
    dialog.className = 'modal';
    dialog.setAttribute('aria-labelledby', 'enqTitle');
    dialog.innerHTML = `
      <div class="modal__head">
        <div><span class="eyebrow" style="margin:0 0 6px">Quick enquiry</span><h2 id="enqTitle">Ask about this</h2></div>
        <button type="button" class="modal__close" aria-label="Close">${icon('close')}</button>
      </div>
      <form class="modal__body" id="enqForm">
        <p class="modal__item" id="enqItem"></p>
        <div class="field"><label class="field__label" for="enq-name">Full name <span class="req">*</span></label><input class="field__control" id="enq-name" name="name" autocomplete="name"><span class="field__error">Enter your full name.</span></div>
        <div class="field"><label class="field__label" for="enq-phone">Phone / WhatsApp <span class="req">*</span></label><input class="field__control tnum" id="enq-phone" name="phone" inputmode="tel" autocomplete="tel" placeholder="01XXX-XXXXXX"><span class="field__error">Enter a Bangladeshi mobile number, for example 01712-345678.</span></div>
        <div class="field"><label class="field__label" for="enq-qual">Highest qualification <span class="req">*</span></label>
          <select class="field__control" id="enq-qual" name="qual"><option value="">Select</option><option>SSC / O-levels</option><option>HSC / A-levels</option><option>Diploma</option><option>Bachelor’s</option><option>Master’s</option></select>
          <span class="field__error">Choose your highest qualification.</span></div>
        <div class="ts-slot"></div>
        <p class="form-alert" role="alert" hidden></p>
        <button class="btn btn--go btn--block" type="submit">${icon('whatsapp')}Send on WhatsApp</button>
        <p class="form-note">Your enquiry is saved for a counsellor and opens in WhatsApp with these details filled in. Press send there for the fastest reply.</p>
      </form>
      <div class="modal__body success" id="enqDone" hidden tabindex="-1"></div>`;
    document.body.appendChild(dialog);
    form = $('#enqForm', dialog);

    $('.modal__close', dialog).addEventListener('click', close);
    dialog.addEventListener('click', e => { if (e.target === dialog) close(); });   // click on the backdrop
    Forms.attach(form, { name: 'name', phone: 'bdPhone', qual: 'required' }, async v => {
      const text = `Hello EduRise Global, I am ${v.name} (${v.phone}). Qualification: ${v.qual}. I would like to know more about: ${interest}.`;
      const url = waLink(text);
      // WhatsApp must open inside the click (pop-up blockers), so it opens first; the lead is saved alongside
      window.open(url, '_blank', 'noopener');
      if (!await Forms.send(form, { source: 'enquiry', interest })) return;   // not saved: the form stays, with the reason and a WhatsApp link
      form.hidden = true;
      const done = $('#enqDone', dialog);
      done.hidden = false;
      done.innerHTML = `<span class="success__tick">${icon('check')}</span>
        <h2>WhatsApp should now be open</h2>
        <p>If it did not open, use the button below. A counsellor usually replies on the same working day.</p>
        <div class="success__summary">${esc(text)}</div>
        <a class="btn btn--go btn--block" href="${url}" target="_blank" rel="noopener">${icon('whatsapp')}Open WhatsApp</a>`;
      done.focus();
    });
  }

  function open(item) {
    if (!dialog) build();
    interest = item;
    form.reset(); form.hidden = false; $('#enqDone', dialog).hidden = true;
    $('#enqItem', dialog).textContent = item;
    dialog.showModal();
    document.body.classList.add('no-scroll');
    setTimeout(() => $('#enq-name', dialog).focus(), 30);
  }
  function close() { dialog.close(); }

  function init() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-enquire]');
      if (btn) { e.preventDefault(); open(btn.dataset.enquire); }
    });
    document.addEventListener('close', e => { if (e.target === dialog) document.body.classList.remove('no-scroll'); }, true);
  }
  return { init, open };
})();

const pkgLabel = n => `<span class="pkg pkg--${n}">Package ${n}</span>`;

/* ---------- intakes (homepage + universities page) ---------- */
function intakeRowHTML(it) {
  const d = DESTINATIONS.find(x => x.id === it.dest);
  const st = windowStatus(it);
  const when = it.s ? formatRange(it.s, it.e) : 'Dates to be announced';
  return `<li class="intake">
    <span class="intake__code" aria-hidden="true">${d.code}</span>
    <div class="intake__main">
      <h3>${esc(it.title)}</h3>
      <p>${esc(d.name)} · ${esc(it.intake)} · ${esc(it.round)}</p>
    </div>
    <div class="intake__when"><span class="intake__label">Apply</span><span class="tnum">${esc(when)}</span></div>
    <div class="intake__status">${statusChip(st)}</div>
    <button type="button" class="btn btn--ghost btn--sm" data-enquire="${esc(it.title + ' (' + it.intake + ')')}">Enquire</button>
  </li>`;
}
/* open and upcoming windows only, soonest first; closed ones are hidden automatically */
function liveIntakes(list = Store.list('intakes')) {
  return list.map(it => ({ it, st: windowStatus(it) }))
    .filter(x => x.st.state !== 'closed')
    .sort((a, b) => (STATUS_ORDER[a.st.state] - STATUS_ORDER[b.st.state]) || ((a.st.days ?? 999) - (b.st.days ?? 999)))
    .map(x => x.it);
}
function renderHomeIntakes() {
  const el = $('#homeIntakes');
  if (el) el.innerHTML = liveIntakes().slice(0, 4).map(intakeRowHTML).join('');
}

/* ---------- universities.html ---------- */
function universityCardHTML(u) {
  const d = DESTINATIONS.find(x => x.id === u.dest);
  return `<article class="uni-card card">
    <span class="uni-card__country">${d.code} · ${esc(d.name)}</span>
    <h3>${esc(u.name)}</h3>
    <p class="uni-card__city">${icon('pin', 'icon--sm')}${esc(u.city)}</p>
    <div class="tag-row">${u.levels.map(l => `<span class="tag">${esc(l)}</span>`).join('')}</div>
    <p class="uni-card__summary">${esc(u.summary)}</p>
    <dl class="facts">${u.facts.map(f => `<div><dt>${esc(f[0])}</dt><dd>${esc(f[1])}</dd></div>`).join('')}</dl>
    ${(typeof PROGRAMS !== 'undefined' && PROGRAMS.find(p => p.uni === u.id)) ? `<a class="link-arrow" href="${progUrl(PROGRAMS.find(p => p.uni === u.id).id)}">View program details ${icon('arrow')}</a>` : ''}
    <button type="button" class="btn btn--go btn--sm btn--block" data-enquire="${esc(u.name)}">${icon('whatsapp')}Enquire</button>
  </article>`;
}
function renderUniversitiesPage() {
  FilterBar.mount($('#uniFilters'), { onChange: f => {
    const list = Store.list('universities').filter(u => FilterBar.matches(u, f));
    $('#uniGrid').innerHTML = list.length ? list.map(universityCardHTML).join('') : emptyHTML('universities');
    return list.length;
  } });
  FilterBar.mount($('#intakeFilters'), { onChange: f => {
    const list = liveIntakes(Store.list('intakes').filter(it => FilterBar.matches(it, f)));
    $('#intakeList').innerHTML = list.length ? list.map(intakeRowHTML).join('') : `<li>${emptyHTML('intakes')}</li>`;
    return list.length;
  } });
  mountCTA('uniCta', 'Looking for a university that is not listed?', 'We work with more universities than we can list here. Tell us what you want to study and we will suggest options.');
}

/* ---------- scholarships.html: filterable offers ---------- */
function offerCardHTML(o) {
  const d = DESTINATIONS.find(x => x.id === o.dest);
  const it = Store.list('intakes', { withHidden: true }).find(x => x.id === o.intakeId);
  const st = it ? windowStatus(it) : { state: 'upcoming', label: 'Dates to be announced' };
  return `<article class="offer card${st.state === 'closed' ? ' is-closed' : ''}">
    <div class="offer__top"><span class="uni-card__country">${d.code} · ${esc(d.name)}</span>${statusChip(st)}</div>
    <h3>${esc(o.university)}</h3>
    <p class="offer__award">${esc(o.award)}</p>
    <p class="muted small">${esc(o.condition)}</p>
    <div class="tag-row"><span class="tag">${esc(o.level)}</span>${it ? `<span class="tag">${esc(it.intake)}</span>` : ''}</div>
    ${st.state === 'closed'
      ? `<button type="button" class="btn btn--ghost btn--sm btn--block" data-enquire="${esc(o.university + ' scholarship (next round)')}">Ask about the next round</button>`
      : `<button type="button" class="btn btn--go btn--sm btn--block" data-enquire="${esc(o.university + ' scholarship')}">${icon('whatsapp')}Enquire</button>`}
  </article>`;
}
function renderScholarshipOffers() {
  FilterBar.mount($('#offerFilters'), { onChange: f => {
    const list = Store.list('scholarships').filter(o => FilterBar.matches(o, f));
    $('#offerGrid').innerHTML = list.length ? list.map(offerCardHTML).join('') : emptyHTML('scholarships');
    return list.length;
  } });
}

/* ---------- destinations.html: filter by study level ---------- */
function renderDestinationFilter() {
  FilterBar.mount($('#destFilters'), { countries: false, onChange: f => {
    const list = Store.list('destinations').filter(d => !f.level || d.levels.some(l => l.startsWith(f.level.replace('’s', '')) || l === f.level));
    $('#destGrid').innerHTML = list.length ? list.map(destCardHTML).join('') : emptyHTML('destinations');
    return list.length;
  } });
}
