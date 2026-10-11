/* =====================================================================
   layout.js — behaviour of the shared shell (Phase 2):
   contact details from SITE · navigation from NAV · sticky header ·
   mobile drawer · language switch (preview) · links to later phases
   ===================================================================== */

/* ---------- fill contact details and links from SITE ----------
   <span data-site="phone">       → text
   <a data-site-href="whatsapp">  → link (whatsapp | email | phone | facebook | instagram | linkedin) */
function bindSite() {
  $$('[data-site]').forEach(el => {
    const value = SITE[el.dataset.site];
    if (value) el.textContent = value;
  });
  $$('[data-site-href]').forEach(el => {
    const key = el.dataset.siteHref;
    if (key === 'whatsapp') el.href = waLink(SITE.whatsappGreeting);
    else if (key === 'email') el.href = 'mailto:' + SITE.email;
    else if (key === 'phone') el.href = 'tel:+' + SITE.whatsapp;
    else if (SITE.social[key]) el.href = SITE.social[key];
    else {                                   // social link not supplied yet (TBC)
      el.removeAttribute('href');
      el.setAttribute('aria-disabled', 'true');
      el.title = 'Link to be added (TBC)';
    }
  });
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
}

/* ---------- navigation ---------- */
function renderNav(activeId) {
  const item = (n, inDrawer) =>
    `<li><a class="nav__link" href="${n.href}" data-phase="${n.phase}"${n.id === activeId ? ' aria-current="page"' : ''}>${esc(n.label)}${inDrawer ? icon('arrow') : ''}</a></li>`;
  $('#navList').innerHTML    = NAV.map(n => item(n, false)).join('');
  $('#drawerList').innerHTML = NAV.map(n => item(n, true)).join('');
  $('#footerNav').innerHTML  = NAV.filter(n => n.id !== 'home')
    .map(n => `<li><a href="${n.href}" data-phase="${n.phase}">${esc(n.label)}</a></li>`).join('');
  $('#footerDest').innerHTML = FOOTER_DESTINATIONS
    .map(d => `<li><a href="#destinations" data-phase="4">${esc(d)}</a></li>`).join('');
  $('#footerLegal').innerHTML = LEGAL
    .map(l => `<a href="${l.href}" data-phase="${l.phase}">${esc(l.label)}</a>`).join('');
}

/* links to pages that are built in a later phase show a message instead of a dead link */
function initPhaseLinks() {
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-phase]');
    if (!link) return;
    const phase = Number(link.dataset.phase);
    if (phase > SITE.currentPhase) {
      e.preventDefault();
      Drawer.close();
      Toast.show(`This page is built in Phase ${phase}.`);
    }
  });
}

/* ---------- sticky header: adds a shadow once the page scrolls ---------- */
function initHeader() {
  const header = $('#siteHeader');
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* ---------- mobile drawer ---------- */
const Drawer = (() => {
  let lastFocus = null;
  const drawer = () => $('#drawer');
  const isOpen = () => drawer().classList.contains('is-open');

  function open() {
    lastFocus = document.activeElement;
    drawer().classList.add('is-open');
    drawer().removeAttribute('inert');
    drawer().setAttribute('aria-hidden', 'false');
    $('#menuToggle').setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
    setTimeout(() => $('#drawerClose').focus(), 60);
  }
  function close() {
    if (!isOpen()) return;
    drawer().classList.remove('is-open');
    drawer().setAttribute('inert', '');
    drawer().setAttribute('aria-hidden', 'true');
    $('#menuToggle').setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
    if (lastFocus) lastFocus.focus();
  }
  function trapFocus(e) {                      // keep Tab inside the open drawer
    const items = $$('#drawer a[href], #drawer button:not([disabled])');
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function init() {
    drawer().setAttribute('inert', '');
    $('#menuToggle').addEventListener('click', open);
    $('#drawerClose').addEventListener('click', close);
    $('#drawerOverlay').addEventListener('click', close);
    document.addEventListener('keydown', e => {
      if (!isOpen()) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') trapFocus(e);
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 1080) close(); });
  }
  return { init, open, close };
})();

/* ---------- language switch ----------
   Phase 2 delivers the control only. Bangla content arrives in Phase 8 (Package 3). */
function initLanguageSwitch() {
  $$('[data-lang]').forEach(btn => btn.addEventListener('click', () => {
    if (btn.dataset.lang === 'en') return;
    Toast.show('বাংলা version arrives in Phase 8 (Package 3).');
  }));
}

/* ---------- build progress block (development only) ---------- */
function renderBuildPlan() {
  const list = $('#buildPlan');
  if (!list) return;
  list.innerHTML = BUILD_PLAN.map(p =>
    `<li class="${p.done ? 'is-done' : ''}"><b>P${p.phase}${p.done ? ' ✓' : ''}</b><span>${esc(p.title)}</span></li>`).join('');
}

function initLayout(activeId) {
  renderNav(activeId);
  bindSite();
  initHeader();
  Drawer.init();
  initPhaseLinks();
  initLanguageSwitch();
  renderBuildPlan();
}
