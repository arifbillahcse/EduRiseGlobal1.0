/* =====================================================================
   premium.js — Package 3 features (Phase 7):
   money helpers · program finder · program detail page · live
   application board · eligibility check · cost estimator
   ===================================================================== */

/* ---------- money ---------- */
const fmtNum = n => Math.round(n).toLocaleString('en-US');
const fmtMoney = (amount, cur) => `${fmtNum(amount)} ${cur}`;
/* taka, rounded to the nearest 1,000 and grouped the Bangladeshi way (3,11,000) */
const toBDT = (amount, cur) => Math.round(amount * RATES[cur] / 1000) * 1000;
const fmtBDT = n => 'BDT ' + Math.round(n).toLocaleString('en-IN');

const programById = id => PROGRAMS.find(p => p.id === id);
const destOf = id => DESTINATIONS.find(d => d.id === id);
const intakesOf = p => p.intakes.map(id => Store.list('intakes', { withHidden: true }).find(i => i.id === id)).filter(Boolean);

/* the window that matters most for a program: open first, then upcoming, else the last one */
function programWindow(p) {
  const list = intakesOf(p).map(i => ({ i, st: windowStatus(i) }));
  return list.find(x => x.st.state === 'closing' || x.st.state === 'open')
      || list.find(x => x.st.state === 'upcoming' && x.i.s)
      || list.find(x => x.st.state === 'upcoming')
      || list[list.length - 1] || null;
}
function tuitionText(t) {
  if (!t) return 'Ask a counsellor';
  if (t.amount === 0) return 'Waived';
  if (t.min !== undefined) return `${fmtNum(t.min)} to ${fmtNum(t.max)} ${t.cur} / ${t.per}`;
  return `${fmtMoney(t.amount, t.cur)} / ${t.per}`;
}
function tuitionBDT(t) {
  if (!t || t.amount === 0) return '';
  if (t.min !== undefined) return `≈ ${fmtBDT(toBDT(t.min, t.cur))} to ${fmtBDT(toBDT(t.max, t.cur)).replace('BDT ', '')}`;
  return `≈ ${fmtBDT(toBDT(t.amount, t.cur))}`;
}
const bestScholarship = p => p.scholarships.length ? Math.max(...p.scholarships.map(s => s.pct)) : 0;

/* ---------- program card (finder, eligibility results) ---------- */
function programCardHTML(p, extra = '') {
  const d = destOf(p.dest), w = programWindow(p);
  return `<article class="prog-card card">
    <div class="prog-card__top"><span class="uni-card__country">${d.code} · ${esc(d.name)}</span>${w ? statusChip(w.st) : ''}</div>
    <h3><a href="program.html#${p.id}">${esc(p.title)}</a></h3>
    <p class="prog-card__uni">${esc(p.university)}</p>
    <dl class="facts facts--2">
      <div><dt>English</dt><dd>${p.english.none ? 'Without IELTS' : 'IELTS ' + p.english.ielts}</dd></div>
      <div><dt>Tuition</dt><dd>${esc(tuitionText(p.tuition))}</dd></div>
      <div><dt>Scholarship</dt><dd>${bestScholarship(p) ? 'Up to ' + bestScholarship(p) + '%' : 'Ask us'}</dd></div>
      <div><dt>Language</dt><dd>${esc(p.language)}</dd></div>
    </dl>
    ${extra}
    <a class="link-arrow" href="program.html#${p.id}">View program details ${icon('arrow')}</a>
  </article>`;
}

