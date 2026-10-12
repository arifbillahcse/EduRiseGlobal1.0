/* =====================================================================
   home.js — homepage sections (Phase 3). Content comes from data.js.
   ===================================================================== */

/* ---------- hero: trust points (the middle tile shows the leaders' photos) ---------- */
function renderTrust() {
  const visual = [
    `<span class="trust__icon">${icon('globe')}</span>`,
    `<span class="trust__faces">${TEAM.map(t => `<img src="${t.photo}" alt="" width="34" height="34" loading="lazy">`).join('')}</span>`,
    `<span class="trust__icon">${icon('plane')}</span>`
  ];
  $('#heroTrust').innerHTML = TRUST_POINTS
    .map((t, i) => `<li>${visual[i] || ''}<span><b>${esc(t.title)}</b>${esc(t.text)}</span></li>`).join('');
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
  }

  function start() { if (!reduced) { stop(); timer = setInterval(() => show(current + 1), 6000); } }
  function stop() { clearInterval(timer); timer = null; }

  function init() {
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
  $('#processList').innerHTML = PROCESS
    .map(p => `<li><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></li>`).join('');
}

/* ---------- leadership ---------- */
function renderTeam() {
  $('#teamGrid').innerHTML = Store.list('team').map(p => `<article class="mentor">
      <div class="mentor__cover" aria-hidden="true"></div>
      <div class="mentor__top">
        <div class="mentor__photo"><img src="${p.photo}" alt="Portrait of ${esc(p.name)}" width="80" height="80" loading="lazy"></div>
        <span class="mentor__loc">${icon('pin', 'icon--sm')}${esc(p.location)}</span>
      </div>
      <div class="mentor__body">
        <h3 class="mentor__name">${esc(p.name)}</h3>
        <span class="mentor__role">${esc(p.role)}</span>
        <p class="mentor__bio">${esc(p.bio)}</p>
        <div class="mentor__tags">${p.tags.map(t => `<span class="mentor__tag">${icon('cap', 'icon--sm')}${esc(t)}</span>`).join('')}</div>
      </div>
      <a class="mentor__more" href="about.html#leader-${p.id}">Read full story${icon('arrow')}</a>
    </article>`).join('');
}

/* ---------- commitment ---------- */
function renderCommitment() {
  $('#commitQuote').textContent = COMMITMENT.quote;
  $('#commitList').innerHTML = COMMITMENT.points
    .map(p => `<li>${icon('check')}<span>${esc(p)}</span></li>`).join('');
}

function initHome() {
  renderTrust();
  renderHeroLive();
  DestCards.init();
  renderServices();
  renderProcess();
  renderTeam();
  renderCommitment();
}
