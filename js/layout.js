/* =====================================================================
   layout.js — the shell shared by every page.
   Each page only contains its own <main>. This file adds the demo
   ribbon, top bar, header, mobile drawer, footer, WhatsApp button and
   toast around it, so the shell is written once for the whole site.
   ===================================================================== */

const ico = (name, cls = '') => icon(name, cls);   // short alias for templates below

/* ---------- shell markup ---------- */
function brandHTML(label = 'EduRise Global, home') {
  return `<a class="brand" href="index.html" aria-label="${label}">
    <img src="assets/img/brand/logo-mark.png" alt="" width="71" height="40">
    <span><span class="brand__name">EduRise</span><span class="brand__sub">GLOBAL</span></span></a>`;
}

function topHTML() {
  return `
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="ribbon" role="note"><div class="container"><span>Website demo for client review.</span><span class="tbc">TBC</span><span>= information still to be confirmed by EduRise</span></div></div>
  <div class="topbar"><div class="container">
    <div class="topbar__contacts">
      <a class="topbar__item tnum" data-site-href="phone">${ico('phone')}<span data-site="phone"></span></a>
      <a class="topbar__item topbar__item--sm" data-site-href="email">${ico('mail')}<span data-site="email"></span></a>
      <span class="topbar__item topbar__item--md">${ico('pin')}Dhaka · Madrid · Suffolk</span>
    </div>
    <div class="topbar__right">
      <div class="topbar__social">
        <a data-site-href="facebook" target="_blank" rel="noopener" aria-label="EduRise Global on Facebook">${ico('facebook')}</a>
        <a data-site-href="instagram" target="_blank" rel="noopener" aria-label="Instagram">${ico('instagram')}</a>
        <a data-site-href="linkedin" target="_blank" rel="noopener" aria-label="LinkedIn">${ico('linkedin')}</a>
      </div>
      <div class="lang-switch" role="group" aria-label="Language">
        <button type="button" data-lang="en" aria-pressed="true">EN</button><button type="button" data-lang="bn" aria-pressed="false">বাংলা</button>
      </div>
    </div>
  </div></div>
  <header class="site-header" id="siteHeader"><div class="container">
    ${brandHTML()}
    <nav class="nav" aria-label="Main"><ul class="nav__list" id="navList"></ul></nav>
    <div class="header__actions">
      <a class="btn btn--go btn--sm header__cta" data-site-href="whatsapp" target="_blank" rel="noopener">${ico('whatsapp')}Free consultation</a>
      <button class="menu-toggle" id="menuToggle" type="button" aria-controls="drawer" aria-expanded="false" aria-label="Open menu">${ico('menu')}</button>
    </div>
  </div></header>
  <div class="drawer" id="drawer" aria-hidden="true">
    <div class="drawer__overlay" id="drawerOverlay"></div>
    <div class="drawer__panel" role="dialog" aria-modal="true" aria-label="Menu">
      <div class="drawer__head">${brandHTML('EduRise Global')}<button class="drawer__close" id="drawerClose" type="button" aria-label="Close menu">${ico('close')}</button></div>
      <nav aria-label="Mobile"><ul class="nav__list" id="drawerList"></ul></nav>
      <div class="drawer__foot">
        <a class="btn btn--go btn--block" data-site-href="whatsapp" target="_blank" rel="noopener">${ico('whatsapp')}Book a free consultation</a>
        <div class="drawer__contact">
          <span class="tnum">${ico('phone', 'icon--sm')}<span data-site="phone"></span></span>
          <span>${ico('mail', 'icon--sm')}<span data-site="email"></span></span>
        </div>
        <div class="lang-switch lang-switch--light" role="group" aria-label="Language">
          <button type="button" data-lang="en" aria-pressed="true">English</button><button type="button" data-lang="bn" aria-pressed="false">বাংলা</button>
        </div>
      </div>
    </div>
  </div>`;
}

