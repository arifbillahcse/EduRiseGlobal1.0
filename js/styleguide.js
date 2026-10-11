/* =====================================================================
   styleguide.js — interactions for the style guide page only:
   theme preview, colour swatches (read live from tokens.css, with
   contrast check), spacing scale, icon list, form validation demo,
   section highlighting in the side menu, and the toast.
   ===================================================================== */
(() => {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2400);
  }
  function copy(text, label) {
    const done = () => toast(`Copied ${label || text}`);
    try { navigator.clipboard.writeText(text).then(done, () => toast(text)); } catch (e) { toast(text); }
  }

  /* ---------- colour tokens shown in the guide ----------
     [token, usage, text token used on it (for the contrast check)] */
  const COLOURS = {
    brand:   [['--brand', 'Logo royal blue. Secondary buttons, active menu', '--brand-ink'],
              ['--brand-text', 'Links and blue text on light surfaces', '--surface'],
              ['--brand-soft', 'Selected states, icon backgrounds', '--brand-text'],
              ['--sun', 'Highlights, call-outs on dark', '--sun-ink']],
    state:   [['--go', 'Main action, WhatsApp, "open" status', '--go-ink'],
              ['--go-soft', '"Open" chip background', '--go-text'],
              ['--sun-soft', '"Opens soon" chip, TBC badge', '--sun-text'],
              ['--alert', '"Closing soon", form errors', '--surface'],
              ['--alert-soft', '"Closing soon" chip background', '--alert']],
    neutral: [['--ink', 'Headings and main text', '--paper'],
              ['--ink-2', 'Body copy, descriptions', '--paper'],
              ['--ink-3', 'Captions, meta labels', '--surface'],
              ['--line', 'Borders, dividers', '--ink'],
              ['--surface', 'Cards, header', '--ink'],
              ['--paper', 'Page background', '--ink']],
    night:   [['--night', 'Hero and footer background', '--night-fg'],
              ['--night-dim', 'Secondary text on dark', '--night'],
              ['--board', 'Application board (Package 3)', '--board-fg']]
  };

  const cssVar = name => getComputedStyle(root).getPropertyValue(name).trim();
  function toRGB(hex) {
    const h = hex.replace('#', '');
    const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16));
  }
  function luminance([r, g, b]) {
    const c = [r, g, b].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
  }
  function contrast(a, b) {
    const la = luminance(toRGB(a)), lb = luminance(toRGB(b));
    return (Math.max(la, lb) + .05) / (Math.min(la, lb) + .05);
  }

  function renderSwatches() {
    $$('[data-swatches]').forEach(box => {
      box.innerHTML = COLOURS[box.dataset.swatches].map(([token, use, textToken]) => {
        const bg = cssVar(token), fg = cssVar(textToken);
        const ratio = /^#[0-9a-f]{3,6}$/i.test(bg) && /^#[0-9a-f]{3,6}$/i.test(fg) ? contrast(bg, fg) : null;
        const pass = ratio && ratio >= 4.5;
        const badge = ratio ? `<span class="aa ${pass ? '' : 'aa--fail'}">${pass ? 'AA' : 'Low'} ${ratio.toFixed(1)}</span>` : '';
        return `<button type="button" class="swatch" data-copy="${bg}" data-label="${token} ${bg}">
          <span class="swatch__chip" style="background:${bg};color:${fg}"><span>Aa</span>${badge}</span>
          <span class="swatch__body"><span class="swatch__name">${token}</span><span class="swatch__hex">${bg.toUpperCase()}</span><span class="swatch__use">${use}</span></span>
        </button>`;
      }).join('');
    });
  }

  /* ---------- spacing scale ---------- */
  function renderSpacing() {
    const steps = [1, 2, 3, 4, 5, 6, 8, 12, 18];
    $('#spaceScale').innerHTML = steps.map(n => {
      const v = cssVar(`--s-${n}`);
      return `<div class="space-row"><span>--s-${n}</span><span>${v}</span><i style="width:${v}"></i></div>`;
    }).join('');
  }

  /* ---------- icon list (reads the sprite) ---------- */
  function renderIcons() {
    const ids = $$('symbol[id^="i-"]').map(s => s.id.slice(2));
    $('#iconGrid').innerHTML = ids.map(id =>
      `<button type="button" class="icon-cell" data-copy='&lt;svg class="icon" aria-hidden="true"&gt;&lt;use href="#i-${id}"&gt;&lt;/use&gt;&lt;/svg&gt;' data-label="icon ${id}">
        <svg class="icon" aria-hidden="true"><use href="#i-${id}"></use></svg>${id}</button>`).join('');
  }

  /* ---------- theme preview ---------- */
  function setTheme(mode) {
    if (mode === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', mode);
    $$('[data-theme-set]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeSet === mode)));
    try { localStorage.setItem('edurise-sg-theme', mode); } catch (e) { /* ignore */ }
    renderSwatches();
  }

  /* ---------- form validation demo ---------- */
  const RULES = {
    name:  v => v.trim().length >= 2,
    phone: v => /^(?:\+?880|0)1[3-9]\d{8}$/.test(v.replace(/[\s-]/g, '')),
    email: v => !v.trim() || /^\S+@\S+\.\S+$/.test(v.trim()),
    qual:  v => !!v
  };
  function checkField(form, name) {
    const input = form.elements[name];
    const ok = RULES[name](input.value);
    const field = input.closest('.field');
    field.classList.toggle('field--error', !ok);
    input.setAttribute('aria-invalid', String(!ok));
    return ok;
  }
  function initForm() {
    const form = $('#demoForm');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const bad = Object.keys(RULES).filter(n => !checkField(form, n));
      if (bad.length) { form.elements[bad[0]].focus(); toast('Please fix the highlighted fields'); return; }
      toast('Looks good. On the live site this opens WhatsApp with your details.');
    });
    form.addEventListener('reset', () => setTimeout(() => $$('.field', form).forEach(f => f.classList.remove('field--error')), 0));
    Object.keys(RULES).forEach(n => {
      const el = form.elements[n];
      // once a field shows an error, clear it as soon as it is fixed (so the layout is stable before the user clicks submit)
      const recheck = () => { if (el.closest('.field').classList.contains('field--error')) checkField(form, n); };
      el.addEventListener('input', recheck);
      el.addEventListener('change', recheck);
      // first check when leaving a filled-in field
      el.addEventListener('blur', () => { if (el.value) checkField(form, n); });
    });
  }

  /* ---------- side menu highlights the section on screen ---------- */
  function initScrollSpy() {
    const links = $$('.sg-nav a');
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(a => a.classList.remove('is-active'));
        const a = map.get(en.target.id);
        if (a) {
          a.classList.add('is-active');
          const nav = $('.sg-nav');
          if (nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });  // phone/tablet: keep the active tab visible
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    $$('.sg-sec').forEach(s => io.observe(s));
  }

  document.addEventListener('DOMContentLoaded', () => {
    let saved = 'auto';
    try { saved = localStorage.getItem('edurise-sg-theme') || 'auto'; } catch (e) { /* ignore */ }
    setTheme(saved);
    renderSpacing();
    renderIcons();
    initForm();
    initScrollSpy();
    $$('[data-theme-set]').forEach(b => b.addEventListener('click', () => setTheme(b.dataset.themeSet)));
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', renderSwatches);
    document.addEventListener('click', e => {
      const c = e.target.closest('[data-copy]');
      if (c) copy(c.dataset.copy, c.dataset.label);
    });
  });
})();
