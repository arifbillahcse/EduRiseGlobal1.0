/* =====================================================================
   forms.js — validation and sending for every form on the site.
   Markup: .field > .field__label + .field__control + .field__error
   An invalid field gets .field--error; the message under it explains the fix.

   The server checks everything again (POST /enquiry): it saves the lead
   first, then emails EduRise. The page sends the form stamp it was given
   (window.EDURISE_FORM.token), the hidden honeypot and, when Cloudflare
   Turnstile is switched on, the bot-check answer.
   ===================================================================== */
const Forms = (() => {
  /* reusable rules: return true when the value is valid (the server uses the same rules) */
  const RULES = {
    required: v => v.trim().length > 0,
    name:     v => v.trim().length >= 2,
    bdPhone:  v => /^(?:\+?880|0)1[3-9]\d{8}$/.test(v.replace(/[\s\-().]/g, '')),
    email:    v => /^\S+@\S+\.\S+$/.test(v.trim()),
    optionalEmail: v => !v.trim() || /^\S+@\S+\.\S+$/.test(v.trim())
  };
  const FORM = window.EDURISE_FORM || {};

  function check(form, name, ruleName) {
    const el = form.elements[name];
    const ok = RULES[ruleName](el.value);
    mark(form, name, !ok);
    return ok;
  }
  function mark(form, name, bad, message) {
    const el = form.elements[name]; if (!el || !el.closest) return false;
    const field = el.closest('.field'); if (!field) return false;
    field.classList.toggle('field--error', bad);
    el.setAttribute('aria-invalid', String(bad));
    const err = $('.field__error', field);
    if (err && message) { err.dataset.en = err.dataset.en || err.textContent; err.textContent = message; }
    else if (err && err.dataset.en && !bad) err.textContent = err.dataset.en;
    return true;
  }
  function alertBox(form, html) {
    let box = $('.form-alert', form);
    if (!box) { box = document.createElement('p'); box.className = 'form-alert'; box.setAttribute('role', 'alert'); form.querySelector('[type=submit]').before(box); }
    box.hidden = !html; box.innerHTML = html || '';
    if (html) box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /* a hidden "website" field people never see but bots fill in (checked again on the server) */
  const HONEYPOT = '<div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>';

  /* ---------- Cloudflare Turnstile (only when the site key is set on the server) ---------- */
  let tsReady = null;
  function turnstile(form) {
    if (!FORM.turnstile) return;
    let slot = $('.ts-slot', form);
    if (!slot) { slot = document.createElement('div'); slot.className = 'ts-slot'; form.querySelector('[type=submit]').before(slot); }
    tsReady = tsReady || new Promise(resolve => {
      window.onEduriseTurnstile = resolve;
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onEduriseTurnstile';
      s.async = true; document.head.appendChild(s);
    });
    tsReady.then(() => { if (!slot.dataset.ts) slot.dataset.ts = window.turnstile.render(slot, { sitekey: FORM.turnstile, size: 'flexible' }); });
  }

  /* attach(form, { fieldName: ruleName, … }, onValid(values)) — validates, then calls onValid */
  function attach(form, schema, onValid) {
    const names = Object.keys(schema);
    form.setAttribute('novalidate', '');
    if (!form.elements.website) form.insertAdjacentHTML('afterbegin', HONEYPOT);
    turnstile(form);
    names.forEach(n => {
      const el = form.elements[n];
      // clear an error as soon as the field is fixed, so the layout is stable before submit
      const recheck = () => { if (el.closest('.field').classList.contains('field--error')) check(form, n, schema[n]); };
      el.addEventListener('input', recheck);
      el.addEventListener('change', recheck);
      el.addEventListener('blur', () => { if (el.value) check(form, n, schema[n]); });
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      alertBox(form, '');
      const bad = names.filter(n => !check(form, n, schema[n]));
      if (bad.length) { form.elements[bad[0]].focus(); return; }
      const values = Object.fromEntries(new FormData(form).entries());
      ['website', 'ft', 'source', 'cf-turnstile-response'].forEach(k => delete values[k]);
      onValid(values);
    });
    form.addEventListener('reset', () => setTimeout(() => {
      $$('.field--error', form).forEach(f => f.classList.remove('field--error'));
      alertBox(form, '');
      const slot = $('.ts-slot', form); if (slot && slot.dataset.ts && window.turnstile) window.turnstile.reset(slot.dataset.ts);
    }, 0));
  }

  /* send(form, extra) — posts the form to the server. Resolves true when the lead is saved;
     otherwise shows what to fix (under the fields, or above the button) and resolves false. */
  async function send(form, extra = {}) {
    const btn = form.querySelector('[type=submit]');
    const body = new FormData(form);
    body.set('ft', FORM.token || '');
    Object.entries(extra).forEach(([k, v]) => body.set(k, v));
    btn.setAttribute('aria-busy', 'true'); btn.disabled = true;
    try {
      const res = await fetch('enquiry', { method: 'POST', body, headers: { Accept: 'application/json' }, credentials: 'same-origin' });
      const out = await res.json().catch(() => ({ ok: false, errors: {} }));
      if (res.ok && out.ok) return true;
      const errors = out.errors || {};
      let first = null;
      Object.entries(errors).forEach(([name, msg]) => { if (name !== 'form' && mark(form, name, true, msg) && !first) first = form.elements[name]; });
      const general = errors.form || (!first ? 'We could not send your message just now.' : '');
      if (general) alertBox(form, `${esc(general)} <a href="${waLink(SITE.whatsappGreeting)}" target="_blank" rel="noopener">Message us on WhatsApp</a> instead.`);
      if (first) first.focus();
      return false;
    } catch (e) {
      alertBox(form, `We could not reach the server. Check your connection, or <a href="${waLink(SITE.whatsappGreeting)}" target="_blank" rel="noopener">message us on WhatsApp</a>.`);
      return false;
    } finally {
      btn.removeAttribute('aria-busy'); btn.disabled = false;
      const slot = $('.ts-slot', form); if (slot && slot.dataset.ts && window.turnstile) window.turnstile.reset(slot.dataset.ts);
    }
  }

  /* email fallback for the success panels */
  const mailLink = (subject, body) => `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { attach, send, RULES, mailLink };
})();
