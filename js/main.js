/* =====================================================================
   main.js — start-up for every page.
   Each page sets <body data-page="…">; this file runs the matching
   renderer, then builds the shared shell around the page.
   Load order: icons → data → utils → store → forms → layout → home → pages → listings → stories → premium → i18n → main (+ admin on admin.html)
   ===================================================================== */
const PAGE_RENDERERS = {
  home:         () => { initHome(); renderBoard(); renderHomeNews(); renderHomeStories(); },
  destinations: () => renderDestinationsPage(),
  destination:  () => { renderCountryPage(); window.addEventListener('hashchange', () => { renderCountryPage(); bindSite(); }); },
  universities: () => renderUniversitiesPage(),
  programs:     () => { renderProgramFinder(); renderProgramsPage(); },
  program:      () => { renderProgramPage(); window.addEventListener('hashchange', renderProgramPage); },
  eligibility:  () => renderEligibility(),
  estimator:    () => { renderEstimator(); window.addEventListener('hashchange', renderEstimator); },
  scholarships: () => renderScholarshipsPage(),
  services:     () => renderServicesPage(),
  about:        () => renderAboutPage(),
  contact:      () => renderContactPage(),
  policies:     () => renderPoliciesPage(),
  news:         () => renderNewsPage()
};

/* which menu item is highlighted for each page */
const ACTIVE_NAV = { destination: 'destinations', policies: '', news: '', program: 'programs', eligibility: '', estimator: '' };

document.addEventListener('DOMContentLoaded', () => {
  injectIcons();
  const page = document.body.dataset.page || 'home';
  if (page === 'admin') { Admin.init(); return; }      // the staff dashboard has its own layout
  if (page === 'checklist') { renderChecklistPage(); window.addEventListener('hashchange', renderChecklistPage); return; }   // printable page, no site shell
  (PAGE_RENDERERS[page] || (() => {}))();               // page content first …
  initLayout(page in ACTIVE_NAV ? ACTIVE_NAV[page] : page); // … then the shell, which binds links inside it
  initToastButtons();
  Enquiry.init();                                     // Package 2 enquiry dialog
  I18n.init();                                        // Package 3 English / বাংলা (last, so it sees the whole page)
});
