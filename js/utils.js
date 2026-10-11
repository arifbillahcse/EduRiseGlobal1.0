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

/* ---------- dates and application status (always Dhaka time) ---------- */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function todayISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
const dayNumber = iso => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
function formatDate(iso) { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; }
function formatRange(s, e) {
  const [y1, m1, d1] = s.split('-').map(Number), [y2, m2, d2] = e.split('-').map(Number);
  return (y1 === y2 && m1 === m2) ? `${d1} to ${d2} ${MONTHS[m2 - 1]} ${y2}` : `${formatDate(s)} to ${formatDate(e)}`;
}

/* status of one application window: { state: open | closing | upcoming | closed, label, days }
   rounds without dates ({ tba: true }) count as upcoming with "Dates to be announced" */
function windowStatus(item) {
  if (item.tba || !item.s) return { state: 'upcoming', label: 'Dates to be announced' };
  const today = dayNumber(todayISO()), start = dayNumber(item.s), end = dayNumber(item.e);
  if (today < start) { const n = start - today; return { state: 'upcoming', days: n, label: n === 1 ? 'Opens tomorrow' : `Opens in ${n} days` }; }
  if (today <= end) {
    const n = end - today;
    return { state: n <= 3 ? 'closing' : 'open', days: n, label: n === 0 ? 'Closes today' : n === 1 ? 'Closes tomorrow' : `Open · ${n} days left` };
  }
  return { state: 'closed', label: 'Closed' };
}
/* chip markup for a status (classes from components.css) */
const STATUS_CHIP = { open: 'chip--open', closing: 'chip--urgent', upcoming: 'chip--soon', closed: 'chip--closed' };
const statusChip = st => `<span class="chip ${STATUS_CHIP[st.state] || 'chip--tba'}">${esc(st.label)}</span>`;
const STATUS_ORDER = { closing: 0, open: 1, upcoming: 2, closed: 3 };
