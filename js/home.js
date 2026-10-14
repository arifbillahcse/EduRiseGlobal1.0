/* =====================================================================
   home.js — homepage sections (Phase 3). Content comes from data.js.
   ===================================================================== */

/* ---------- hero: icon strip along the bottom ---------- */
function renderHeroStats() {
  const box = $('#heroStats'); if (!box) return;
  box.innerHTML = HERO_STATS.map(x => `<li>
      <span class="hero__stat-icon">${icon(x.icon)}</span>
      <span><b>${esc(x.title)}${x.tbc ? ' <span class="tbc">TBC</span>' : ''}</b><small>${esc(x.text)}</small></span>
    </li>`).join('');
}

/* ---------- hero: live pill — how many application windows are open today ---------- */
function renderHeroLive() {
  const el = $('#heroLiveText'); if (!el) return;
  const open = Store.list('intakes').filter(i => ['open', 'closing'].includes(windowStatus(i).state)).length;
  if (open) el.textContent = `${open} application ${open === 1 ? 'window' : 'windows'} open now`;
}

/* ---------- hero: stacked boarding passes ----------
   Tabs bring a pass to the front. Passes rotate every 6 s unless the
   visitor hovers, focuses or prefers reduced motion. */
const DestCards = (() => {
  let current = 0, timer = null;
  const total = HERO_DESTINATIONS.length;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function cardHTML(d, i) {
    return `<article class="postcard" data-index="${i}" aria-hidden="true">
      <div class="postcard__band"><span>${icon('plane')}EduRise Global</span><span>Boarding pass</span></div>
      <div class="postcard__body">
        <div class="postcard__route">
          <div class="postcard__end"><small>From</small><b>DAC</b><span>Dhaka</span></div>
          <div class="postcard__path" aria-hidden="true"><span class="postcard__plane">${icon('plane')}</span></div>
          <div class="postcard__end postcard__end--to"><small>To</small><b>${d.code}</b><span>${esc(d.city)}</span></div>
        </div>
        <h2 class="postcard__country">${esc(d.country)}</h2>
        <dl class="postcard__fields">
          <div><dt>Study level</dt><dd>${esc(d.programs)}</dd></div>
          <div><dt>Why go</dt><dd>${esc(d.note)}</dd></div>
        </dl>
      </div>
      <div class="postcard__tear" aria-hidden="true"></div>
      <div class="postcard__stub">
        <span class="postcard__barcode" aria-hidden="true"></span>
        <a class="link-arrow" href="destination.html#${d.id}" tabindex="-1">Explore ${esc(d.country)}${icon('arrow')}</a>
        <span class="postcard__count tnum">${i + 1} / ${total}</span>
      </div>
    </article>`;
  }

  function show(index) {
    current = (index + total) % total;
    $$('.postcard').forEach(card => {
      const i = Number(card.dataset.index);
      const pos = (i - current + total) % total;          // 0 = front, 1 and 2 behind, others hidden
      card.dataset.pos = pos <= 2 ? String(pos) : 'hidden';
      const front = pos === 0;
      card.setAttribute('aria-hidden', String(!front));
      const link = $('a', card); if (link) link.tabIndex = front ? 0 : -1;
    });
    $$('.destcards__tab').forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === current));
      tab.tabIndex = i === current ? 0 : -1;
    });
    showPhoto(HERO_DESTINATIONS[current].id);
  }

  /* full-bleed background photo that follows the front card (DEST_PHOTOS, Wikimedia Commons) */
  function buildPhotos() {
    const box = $('#heroPhotos'); if (!box || typeof DEST_PHOTOS === 'undefined') return;
    box.innerHTML = HERO_DESTINATIONS.filter(d => DEST_PHOTOS[d.id]).map((d, i) => {
      const ph = DEST_PHOTOS[d.id];
      return `<img class="hero__photo" data-id="${d.id}" src="${ph.src}" alt="" width="1280" height="853" decoding="async"${i === 0 ? ' fetchpriority="high"' : ''} referrerpolicy="no-referrer" style="object-position:${ph.pos}">`;
    }).join('');
    $$('.hero__photo', box).forEach(img => img.addEventListener('error', () => { img.remove(); showPhoto(HERO_DESTINATIONS[current].id); }, { once: true }));
  }
  function showPhoto(id) {
    const img = $(`.hero__photo[data-id="${id}"]`), hero = $('.hero');
    $$('.hero__photo').forEach(x => x.classList.toggle('is-on', x === img));
    if (hero) hero.classList.toggle('has-photo', !!img);
  }

  function start() { if (!reduced) { stop(); timer = setInterval(() => show(current + 1), 6000); } }
  function stop() { clearInterval(timer); timer = null; }

  function init() {
    buildPhotos();
    $('#destStack').innerHTML = HERO_DESTINATIONS.map(cardHTML).join('');
    $('#destTabs').innerHTML = HERO_DESTINATIONS.map((d, i) =>
      `<button type="button" class="destcards__tab" role="tab" aria-label="${esc(d.country)}">${d.code}</button>`).join('');
    $('#destMore').textContent = 'Also: ' + HERO_MORE_DESTINATIONS;

    $$('.destcards__tab').forEach((tab, i) => {
      tab.addEventListener('click', () => { show(i); start(); });
      tab.addEventListener('keydown', e => {                // arrow keys move between tabs
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        show(current + (e.key === 'ArrowRight' ? 1 : -1));
        $$('.destcards__tab')[current].focus();
      });
    });
    const box = $('#destCards');
    box.addEventListener('mouseenter', stop);
    box.addEventListener('mouseleave', start);
    box.addEventListener('focusin', stop);
    box.addEventListener('focusout', start);
    show(0);
    start();
  }
  return { init };
})();