/* ---------- program finder on programs.html ---------- */
function renderProgramFinder() {
  const box = $('#finder');
  if (!box) return;
  const intakeNames = [...new Set(PROGRAMS.flatMap(p => intakesOf(p).map(i => i.intake)))];
  box.innerHTML = `
    <div class="field"><label class="field__label" for="pf-q">Search</label><input class="field__control" id="pf-q" type="search" placeholder="University, city or subject"></div>
    <div class="field"><label class="field__label" for="pf-c">Country</label><select class="field__control" id="pf-c"><option value="">All countries</option>${DESTINATIONS.filter(d => PROGRAMS.some(p => p.dest === d.id)).map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('')}</select></div>
    <div class="field"><label class="field__label" for="pf-l">Study level</label><select class="field__control" id="pf-l"><option value="">All levels</option>${LEVELS.map(l => `<option>${esc(l)}</option>`).join('')}</select></div>
    <div class="field"><label class="field__label" for="pf-lang">Taught in</label><select class="field__control" id="pf-lang"><option value="">Any language</option><option value="English">English</option><option value="Korean">Korean</option><option value="Chinese">Chinese</option><option value="Russian">Russian</option></select></div>
    <div class="field"><label class="field__label" for="pf-i">Intake</label><select class="field__control" id="pf-i"><option value="">Any intake</option>${intakeNames.map(n => `<option>${esc(n)}</option>`).join('')}</select></div>
    <label class="choice pf-check"><input type="checkbox" id="pf-noielts"> Without IELTS only</label>
    <label class="choice pf-check"><input type="checkbox" id="pf-open"> Applications open now</label>`;
  const draw = () => {
    const q = $('#pf-q').value.trim().toLowerCase(), c = $('#pf-c').value, l = $('#pf-l').value,
          lang = $('#pf-lang').value, intake = $('#pf-i').value, noIelts = $('#pf-noielts').checked, openNow = $('#pf-open').checked;
    const list = PROGRAMS.filter(p => {
      if (c && p.dest !== c) return false;
      if (l && !p.levels.includes(l)) return false;
      if (lang && !p.language.includes(lang)) return false;
      if (intake && !intakesOf(p).some(i => i.intake === intake)) return false;
      if (noIelts && !p.english.none) return false;
      if (openNow) { const w = programWindow(p); if (!w || !['open', 'closing'].includes(w.st.state)) return false; }
      if (q && !(p.title + ' ' + p.university + ' ' + p.city + ' ' + p.majors.join(' ') + ' ' + destOf(p.dest).name).toLowerCase().includes(q)) return false;
      return true;
    });
    $('#finderCount').textContent = `${list.length} ${list.length === 1 ? 'program' : 'programs'}`;
    $('#finderResults').innerHTML = list.length ? list.map(p => programCardHTML(p)).join('') : emptyHTML('programs');
  };
  box.addEventListener('input', draw);
  box.addEventListener('change', draw);
  draw();
}

