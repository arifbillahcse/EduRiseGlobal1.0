/* =====================================================================
   main.js — start-up for every page.
   Each page sets <body data-page="…">; this file runs the matching
   renderer, then builds the shared shell around the page.
   Load order: icons → data → utils → store → forms → layout → home → pages → listings → stories → main (+ admin on admin.html)
   ===================================================================== */
const PAGE_RENDERERS = {
  home:         () => { initHome(); renderHomeIntakes(); renderHomeNews(); renderHomeStories(); },
  destinations: () => renderDestinationsPage(),
  destination:  () => { renderCountryPage(); window.addEventListener('hashchange', () => { renderCountryPage(); bindSite(); }); },
  universities: () => renderUniversitiesPage(),
  programs:     () => renderProgramsPage(),
  scholarships: () => renderScholarshipsPage(),
  services:     () => renderServicesPage(),
  about:        () => renderAboutPage(),
  contact:      () => renderContactPage(),
  policies:     () => renderPoliciesPage(),
  news:         () => renderNewsPage()
};

/* which menu item is highlighted for each page */
const ACTIVE_NAV = { destination: 'destinations', policies: '', news: '' };

document.addEventListener('DOMContentLoaded', () => {
  injectIcons();
  const page = document.body.dataset.page || 'home';
  if (page === 'admin') { Admin.init(); return; }      // the staff dashboard has its own layout
  (PAGE_RENDERERS[page] || (() => {}))();               // page content first …
  initLayout(page in ACTIVE_NAV ? ACTIVE_NAV[page] : page); // … then the shell, which binds links inside it
  initToastButtons();
  Enquiry.init();                                     // Package 2 enquiry dialog
});