/* ---------- services ---------- */
function renderServices() {
  const cards = SERVICES.map(s => `<article class="card">
      <span class="card__icon">${icon(s.icon)}</span>
      <h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>
    </article>`).join('');
  const cta = `<div class="card service-cta">
      <div><h3>Not sure what you need?</h3><p>Start with a free consultation. We recommend only the services that help your case.</p></div>
      <a class="btn btn--sun btn--sm" data-site-href="whatsapp" target="_blank" rel="noopener">${icon('whatsapp')}Ask a counsellor</a>
    </div>`;
  $('#servicesGrid').innerHTML = cards + cta;
}

/* ---------- process ---------- */
function renderProcess() {
  const list = $('#processList'); if (!list) return;
  const n = PROCESS.length;
  list.innerHTML = `<li class="journey__track" aria-hidden="true"><span class="journey__fill"></span><span class="journey__plane">${icon('plane')}</span></li>` +
    PROCESS.map((p, i) => `<li class="journey__step${i === n - 1 ? ' is-final' : ''}" style="--i:${i}">
      <span class="journey__node" aria-hidden="true"><span class="journey__icon">${icon(p.icon || 'check')}</span><span class="journey__num tnum">${String(i + 1).padStart(2, '0')}</span></span>
      <span class="journey__stem" aria-hidden="true"></span>
      <div class="journey__card">
        <span class="journey__label">Step ${String(i + 1).padStart(2, '0')}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.text)}</p>
      </div>
    </li>`).join('');

  /* scroll reveal: steps appear in turn, the route fills; content stays visible without JS or with reduced motion */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { list.classList.add('is-in'); return; }
  list.classList.add('js-reveal');
  new IntersectionObserver((entries, obs) => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); }
  }), { threshold: .25, rootMargin: '0px 0px -8% 0px' }).observe(list);
  $$('.journey__step', list).forEach(li => new IntersectionObserver((entries, obs) => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); }
  }), { threshold: .4 }).observe(li));
  /* vertical layout (tablets, phones): the route fills as you scroll */
  const track = $('.journey__track', list);
  let raf = 0;
  const update = () => {
    raf = 0;
    const r = list.getBoundingClientRect(), mid = window.innerHeight * .6;
    list.style.setProperty('--p', Math.max(0, Math.min(1, (mid - r.top) / r.height)).toFixed(3));
  };
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ---------- leadership ---------- */
function renderTeam() {
  /* profile rows: photo · name/role/location · bio + tags · arrow; the whole row links to the leader on About */
  const POS = { faysal: '38% 18%' };            // keeps the poster lantern out of the frame
  $('#teamGrid').innerHTML = Store.list('team').filter(p => p.onHome !== false).map((p, i) => {   // onHome:false leaders appear only on leadership.html
    const parts = (p.location || '').split(',').map(s => s.trim()).filter(Boolean);
    const country = parts[parts.length - 1];
    return `<a class="leader-r" href="leadership.html#leader-${p.id}">
      <span class="leader-r__pic"><img class="leader-r__photo" src="${p.photo}" alt="" width="150" height="150" loading="lazy" style="object-position:${POS[p.id] || '50% 18%'}"></span>
      <span>
        <span class="leader-r__num"><b>${String(i + 1).padStart(2, '0')}</b>${country ? `<span aria-hidden="true">·</span><span>${esc(country)}</span>` : ''}</span>
        <span class="leader-r__name">${esc(p.name)}</span>
        <span class="leader-r__role">${esc(p.role)}</span>
        ${parts.length > 1 ? `<span class="leader-r__loc">${icon('pin')}${esc(p.location)}</span>` : ''}
      </span>
      <span class="leader-r__bio">${esc(p.bio)}<span class="leader-r__chips">${((p.tags && p.tags.length) ? p.tags : (p.portfolio || []).slice(0, 2)).map(t => `<span>${esc(t)}</span>`).join('')}</span></span>
      <span class="leader-r__go" aria-hidden="true">${icon('arrow')}</span>
    </a>`;
  }).join('');
  // "More Leadership" jumps straight to the first leader who is not shown on the homepage
  const more = Store.list('team').find(p => p.onHome === false);
  const link = $('#team .link-arrow');
  if (link && more) link.href = `leadership.html#leader-${more.id}`;
}