/* ---------- program.html#<id> ---------- */
let countdownTimer = null;
function renderProgramPage() {
  const p = programById(location.hash.slice(1)) || PROGRAMS[0];
  const d = destOf(p.dest), w = programWindow(p);
  document.title = `${p.title}, ${p.university} | EduRise Global`;

  $('#progHead').innerHTML = `
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a href="programs.html">Programs</a><span>/</span><a href="destination.html#${d.id}">${esc(d.name)}</a><span>/</span><span aria-current="page">${esc(p.university)}</span></nav>
    <span class="eyebrow eyebrow--sun">DAC → ${d.code} · ${esc(p.city)} <span class="pkg pkg--3">Package 3</span></span>
    <h1>${esc(p.title)}</h1>
    <p>${esc(p.university)}</p>
    <span class="page-head__code" aria-hidden="true">${d.code}</span>`;

  const t = p.tuition;
  const feeRows = [];
  if (t && t.amount !== undefined && t.amount > 0) feeRows.push([`Tuition per ${t.per}`, fmtMoney(t.amount, t.cur), fmtBDT(toBDT(t.amount, t.cur))]);
  if (t && t.min !== undefined) feeRows.push([`Tuition per ${t.per} (range)`, tuitionText(t).replace(' / ' + t.per, ''), tuitionBDT(t).replace('≈ ', '')]);
  p.oneTime.forEach(f => feeRows.push([`${f[0]} (one-time)`, fmtMoney(f[1], t.cur), fmtBDT(toBDT(f[1], t.cur))]));
  let firstPay = null;
  if (t && t.amount > 0 && t.per === 'semester') {
    const first = p.scholarships.find(s => s.scope === 'first');
    const lowest = first ? Math.min(...p.scholarships.map(s => s.pct)) : 0;
    const total = p.oneTime.reduce((a, f) => a + f[1], 0) + t.amount * (1 - lowest / 100);
    firstPay = { label: `First payment${lowest ? ` with the minimum ${lowest}% scholarship` : ''} (fees + first semester)`, local: fmtMoney(total, t.cur), bdt: fmtBDT(toBDT(total, t.cur)) };
  }

  const windows = intakesOf(p);
  const timeline = windows.map(i => {
    const st = windowStatus(i);
    const cls = st.state === 'closed' ? 'is-done' : (st.state === 'open' || st.state === 'closing') ? 'is-now' : '';
    return `<li class="${cls}"><div class="tl__title">${esc(i.round)} ${statusChip(st)}</div><div class="tl__text">${i.s ? 'Apply ' + formatRange(i.s, i.e) : 'Dates to be announced'} · ${esc(i.intake)} intake</div></li>`;
  }).join('') + (p.milestones || []).map(m => `<li><div class="tl__title">${esc(m[0])}</div><div class="tl__text">${esc(m[1])}</div></li>`).join('');

  $('#progMain').innerHTML = `
    <dl class="facts facts--4">
      <div><dt>Level</dt><dd>${esc(p.levels.join(', '))}</dd></div>
      <div><dt>Taught in</dt><dd>${esc(p.language)}</dd></div>
      <div><dt>Duration</dt><dd>${esc(p.duration)}</dd></div>
      <div><dt>Visa route</dt><dd>${esc(p.visa)}</dd></div>
    </dl>
    <section class="card"><h2>About this program</h2>
      <ul class="checks checks--sm">${p.highlights.map(h => `<li>${icon('check')}<span>${esc(h)}</span></li>`).join('')}</ul>
      <h3 class="sub-h">${p.majors.length > 1 ? 'Available majors' : 'Major'}</h3>
      <div class="tag-row">${p.majors.map(m => `<span class="tag">${esc(m)}</span>`).join('')}</div>
    </section>
    <section class="card"><h2>Requirements</h2>
      <div class="table-wrap"><table class="data-table"><tbody>
        <tr><th scope="row">English</th><td>${esc(p.english.text)}</td></tr>
        <tr><th scope="row">Academic</th><td>${p.levels.includes('Master’s') ? 'Completed Bachelor’s degree' : p.levels.includes('Language') ? 'HSC or Bachelor’s, depending on the next degree' : 'HSC / A-levels or equivalent'}${p.cgpa ? `, CGPA ${p.cgpa.toFixed(2)}+` : ''}</td></tr>
        <tr><th scope="row">Documents</th><td>See the <a href="destination.html#${d.id}">${esc(d.name)} document checklist</a></td></tr>
      </tbody></table></div>
    </section>
    <section class="card"><h2>Fees and costs</h2>
      ${feeRows.length ? `<div class="table-wrap"><table class="data-table fee-table">
        <thead><tr><th scope="col">Item</th><th scope="col" class="num">Amount</th><th scope="col" class="num">Approx. in taka</th></tr></thead>
        <tbody>${feeRows.map(r => `<tr><td>${esc(r[0])}</td><td class="num tnum">${esc(r[1])}</td><td class="num tnum">${esc(r[2])}</td></tr>`).join('')}
        ${firstPay ? `<tr class="fee-total"><td>${esc(firstPay.label)}</td><td class="num tnum">${esc(firstPay.local)}</td><td class="num tnum">${esc(firstPay.bdt)}</td></tr>` : ''}</tbody></table></div>
        ${t && t.note ? `<p class="note">${esc(t.note)}</p>` : ''}
        <p class="form-note">Taka amounts use the sample rate of 1 ${t.cur} = ${RATES[t.cur]} BDT (updated ${formatDate(RATES_UPDATED)}). <span class="tbc">TBC</span> Final amounts follow the university invoice.</p>`
      : `<p class="muted">${t && t.amount === 0 ? esc(t.note) : 'Fees vary by university. A counsellor will send you the current fees for your shortlist.'}</p>`}
      ${LIVING_COSTS[p.dest] ? `<a class="btn btn--ghost btn--sm" href="cost-estimator.html#${p.id}" style="margin-top:14px">${icon('filter')}Estimate my total cost</a>` : ''}
    </section>
    ${p.scholarships.length ? `<section class="card"><h2>Scholarship</h2>
      <div class="tiers">${p.scholarships.map(s => `<div class="tier"><b>${s.upTo ? 'Up to ' : ''}${s.pct}%</b><span>${esc(s.label)}</span><small>${s.scope === 'first' ? 'First semester tuition' : 'Tuition'}</small></div>`).join('')}</div>
    </section>` : ''}
    <section class="card"><h2>Application timeline</h2><ol class="tl">${timeline || '<li><div class="tl__text">Dates to be announced</div></li>'}</ol></section>`;

  let side = `<section class="card deadline">`;
  if (w && w.i.s && ['open', 'closing', 'upcoming'].includes(w.st.state)) {
    const opening = w.st.state === 'upcoming';
    const target = new Date(`${opening ? w.i.s : w.i.e}T${opening ? '00:00:00' : '23:59:59'}+06:00`);
    side += `<div class="deadline__head"><h2 class="h3">${esc(w.i.round)}</h2>${statusChip(w.st)}</div>
      <div class="countdown tnum" data-target="${target.toISOString()}" aria-live="off">
        <div><b>--</b><span>days</span></div><div><b>--</b><span>hours</span></div><div><b>--</b><span>min</span></div></div>
      <p class="muted small">${opening ? 'until applications open' : 'until applications close'} (Dhaka time)</p>`;
  } else {
    side += `<div class="deadline__head"><h2 class="h3">${w ? esc(w.i.round) : 'Next intake'}</h2>${w ? statusChip(w.st) : ''}</div>
      <p class="muted small">${w && w.st.state === 'closed' ? 'This round has closed. Ask us and we will tell you when the next one opens.' : 'Dates will be announced soon. Ask us to be told first.'}</p>`;
  }
  side += `<button type="button" class="btn btn--go btn--block" data-enquire="${esc(p.title + ', ' + p.university)}">${icon('whatsapp')}Enquire about this program</button>
    <a class="btn btn--ghost btn--sm btn--block" href="eligibility.html">Check my eligibility first</a></section>
    <p class="note small">Information checked against the university’s published notice. <b>Last verified:</b> ${formatDate(RATES_UPDATED)} <span class="tbc">TBC</span></p>`;
  $('#progAside').innerHTML = side;

  const others = PROGRAMS.filter(x => x.id !== p.id && (x.dest === p.dest || x.levels.some(l => p.levels.includes(l)))).slice(0, 3);
  $('#progRelated').innerHTML = others.map(x => programCardHTML(x)).join('');
  startCountdown();
  window.scrollTo(0, 0);
}
function startCountdown() {
  clearInterval(countdownTimer);
  const tick = () => $$('.countdown').forEach(el => {
    const ms = Math.max(0, new Date(el.dataset.target) - new Date());
    const b = el.querySelectorAll('b');
    b[0].textContent = Math.floor(ms / 864e5);
    b[1].textContent = String(Math.floor(ms % 864e5 / 36e5)).padStart(2, '0');
    b[2].textContent = String(Math.floor(ms % 36e5 / 6e4)).padStart(2, '0');
  });
  tick();
  countdownTimer = setInterval(tick, 30000);
}

