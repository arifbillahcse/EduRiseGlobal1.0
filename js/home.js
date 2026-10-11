/* =====================================================================
   home.js — homepage sections (Phase 3). Content comes from data.js.
   ===================================================================== */

/* ---------- hero: trust points ---------- */
function renderTrust() {
  $('#heroTrust').innerHTML = TRUST_POINTS
    .map(t => `<li><b>${esc(t.title)}</b>${esc(t.text)}</li>`).join('');
}

/* ---------- hero: stacked destination cards ----------
   Tabs bring a card to the front. Cards rotate every 6 s unless the
   visitor hovers, focuses or prefers reduced motion. */
const DestCards = (() => {
  let current = 0, timer = null;
  const total = HERO_DESTINATIONS.length;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function cardHTML(d, i) {
    return `<article class="postcard" data-index="${i}" aria-hidden="true">
      <div class="postcard__band"><span>${icon('plane')}Study destination</span><span>${i + 1} / ${total}</span></div>
      <div class="postcard__body">
        <div class="postcard__route"><span>DAC</span><i></i>${icon('plane', 'icon--sm')}<i></i><span>${d.code}</span></div>
        <div class="postcard__code" aria-hidden="true">${d.code}</div>
        <h3 class="postcard__country">${esc(d.country)}</h3>
        <p class="postcard__programs">${esc(d.programs)}</p>
        <p class="postcard__note">${esc(d.note)}</p>
        <div class="postcard__foot">
          <a class="link-arrow" href="destination.html#${d.id}" tabindex="-1">Explore ${esc(d.country)}${icon('arrow')}</a>
          <span class="postcard__count">${esc(d.city)}</span>
        </div>
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
  $('#teamGrid').innerHTML = TEAM.map(p => `<article class="person">
      <img class="person__photo" src="${p.photo}" alt="Portrait of ${esc(p.name)}" width="320" height="320" loading="lazy">
      <div class="person__body">
        <span class="person__loc">${icon('pin', 'icon--sm')}${esc(p.location)}</span>
        <h3 class="person__name">${esc(p.name)}</h3>
        <span class="person__role">${esc(p.role)}</span>
        <p class="person__bio">${esc(p.bio)}</p>
        <div class="person__tags">${p.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      </div>
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
  DestCards.init();
  renderServices();
  renderProcess();
  renderTeam();
  renderCommitment();
}
