/* =====================================================================
   utils.js — small shared helpers used by every page.
   ===================================================================== */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* escape text before putting it into HTML */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* icon markup from the SVG sprite (partials/icons.html is pasted into each page) */
const icon = (name, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

/* WhatsApp link with an optional pre-filled message */
const waLink = text => 'https://wa.me/' + SITE.whatsapp + (text ? '?text=' + encodeURIComponent(text) : '');

/* localStorage that never throws (private windows, blocked storage) */
const store = {
  get(key, fallback = null) { try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ } }
};

/* short message at the bottom of the screen */
const Toast = (() => {
  let timer;
  return {
    show(message) {
      const el = $('#toast');
      if (!el) return;
      el.textContent = message;
      el.classList.add('is-visible');
      clearTimeout(timer);
      timer = setTimeout(() => el.classList.remove('is-visible'), 2800);
    }
  };
})();