/* ---------- live application board (homepage) ---------- */
/* split-flap helpers: every character is a tile; on reveal the tiles cycle and settle like an airport board */
const FLAP_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const flapTiles = (text, cls = '') => `<span class="flap ${cls}" aria-hidden="true">${[...String(text).toUpperCase()].map(ch =>
  ch === ' ' ? '<span class="flap__gap"></span>' : `<span class="flap__t" data-ch="${esc(ch)}">${esc(ch)}</span>`).join('')}</span>`;
/* text field: tiles for the eye (English), real text for screen readers and the Bangla version */
/* shorter wording on the tiles only (the full text stays for screen readers and Bangla) */
const FLAP_SHORT = { 'Dates to be announced': 'Dates TBA' };
const flapField = (text, cls = '') => `<span class="flap-field ${cls}">${flapTiles(FLAP_SHORT[text] || text)}<span class="flap-field__text">${esc(text)}</span></span>`;

function flipIn(root, startDelay = 0) {
  const tiles = $$('.flap__t', root);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  tiles.forEach((t, k) => {
    const final = t.dataset.ch;
    if (!/[A-Z0-9]/.test(final)) return;
    let n = 5 + Math.floor(Math.random() * 6);
    t.textContent = FLAP_CHARS[Math.floor(Math.random() * FLAP_CHARS.length)];
    setTimeout(function tick() {
      t.classList.remove('is-flip'); void t.offsetWidth; t.classList.add('is-flip');
      if (--n <= 0) { t.textContent = final; return; }
      t.textContent = FLAP_CHARS[Math.floor(Math.random() * FLAP_CHARS.length)];
      setTimeout(tick, 55);
    }, startDelay + k * 18);
  });
}