function bottomHTML() {
  return `
  <footer class="site-footer"><div class="container">
    <div class="footer__grid">
      <div>
        ${brandHTML()}
        <p class="footer__about">Guiding your global future. An international education and career consultancy in Dhaka, with teams in Spain and the United Kingdom.</p>
        <div class="socials">
          <a data-site-href="facebook" target="_blank" rel="noopener" aria-label="Facebook">${ico('facebook')}</a>
          <a data-site-href="instagram" target="_blank" rel="noopener" aria-label="Instagram">${ico('instagram')}</a>
          <a data-site-href="linkedin" target="_blank" rel="noopener" aria-label="LinkedIn">${ico('linkedin')}</a>
        </div>
      </div>
      <div><h2 class="footer__title">Explore</h2><ul class="footer__list" id="footerNav"></ul></div>
      <div><h2 class="footer__title">Destinations</h2><ul class="footer__list" id="footerDest"></ul></div>
      <div><h2 class="footer__title">Contact</h2>
        <ul class="footer__list footer__contact">
          <li>${ico('phone')}<span class="tnum" data-site="phone"></span></li>
          <li>${ico('whatsapp')}<a data-site-href="whatsapp" target="_blank" rel="noopener">Chat on WhatsApp</a></li>
          <li>${ico('mail')}<span data-site="email"></span></li>
          <li>${ico('pin')}<span data-site="address"></span></li>
        </ul>
        <p class="footer__offices">Offices: <span data-site="offices"></span><span class="tbc">TBC</span></p>
      </div>
    </div>
    <div class="footer__bottom">
      <span>© <span id="year"></span> EduRise Global. All rights reserved.</span>
      <nav class="footer__legal" id="footerLegal" aria-label="Policies"></nav>
    </div>
  </div></footer>
  <a class="wa-float" data-site-href="whatsapp" target="_blank" rel="noopener" aria-label="Chat with EduRise on WhatsApp">${ico('whatsapp')}<span>WhatsApp us</span></a>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
}

function renderShell() {
  const main = $('#main');
  main.insertAdjacentHTML('beforebegin', topHTML());
  main.insertAdjacentHTML('afterend', bottomHTML());
}

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
    if (key === 'whatsapp') { if (!el.getAttribute('href')) el.href = waLink(SITE.whatsappGreeting); }
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

/* ---------- navigation (from NAV in data.js) ---------- */
function renderNav(activeId) {
  const item = (n, inDrawer) =>
    `<li><a class="nav__link" href="${n.href}" data-phase="${n.phase}"${n.id === activeId ? ' aria-current="page"' : ''}>${esc(n.label)}${inDrawer ? icon('arrow') : ''}</a></li>`;
  $('#navList').innerHTML    = NAV.map(n => item(n, false)).join('');
  $('#drawerList').innerHTML = NAV.map(n => item(n, true)).join('');
  $('#footerNav').innerHTML  = NAV.filter(n => n.id !== 'home')
    .map(n => `<li><a href="${n.href}" data-phase="${n.phase}">${esc(n.label)}</a></li>`).join('');
  $('#footerDest').innerHTML = DESTINATIONS.slice(0, 8)
    .map(d => `<li><a href="destination.html#${d.id}">${esc(d.name)}</a></li>`).join('');
  $('#footerLegal').innerHTML = LEGAL
    .map(l => `<a href="${l.href}" data-phase="${l.phase}">${esc(l.label)}</a>`).join('');
}

/* links to pages built in a later phase show a message instead of a dead link */
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
  const isOpen = () => drawer() && drawer().classList.contains('is-open');

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

/* ---------- language switch: control only; Bangla arrives in Phase 8 (Package 3) ---------- */
function initLanguageSwitch() {
  $$('[data-lang]').forEach(btn => btn.addEventListener('click', () => {
    if (btn.dataset.lang === 'en') return;
    Toast.show('বাংলা version arrives in Phase 8 (Package 3).');
  }));
}

/* ---------- start the shell (called by main.js after page content is rendered) ---------- */
function initLayout(activeId) {
  renderShell();
  renderNav(activeId);
  bindSite();
  initHeader();
  Drawer.init();
  initPhaseLinks();
  initLanguageSwitch();
}
