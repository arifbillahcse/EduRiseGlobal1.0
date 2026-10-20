/* =====================================================================
   main.js — start-up for every page.
   Each page sets <body data-page="…">; this file runs the matching
   renderer, then builds the shared shell around the page.
   Load order: icons → data → utils → store → forms → layout → home → pages → listings → stories → premium → i18n → main (+ admin on admin.html)
   ===================================================================== */
const PAGE_RENDERERS = {
  home:         () => { initHome(); renderBoard(); renderHomeNews(); renderHomeStories(); },
  destinations: () => renderDestinationsPage(),
  destination:  () => { if (!window.EDURISE_ROUTE) return location.replace(destUrl(destById(location.hash.slice(1)) ? location.hash.slice(1) : DESTINATIONS[0].id)); renderCountryPage(); },
  universities: () => renderUniversitiesPage(),
  programs:     () => { renderProgramFinder(); renderProgramsPage(); },
  program:      () => { if (!window.EDURISE_ROUTE) return location.replace(progUrl(programById(location.hash.slice(1)) ? location.hash.slice(1) : PROGRAMS[0].id)); renderProgramPage(); },
  eligibility:  () => renderEligibility(),
  estimator:    () => { renderEstimator(); window.addEventListener('hashchange', renderEstimator); },
  scholarships: () => renderScholarshipsPage(),
  services:     () => renderServicesPage(),
  about:        () => renderAboutPage(),
  leadership:   () => renderLeadershipPage(),
  contact:      () => renderContactPage(),
  policies:     () => renderPoliciesPage(),
  news:         () => renderNewsPage()
};

/* which menu item is highlighted for each page */
const ACTIVE_NAV = { leadership: 'about', destination: 'destinations', policies: '', news: '', program: 'programs', eligibility: '', estimator: '' };

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