function renderBoard() {
  const el = $('#boardList');
  if (!el) return;
  const rows = liveIntakes().slice(0, 6).map(it => {
    const d = destOf(it.dest), st = windowStatus(it);
    const prog = PROGRAMS.find(p => p.intakes.includes(it.id));
    const href = prog ? `program.html#${prog.id}` : 'universities.html#intakes';
    const [uni, course] = it.title.split(' · ');
    return `<li><a class="board__row" href="${href}">
      <span class="board__code">${flapTiles(d.code, 'flap--lg')}<small>${esc(d.name)}</small></span>
      <span class="board__prog"><b>${esc(uni)}</b><small>${esc(course || it.round)}</small></span>
      <span class="board__meta">
        ${flapField(it.intake, 'board__intake')}
        <span class="board__status board__status--${st.state}"><i class="board__led" aria-hidden="true"></i>${flapField(st.label)}</span>
      </span>
      <span class="board__go" aria-hidden="true">${icon('arrow')}</span>
    </a></li>`;
  });
  el.innerHTML = rows.join('');

  /* Dhaka clock as flap tiles; the minutes flip when they change */
  const clockEl = $('#boardClock');
  let last = '';
  const clock = () => {
    if (!clockEl) return;
    const t = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' }).format(new Date());
    if (t === last) return;
    const first = !last; last = t;
    clockEl.innerHTML = `<span class="board__clock-label">DAC</span>${flapTiles(t, 'flap--clock')}<span class="sr-only">Dhaka time ${t}</span>`;
    if (!first) flipIn(clockEl);
  };
  clock(); setInterval(clock, 15000);

  /* flip the board in, row by row, when it scrolls into view */
  const board = el.closest('.board');
  const reveal = () => $$('.board__row', el).forEach((row, i) => { row.classList.add('is-in'); flipIn(row, 220 + i * 260); });
  if (!('IntersectionObserver' in window)) { reveal(); return; }
  board.classList.add('js-flap');
  new IntersectionObserver((entries, obs) => entries.forEach(e => { if (e.isIntersecting) { reveal(); flipIn(clockEl, 0); obs.disconnect(); } }), { threshold: .3 }).observe(board);
}