/* ---------- destinations (DOCX §4.1): expanding flag panels, see destpanels.js ---------- */

/* ---------- programs (DOCX §4.1) ---------- */
function renderHomePrograms() {
  /* program finder: pick your latest qualification, see the program types you can apply to */
  const box = $('#homePrograms'); if (!box) return;
  const ALL = ['bachelors', 'masters', 'language', 'diploma'];
  const OPTS = [
    { id: 'ssc',      label: 'SSC / O-levels',    hint: 'Foundation and diploma',       programs: ['diploma'] },
    { id: 'hsc',      label: 'HSC / A-levels',    hint: 'Bachelor’s, diploma, language', programs: ['bachelors', 'diploma', 'language'] },
    { id: 'diploma',  label: 'Diploma',           hint: 'Bachelor’s with credit transfer', programs: ['bachelors'] },
    { id: 'bachelor', label: 'Bachelor’s degree', hint: 'Master’s and language',        programs: ['masters', 'language'] },
    { id: 'unsure',   label: 'Not sure yet',      hint: 'See every program',            programs: ALL }
  ];
  const progs = Object.fromEntries(PROGRAM_TYPES.map(p => [p.id, p]));
  const destName = id => (DESTINATIONS.find(d => d.id === id) || {}).name || id;
  const flags = ids => `<span class="pf-flags" aria-hidden="true">${ids.map(id => `<span>${Landmarks.flagSVG(id)}</span>`).join('')}</span>`;
  let current = 'hsc';

  box.innerHTML = `<div class="pf__ask">
      <span class="pf__eyebrow">Program finder</span>
      <h3 class="pf__q" id="pfQ">What have you completed?</h3>
      <div class="pf__opts" role="group" aria-labelledby="pfQ">${OPTS.map(o => `<button type="button" class="pf-opt" data-opt="${o.id}" aria-pressed="false" aria-controls="pfResults">
          <span><b>${esc(o.label)}</b><small>${esc(o.hint)}</small></span>${icon('arrow')}</button>`).join('')}</div>
      <p class="pf__note">Pick your latest qualification to see the programs you can apply to.</p>
    </div>
    <div class="pf__res">
      <div id="pfResults" aria-live="polite"></div>
      <div class="pf__tools">
        <a href="scholarships.html">${icon('award')}<span>Scholarships</span></a>
        <a href="cost-estimator.html">${icon('calendar')}<span>Cost estimator</span></a>
        <a href="eligibility.html">${icon('check')}<span>Full eligibility check</span></a>
      </div>
    </div>`;

  const show = id => {
    current = id;
    const o = OPTS.find(x => x.id === id);
    $$('.pf-opt', box).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.opt === id)));
    $('#pfResults').innerHTML = `<p class="pf__count">${id === 'unsure' ? '<span>All programs</span>' : `<span>Programs that fit</span><b>${esc(o.label)}</b>`}</p>
      <div class="pf__grid">${o.programs.map(pid => { const p = progs[pid]; return `<a class="pf-card" href="programs.html#${p.id}">
        <span class="pf-card__top"><span class="pf-card__icon">${icon(p.icon)}</span>${id === 'unsure' ? '' : '<span class="pf-card__fit">Fits your profile</span>'}</span>
        <span class="pf-card__title">${esc(p.title)}</span>
        <span class="pf-card__reqs">${p.requirements.slice(0, 2).map(r => `<span>${icon('check')}${esc(r)}</span>`).join('')}</span>
        ${flags(p.destinations)}<span class="sr-only">Available in ${p.destinations.map(destName).join(', ')}.</span>
        <span class="pf-card__go">See program${icon('arrow')}</span>
      </a>`; }).join('')}</div>`;
  };
  box.addEventListener('click', e => { const b = e.target.closest('.pf-opt'); if (b) show(b.dataset.opt); });
  show(current);
}

/* ---------- why choose us + commitment quote (DOCX §4.1, PDF) ---------- */
function renderWhy() {
  $('#commitQuote').textContent = COMMITMENT.quote;
  $('#whyGrid').innerHTML = WHY_CHOOSE.map((w, i) => `<li class="whyc">
      <div class="whyc__top"><span class="whyc__num tnum" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span class="whyc__icon">${icon(w.icon)}</span></div>
      <h3>${esc(w.title)}</h3><p>${esc(w.text)}</p>
    </li>`).join('');
}

