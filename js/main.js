/* =====================================================================
   main.js — start-up for index.html.
   Load order: data.js → utils.js → layout.js → home.js → main.js
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initHome();           // render homepage sections first …
  initLayout('home');   // … so the shell can bind WhatsApp links inside them
});