/* ---------- eligibility check ---------- */
const QUESTIONS = [
  { key: 'qual', q: 'What is your highest completed qualification?', options: [['ssc', 'SSC / O-levels'], ['hsc', 'HSC / A-levels or Diploma'], ['bach', 'Bachelor’s degree'], ['mast', 'Master’s degree']] },
  { key: 'cgpa', q: 'What was your latest CGPA (out of 4.00)?', options: [['2.3', 'Below 2.50'], ['2.6', '2.50 to 2.69'], ['2.8', '2.70 to 2.99'], ['3.1', '3.00 or higher']] },
  { key: 'eng', q: 'Do you have an English test score?', options: [['0', 'Not yet'], ['5.5', 'IELTS 5.5 to 6.0 (or equivalent)'], ['6.5', 'IELTS 6.5 or higher'], ['moi', 'Medium of instruction letter only']] },
  { key: 'budget', q: 'What can your family spend per year, including living costs?', options: [['low', 'Under BDT 5 lakh'], ['mid', 'BDT 5 to 10 lakh'], ['high', 'Over BDT 10 lakh'], ['schol', 'Only with a full scholarship']] },
  { key: 'region', q: 'Where would you like to study?', options: [['korea', 'South Korea'], ['asia', 'Japan, China or Malaysia'], ['europe', 'Europe (Russia, Finland and others)'], ['any', 'Open to suggestions']] }
];
function scoreProgram(p, a) {
  const why = [];
  let score = 0;
  const wantLevels = a.qual === 'ssc' ? ['Foundation', 'Diploma'] : a.qual === 'hsc' ? ['Bachelor’s', 'Foundation', 'Diploma', 'Language'] : ['Master’s', 'Language'];
  const levelOk = p.levels.some(l => wantLevels.includes(l));
  if (!levelOk) return null;
  score += 35; why.push(['ok', 'Matches your qualification']);
  const ielts = parseFloat(a.eng) || 0;
  if (p.english.none) { score += 20; why.push(['ok', 'No IELTS needed']); }
  else if (ielts >= p.english.ielts) { score += 20; why.push(['ok', `Meets IELTS ${p.english.ielts}`]); }
  else { score += 4; why.push(['no', `Needs IELTS ${p.english.ielts}`]); }
  if (p.cgpa && parseFloat(a.cgpa) < p.cgpa) { score -= 10; why.push(['no', `Needs CGPA ${p.cgpa.toFixed(2)}`]); }
  else { score += 15; why.push(['ok', 'CGPA accepted']); }
  const rank = { low: 0, mid: 1, high: 2 };
  if (a.budget === 'schol') {
    if (p.scholarships.some(s => s.pct === 100)) { score += 20; why.push(['ok', 'Full scholarship available']); }
    else { why.push(['no', 'No full scholarship']); }
  } else if (rank[a.budget] >= rank[p.budget]) { score += 20; why.push(['ok', 'Within your budget']); }
  else { score += 3; why.push(['no', 'Likely above your budget']); }
  const regions = { korea: ['korea'], asia: ['japan', 'china', 'malaysia'], europe: ['russia', 'finland', 'malta', 'italy', 'uk'], any: null }[a.region];
  if (!regions || regions.includes(p.dest)) score += 10; else score -= 8;
  const w = programWindow(p);
  if (w && w.st.state === 'closed') score -= 20;
  return { p, why, score: Math.max(5, Math.min(100, score)) };
}
function renderEligibility() {
  const box = $('#quiz');
  const answers = {};
  let step = 0;
  const draw = () => {
    if (step < QUESTIONS.length) {
      const q = QUESTIONS[step];
      box.innerHTML = `<div class="quiz__progress" aria-hidden="true">${QUESTIONS.map((_, i) => `<span class="${i <= step ? 'is-on' : ''}"></span>`).join('')}</div>
        <span class="eyebrow">Question ${step + 1} of ${QUESTIONS.length}</span>
        <h2 class="quiz__q" id="quizQ">${esc(q.q)}</h2>
        <div class="quiz__options" role="radiogroup" aria-labelledby="quizQ">${q.options.map(o =>
          `<button type="button" role="radio" class="quiz__opt" data-v="${o[0]}" aria-checked="${answers[q.key] === o[0]}"><span class="quiz__dot"></span>${esc(o[1])}</button>`).join('')}</div>
        <div class="quiz__nav">
          <button type="button" class="btn btn--ghost btn--sm" id="qBack" ${step === 0 ? 'hidden' : ''}>Back</button>
          <button type="button" class="btn btn--brand" id="qNext" ${answers[q.key] ? '' : 'disabled'}>${step === QUESTIONS.length - 1 ? 'See my matches' : 'Next'}</button>
        </div>`;
      $$('.quiz__opt', box).forEach(b => b.addEventListener('click', () => { answers[q.key] = b.dataset.v; draw(); $(`.quiz__opt[data-v="${b.dataset.v}"]`, box).focus(); }));
      const back = $('#qBack'); if (back) back.addEventListener('click', () => { step--; draw(); });
      $('#qNext').addEventListener('click', () => { if (answers[q.key]) { step++; draw(); } });
    } else {
      const results = PROGRAMS.map(p => scoreProgram(p, answers)).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 4);
      const summary = QUESTIONS.map(q => q.options.find(o => o[0] === answers[q.key])[1]).join('; ');
      box.innerHTML = `<span class="eyebrow">Your matches</span>
        <h2 class="quiz__q">${results.length ? 'Programs that fit your profile' : 'No close match in our current list'}</h2>
        <p class="muted">${results.length ? 'Ranked by how well each program matches your answers.' : 'A counsellor can suggest other universities or a pathway program.'}</p>
        <div class="quiz__results">${results.map(r => `<div class="match">
          ${programCardHTML(r.p, `<ul class="match__why">${r.why.map(w => `<li class="${w[0] === 'ok' ? 'is-ok' : 'is-no'}">${w[0] === 'ok' ? '✓' : '✕'} ${esc(w[1])}</li>`).join('')}</ul>`)}
          <div class="match__score" aria-label="${r.score}% match"><b class="tnum">${r.score}%</b><span>match</span></div>
        </div>`).join('')}</div>
        <p class="note">This is a guide based on published requirements. It is not an admission decision.</p>
        <div class="quiz__nav">
          <button type="button" class="btn btn--ghost btn--sm" id="qRestart">Start again</button>
          <button type="button" class="btn btn--go" data-enquire="${esc('Eligibility check result: ' + summary)}">${icon('whatsapp')}Discuss my results</button>
        </div>`;
      $('#qRestart').addEventListener('click', () => { Object.keys(answers).forEach(k => delete answers[k]); step = 0; draw(); });
    }
  };
  draw();
}

