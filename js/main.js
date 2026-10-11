/* =====================================================================
   main.js — start-up for every page.
   Each page sets <body data-page="…">; this file runs the matching
   renderer, then builds the shared shell around the page.
   Load order: icons → data → utils → forms → layout → home → pages → main
   ===================================================================== */
const PAGE_RENDERERS = {
  home:         () => initHome(),
  destinations: () => renderDestinationsPage(),
  destination:  () => { renderCountryPage(); window.addEventListener('hashchange', () => { renderCountryPage(); bindSite(); }); },
  programs:     () => renderProgramsPage(),
  scholarships: () => renderScholarshipsPage(),
  services:     () => renderServicesPage(),
  about:        () => renderAboutPage(),
  contact:      () => renderContactPage(),
  policies:     () => renderPoliciesPage()
};

/* which menu item is highlighted for each page */
const ACTIVE_NAV = { destination: 'destinations', policies: '' };

document.addEventListener('DOMContentLoaded', () => {
  injectIcons();
  const page = document.body.dataset.page || 'home';
  (PAGE_RENDERERS[page] || (() => {}))();               // page content first …
  initLayout(page in ACTIVE_NAV ? ACTIVE_NAV[page] : page); // … then the shell, which binds links inside it
  initToastButtons();
});
