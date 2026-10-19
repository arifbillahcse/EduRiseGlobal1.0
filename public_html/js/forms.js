/* =====================================================================
   forms.js — form validation shared by every form on the site.
   Markup: .field > .field__label + .field__control + .field__error
   An invalid field gets .field--error; the message under it explains the fix.
   ===================================================================== */
const Forms = (() => {
  /* reusable rules: return true when the value is valid */
  const RULES = {
    required: v => v.trim().length > 0,
    name:     v => v.trim().length >= 2,
    bdPhone:  v => /^(?:\+?880|0)1[3-9]\d{8}$/.test(v.replace(/[\s-]/g, '')),
    email:    v => /^\S+@\S+\.\S+$/.test(v.trim()),
    optionalEmail: v => !v.trim() || /^\S+@\S+\.\S+$/.test(v.trim())
  };

  function check(form, name, ruleName) {
    const el = form.elements[name];
    const ok = RULES[ruleName](el.value);
    el.closest('.field').classList.toggle('field--error', !ok);
    el.setAttribute('aria-invalid', String(!ok));
    return ok;
  }

  /* spam protection (DOCX §8): a hidden "website" field people never see but bots fill in,
     plus a minimum time on the form. The live site repeats both checks on the server. */
  const HONEYPOT = '<div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>';
  const isSpam = (form, opened) => (form.elements.website && form.elements.website.value.trim() !== '') || Date.now() - opened < 1500;

  /* attach(form, { fieldName: ruleName, … }, onValid(values)) — adds the honeypot to the form */
  function attach(form, schema, onValid) {
    const names = Object.keys(schema);
    form.setAttribute('novalidate', '');
    if (!form.elements.website) form.insertAdjacentHTML('afterbegin', HONEYPOT);
    names.forEach(n => {
      const el = form.elements[n];
      // clear an error as soon as the field is fixed, so the layout is stable before submit
      const recheck = () => { if (el.closest('.field').classList.contains('field--error')) check(form, n, schema[n]); };
      el.addEventListener('input', recheck);
      el.addEventListener('change', recheck);
      el.addEventListener('blur', () => { if (el.value) check(form, n, schema[n]); });
    });
    const opened = Date.now();
    form.addEventListener('submit', e => {
      e.preventDefault();
      const bad = names.filter(n => !check(form, n, schema[n]));
      if (bad.length) { form.elements[bad[0]].focus(); return; }
      if (isSpam(form, opened)) return;               // silently ignore bots
      const values = Object.fromEntries(new FormData(form).entries());
      delete values.website;
      onValid(values);
    });
    form.addEventListener('reset', () => setTimeout(() =>
      $$('.field--error', form).forEach(f => f.classList.remove('field--error')), 0));
  }
  /* email fallback for the success panels (DOCX §4.1: the contact form reaches EduRise by email) */
  const mailLink = (subject, body) => `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { attach, RULES, mailLink };
})();