/* ---------- scholarship highlight (DOCX §4.1): one featured offer + the next three ---------- */
function renderHomeScholarships() {
  const box = $('#homeScholarships'); if (!box) return;
  const intakes = Store.list('intakes', { withHidden: true });
  const rank = { closing: 0, open: 1, upcoming: 2, closed: 3 };
  const offers = Store.list('scholarships').map(o => {
    const it = intakes.find(x => x.id === o.intakeId);
    return { o, it, st: it ? windowStatus(it) : { state: 'upcoming', label: 'Dates to be announced' }, d: DESTINATIONS.find(x => x.id === o.dest) };
  }).filter(x => x.st.state !== 'closed').sort((x, y) => rank[x.st.state] - rank[y.st.state]);
  if (!offers.length) { box.innerHTML = ''; return; }
  const [f, ...rest] = offers;
  const dates = f.it && f.it.s ? `${formatDate(f.it.s)} to ${formatDate(f.it.e)}` : 'Dates to be announced';
  box.innerHTML = `
    <article class="schl__feature">
      <div class="schl__top"><span class="schl__country">${f.d.code} · <span>${esc(f.d.name)}</span></span>${statusChip(f.st)}</div>
      <h3>${esc(f.o.university)}</h3>
      <p class="schl__award">${esc(f.o.award)}</p>
      <p class="schl__cond">${esc(f.o.condition)}</p>
      <dl class="schl__facts">
        <div><dt>Level</dt><dd>${esc(f.o.level)}</dd></div>
        <div><dt>Intake</dt><dd>${f.it ? esc(f.it.intake) : 'TBA'}</dd></div>
        <div><dt>Applications</dt><dd class="tnum">${esc(dates)}</dd></div>
      </dl>
      <div class="schl__actions">
        <button type="button" class="btn btn--sun" data-enquire="${esc(f.o.university + ' scholarship')}">${icon('whatsapp')}Ask about this offer</button>
        <a class="link-arrow" href="scholarships.html">Full details${icon('arrow')}</a>
      </div>
    </article>
    <ul class="schl__list">${rest.slice(0, 3).map(x => `<li>
        <span class="schl__pill">${esc(x.o.award)}</span>
        <div class="schl__info"><b>${esc(x.o.university)}</b><span><span>${esc(x.d.name)}</span> · <span>${esc(x.o.level)}</span></span></div>
        ${statusChip(x.st)}
        <button type="button" class="schl__ask" data-enquire="${esc(x.o.university + ' scholarship')}" aria-label="Ask about ${esc(x.o.university)} scholarship">${icon('arrow')}</button>
      </li>`).join('')}
      <li class="schl__more"><a class="link-arrow" href="scholarships.html">See all ${offers.length} open and upcoming offers${icon('arrow')}</a></li>
    </ul>`;
}

/* ---------- contact summary form (DOCX §4.1) ---------- */
function initHomeContact() {
  const form = $('#homeForm'); if (!form) return;
  $('#h-country').innerHTML = '<option value="">Not decided yet</option>' +
    Store.list('destinations').map(d => `<option>${esc(d.name)}</option>`).join('') + '<option>Other</option>';
  Forms.attach(form, { name: 'name', phone: 'bdPhone', qual: 'required' }, v => {
    const message = `Hello EduRise Global, I am ${v.name}. Qualification: ${v.qual}. Interested in: ${v.country || 'not decided yet'}. Please call me back.`;
    Leads.add({ name: v.name, phone: v.phone, qual: v.qual, interest: v.country || 'Not decided', source: 'Homepage form' });
    form.hidden = true;
    const ok = $('#homeSuccess');
    ok.hidden = false;
    ok.innerHTML = `<span class="success__tick">${icon('check')}</span>
      <h3>Thank you, ${esc(v.name.split(' ')[0])}</h3>
      <p>A counsellor will call you on <b class="tnum">${esc(v.phone)}</b>. For a faster reply, send it on WhatsApp too.</p>
      <div class="success__actions">
        <a class="btn btn--go" href="${waLink(message)}" target="_blank" rel="noopener">${icon('whatsapp')}Send on WhatsApp</a>
        <a class="btn btn--ghost btn--sm" href="${Forms.mailLink('Call back request from ' + v.name, message + '\nPhone: ' + v.phone)}">${icon('mail')}Send by email</a>
      </div>`;
    ok.focus();
  });
}

function initHome() {
  renderHeroLive();
  renderHeroStats();
  DestCards.init();
  renderServices();
  renderProcess();
  renderTeam();
  DestPanels.init();
  renderHomePrograms();
  renderWhy();
  renderHomeScholarships();
  initHomeContact();
}