/* ---------- cost estimator ---------- */
function renderEstimator() {
  const priced = PROGRAMS.filter(p => p.tuition && LIVING_COSTS[p.dest]);
  const pre = programById(location.hash.slice(1));
  $('#estForm').innerHTML = `
    <div class="field"><label class="field__label" for="es-p">Program</label><select class="field__control" id="es-p">${priced.map(p => `<option value="${p.id}" ${pre && pre.id === p.id ? 'selected' : ''}>${esc(p.university)}: ${esc(p.title)}</option>`).join('')}</select></div>
    <div class="field"><label class="field__label" for="es-y">How many years to estimate</label><select class="field__control" id="es-y"><option value="1">First year</option><option value="2">2 years</option><option value="3">3 years</option><option value="4">4 years</option></select></div>
    <div class="field"><label class="field__label" for="es-s">Scholarship</label><select class="field__control" id="es-s"></select></div>
    <div class="field"><label class="field__label" for="es-l">Living style</label><select class="field__control" id="es-l"><option value="0.8">Careful budget</option><option value="1" selected>Typical student</option><option value="1.25">Comfortable</option></select></div>
    <label class="choice"><input type="checkbox" id="es-f" checked> Include one-time fees (application, entrance, visa)</label>`;
  const fillScholarships = () => {
    const p = programById($('#es-p').value);
    // preselect the guaranteed (lowest) scholarship; "up to" awards are never assumed
    const sure = p.scholarships.map((s, i) => ({ s, i })).filter(x => !x.s.upTo).sort((a, b) => a.s.pct - b.s.pct)[0];
    $('#es-s').innerHTML = '<option value="-1">No scholarship</option>' + p.scholarships.map((s, i) => `<option value="${i}" ${sure && sure.i === i ? 'selected' : ''}>${s.upTo ? 'Up to ' : ''}${s.pct}%: ${esc(s.label)}</option>`).join('');
  };
  const draw = () => {
    const p = programById($('#es-p').value), years = Number($('#es-y').value), style = Number($('#es-l').value);
    const t = p.tuition, cur = t.cur;
    const s = p.scholarships[Number($('#es-s').value)];
    const perYear = t.min !== undefined ? (t.min + t.max) / 2 : (t.per === 'semester' ? t.amount * 2 : t.amount);
    const semester = t.per === 'semester' ? t.amount : perYear / 2;
    const tuition = perYear * years;
    const discount = !s ? 0 : s.scope === 'first' ? semester * s.pct / 100 : tuition * s.pct / 100;
    const fees = $('#es-f').checked ? p.oneTime.reduce((a, f) => a + f[1], 0) : 0;
    const lc = LIVING_COSTS[p.dest];
    const livingBDT = toBDT(lc.amount * style * 12 * years, lc.cur);
    const tuitionBDTv = toBDT(tuition, cur), discountBDT = toBDT(discount, cur), feesBDT = toBDT(fees, cur);
    const total = tuitionBDTv - discountBDT + feesBDT + livingBDT;
    const parts = [['Tuition after scholarship', tuitionBDTv - discountBDT, 'tuition'], ['One-time fees', feesBDT, 'fees'], ['Living costs', livingBDT, 'living']];
    $('#estResult').innerHTML = `
      <span class="eyebrow">Estimated total</span>
      <p class="est__total tnum">${fmtBDT(total)}</p>
      <p class="muted small">${years === 1 ? 'First year' : years + ' years'} · ${esc(destOf(p.dest).name)}${t.min !== undefined ? ' · tuition uses the middle of the range' : ''}</p>
      <div class="est__bar" aria-hidden="true">${parts.filter(x => x[1] > 0).map(x => `<span class="est__seg est__seg--${x[2]}" style="flex:${x[1]}"></span>`).join('')}</div>
      <div class="table-wrap"><table class="data-table est__table"><tbody>
        <tr><td><i class="est__key est__key--tuition"></i>Tuition (${years === 1 ? '1 year' : years + ' years'})</td><td class="num tnum">${fmtMoney(tuition, cur)}</td><td class="num tnum">${fmtBDT(tuitionBDTv)}</td></tr>
        ${discount ? `<tr><td>Scholarship (${s.pct}%${s.scope === 'first' ? ', first semester' : ''})</td><td class="num tnum">− ${fmtMoney(discount, cur)}</td><td class="num tnum">− ${fmtBDT(discountBDT)}</td></tr>` : ''}
        ${fees ? `<tr><td><i class="est__key est__key--fees"></i>One-time fees</td><td class="num tnum">${fmtMoney(fees, cur)}</td><td class="num tnum">${fmtBDT(feesBDT)}</td></tr>` : ''}
        <tr><td><i class="est__key est__key--living"></i>Living costs (${12 * years} months)</td><td class="num tnum">${fmtMoney(lc.amount * style * 12 * years, lc.cur)}</td><td class="num tnum">${fmtBDT(livingBDT)}</td></tr>
        <tr class="fee-total"><td>Estimated total</td><td></td><td class="num tnum">${fmtBDT(total)}</td></tr>
      </tbody></table></div>
      <p class="note small"><b>This is an estimate, not a quote.</b> Tuition comes from the university’s published fees, living costs are typical amounts (${esc(lc.note.toLowerCase())}), and taka uses sample exchange rates updated ${formatDate(RATES_UPDATED)}. <span class="tbc">TBC</span> It does not include flights, visa medicals, insurance or our service charge.</p>
      <button type="button" class="btn btn--go btn--block" data-enquire="${esc(`Cost estimate: ${p.university}, ${p.title}, ${fmtBDT(total)} for ${years === 1 ? 'the first year' : years + ' years'}`)}">${icon('whatsapp')}Discuss this estimate</button>
      <a class="link-arrow" href="program.html#${p.id}">View program details ${icon('arrow')}</a>`;
  };
  fillScholarships();
  $('#es-p').addEventListener('change', () => { fillScholarships(); draw(); });
  $('#estForm').addEventListener('change', draw);
  draw();
}
