/* =====================================================================
   pages.js — inner pages (Phase 4, extended in Phase 5). Each page calls one render function.
   All content comes from data.js.
   ===================================================================== */

const destById = id => DESTINATIONS.find(d => d.id === id);

/* shared: consultation banner used at the bottom of inner pages */
function ctaBandHTML(title = 'Talk to a counsellor this week', text = 'Send us a message on WhatsApp and a counsellor will reply, usually on the same working day.', waText) {
  const href = waText ? ` href="${waLink(waText)}"` : '';
  return `<div class="cta-band">
    <div><h2>${esc(title)}</h2><p>${esc(text)}</p></div>
    <div class="cta-band__actions">
      <a class="btn btn--go btn--lg" data-site-href="whatsapp"${href} target="_blank" rel="noopener">${icon('whatsapp')}Chat on WhatsApp</a>
      <span class="cta-band__phone tnum">${icon('phone')}<span data-site="phone"></span></span>
    </div>
  </div>`;
}
function mountCTA(id, ...args) { const el = $('#' + id); if (el) el.innerHTML = ctaBandHTML(...args); }

/* shared: process steps (also used on the homepage) */
function renderProcessInto(id) {
  const el = $('#' + id);
  if (el) el.innerHTML = PROCESS.map(p => `<li><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></li>`).join('');
}

/* shared: destination card */
function destCardHTML(d) {
  const ph = (typeof DEST_PHOTOS !== 'undefined' && DEST_PHOTOS[d.id]) || null;
  const art = typeof Landmarks !== 'undefined';
  const sky = art ? Landmarks.sky(d.id) : ['#DDE6F5', '#AFC0E6'];
  return `<a class="dest-card" href="destination.html#${d.id}">
    <span class="dest-card__media" style="--sky-a:${sky[0]};--sky-b:${sky[1]}">
      ${art ? Landmarks.sceneSVG(d.id) : ''}
      ${ph ? `<img class="dest-card__img" src="${ph.src}" alt="${esc(ph.alt)}" width="1280" height="853" loading="lazy" decoding="async" referrerpolicy="no-referrer" style="object-position:${ph.pos}" onerror="this.remove()">` : ''}
      ${art ? `<span class="dest-card__flag">${Landmarks.flagSVG(d.id)}</span>` : ''}
    </span>
    <span class="dest-card__route">DAC → ${d.code} · ${esc(d.city)}</span>
    <span class="dest-card__code">${d.code}</span>
    <h3 class="dest-card__name">${esc(d.name)}</h3>
    <span class="dest-card__levels">${d.levels.map(esc).join(' · ')}</span>
    <span class="dest-card__go">View country guide ${icon('arrow')}</span>
  </a>`;
}

/* shared: office card */
function officeHTML(o) {
  return `<article class="card office">
    <span class="office__tag">${esc(o.tag)} · ${esc(o.country)}</span>
    <h3>${esc(o.name)}${o.tbc ? '<span class="tbc">TBC</span>' : ''}</h3>
    <p>${esc(o.address)}</p>
    <a class="link-arrow" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.map)}" target="_blank" rel="noopener">Open in Google Maps ${icon('arrow')}</a>
  </article>`;
}

/* ================= destinations.html ================= */
function renderDestinationsPage() {
  renderDestinationFilter();                      // Package 2: filter by study level (listings.js)
  $('#otherRegions').innerHTML = OTHER_REGIONS.map(r =>
    `<div class="card"><h3 class="region__title">${esc(r.region)}</h3><p>${r.countries.map(esc).join(', ')}</p></div>`).join('');
  mountCTA('destCta', 'Not sure which country fits you?', 'Tell us your results, English score and budget. We will suggest the countries where you have a real chance.');
}

/* ================= destination.html#<id> ================= */
function renderCountryPage() {
  const id = location.hash.replace('#', '');
  const d = destById(id) || DESTINATIONS[0];
  document.title = `Study in ${d.name} | EduRise Global`;
  const docs = documentsFor(d);
  const others = DESTINATIONS.filter(x => x.id !== d.id).slice(0, 4);
  const programLinks = PROGRAM_TYPES.filter(p => p.destinations.includes(d.id));

  $('#countryHead').innerHTML = `
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a href="destinations.html">Destinations</a><span>/</span><span aria-current="page">${esc(d.name)}</span></nav>
    <span class="eyebrow eyebrow--sun">DAC → ${d.code} · ${esc(d.city)}</span>
    <h1>Study in ${esc(d.name)}</h1>
    <p>${esc(d.intro)}</p>
    <div class="page-head__actions"><a class="btn btn--go" href="${waLink(`Hello EduRise Global, I would like to know more about studying in ${d.name}.`)}" target="_blank" rel="noopener">${icon('whatsapp')}Ask about ${esc(d.name)}</a></div>
    <span class="page-head__code" aria-hidden="true">${d.code}</span>`;

  $('#countryMain').innerHTML = `
    <section class="card">
      <h2>Why students choose ${esc(d.name)}</h2>
      <ul class="checks">${d.highlights.map(h => `<li>${icon('check')}<span>${esc(h)}</span></li>`).join('')}</ul>
    </section>
    <section class="card">
      <h2>Study levels we support</h2>
      <div class="tag-row">${d.levels.map(l => `<span class="tag">${esc(l)}</span>`).join('')}</div>
      ${programLinks.length ? `<p class="muted" style="margin-top:12px">Read more about ${programLinks.map(p => `<a href="programs.html#${p.id}">${esc(p.title)}</a>`).join(', ')}.</p>` : ''}
    </section>
    <section class="card">
      <h2>Typical requirements</h2>
      <div class="table-wrap"><table class="data-table"><tbody>
        ${d.requirements.map(r => `<tr><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}
      </tbody></table></div>
      <p class="note">Requirements differ by university and program. A counsellor confirms the exact requirements for your shortlist.</p>
    </section>
    <p class="note note--warn"><b>Please check before you apply:</b> work rights, family accompaniment and visa rules are set by the government and change often. We confirm the current rule with you before you apply.</p>`;

  $('#countryAside').innerHTML = `
    <section class="card">
      <h2 class="h3">Document checklist</h2>
      <p class="muted small">Tick what you already have.</p>
      <ul class="doclist">${docs.map((x, i) => `<li><input type="checkbox" id="doc-${d.id}-${i}"><label for="doc-${d.id}-${i}">${esc(x)}</label></li>`).join('')}</ul>
      <a class="btn btn--ghost btn--sm btn--block" href="checklist.html#${d.id}" target="_blank" rel="noopener">${icon('download')}Download checklist (PDF)</a>
    </section>
    <section class="card card--night">
      <h2 class="h3">Free profile review</h2>
      <p>Send your results on WhatsApp and we will tell you honestly whether ${esc(d.name)} is a good fit.</p>
      <a class="btn btn--sun btn--sm" href="${waLink(`Hello EduRise Global, please review my profile for ${d.name}.`)}" target="_blank" rel="noopener">${icon('whatsapp')}Send my results</a>
    </section>`;

  $('#otherDest').innerHTML = others.map(destCardHTML).join('');
  window.scrollTo(0, 0);
}

/* ================= programs.html ================= */
function renderProgramsPage() {
  $('#programList').innerHTML = PROGRAM_TYPES.map(p => `<article class="program card" id="${p.id}">
    <div class="program__head">
      <span class="card__icon">${icon(p.icon)}</span>
      <div><h2>${esc(p.title)}</h2><span class="program__who">${esc(p.who)}</span></div>
    </div>
    <p>${esc(p.text)}</p>
    <div class="program__cols">
      <div><h3>Typical requirements</h3><ul class="checks checks--sm">${p.requirements.map(r => `<li>${icon('check')}<span>${esc(r)}</span></li>`).join('')}</ul></div>
      <div><h3>Where you can study</h3><div class="tag-row">${p.destinations.map(id => { const d = destById(id); return `<a class="tag tag--link" href="destination.html#${id}">${esc(d.name)}</a>`; }).join('')}</div></div>
    </div>
  </article>`).join('');
  mountCTA('programCta', 'Which program is right for you?', 'A counsellor will look at your results and goals and suggest the level and programs that fit.');
}

/* ================= scholarships.html ================= */
function renderScholarshipsPage() {
  renderScholarshipOffers();                      // Package 2: filterable offers with enquiry (listings.js)
  $('#govGrid').innerHTML = GOV_SCHOLARSHIPS.map(g => `<article class="card gov">
    <div class="gov__top"><h3>${esc(g.name)}</h3><span class="gov__code">${g.code}</span></div>
    <div class="tag-row"><span class="tag">${esc(g.country)}</span><span class="tag">${esc(g.levels)}</span></div>
    <p><b>Coverage:</b> ${esc(g.coverage)}</p>
    ${g.note ? `<p class="note small">${esc(g.note)}</p>` : ''}
    <a class="link-arrow" href="${g.url}" target="_blank" rel="noopener">Official website ${icon('arrow')}</a>
  </article>`).join('');
  mountCTA('scholCta', 'Find out which scholarships you qualify for', 'Send your results and English score. We will check your eligibility before you spend time on an application.');
}

/* ================= services.html ================= */
function renderServicesPage() {
  $('#serviceList').innerHTML = SERVICES.map((s, i) => `<article class="card service-detail">
    <span class="card__icon">${icon(s.icon)}</span>
    <span class="service-detail__num">${String(i + 1).padStart(2, '0')}</span>
    <h2>${esc(s.title)}</h2>
    <p>${esc(s.text)}</p>
    <ul class="checks checks--sm">${s.details.map(x => `<li>${icon('check')}<span>${esc(x)}</span></li>`).join('')}</ul>
  </article>`).join('');
  renderProcessInto('serviceProcess');
  mountCTA('serviceCta');
}

/* ================= leader profile card (about.html, leadership.html) ================= */
function leaderCardHTML(p) {
  const story = [].concat(p.story || p.bio);                 // story can be one paragraph or several
  return `<article class="leader card" id="leader-${p.id}">
    <img class="leader__photo" src="${p.photo}" alt="Portrait of ${esc(p.name)}" width="320" height="320" loading="lazy">
    <div class="leader__body">
      ${p.location ? `<span class="person__loc">${icon('pin', 'icon--sm')}${esc(p.location)}</span>` : ''}
      <h3 class="person__name">${esc(p.name)}</h3>
      <span class="person__role">${esc(p.role)}</span>
      ${p.alsoRole ? `<span class="person__also">${esc(p.alsoRole)}</span>` : ''}
      ${story.map(t => `<p>${esc(t)}</p>`).join('')}
      ${p.portfolio ? `<div class="leader__portfolio"><b>${esc(p.portfolioLabel || 'Direct portfolio')}</b><div class="tag-row">${p.portfolio.map(t => `<span class="tag tag--brand">${esc(t)}</span>`).join('')}</div></div>` : ''}
      ${p.motto ? `<p class="leader__motto">${esc(p.motto)}</p>` : ''}
      <div class="tag-row">${(p.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    </div>
  </article>`;
}

/* ================= leadership.html: only the leader profiles ================= */
function renderLeadershipPage() {
  // leaders not shown on the homepage come first, so "More Leadership" opens on them
  const team = Store.list('team');
  $('#leadersList').innerHTML = team.filter(p => p.onHome === false).concat(team.filter(p => p.onHome !== false)).map(leaderCardHTML).join('');
  mountCTA('leadersCta');
  const target = location.hash && document.getElementById(location.hash.slice(1));   // e.g. leadership.html#leader-ceo from the homepage
  if (target) requestAnimationFrame(() => target.scrollIntoView());
}

/* ================= about.html ================= */
function renderAboutPage() {
  $('#aboutIntro').innerHTML = ABOUT.intro.map(p => `<p>${esc(p)}</p>`).join('');
  $('#aboutVision').textContent = ABOUT.vision;
  $('#aboutMission').innerHTML = ABOUT.mission.map(m => `<li>${icon('check')}<span>${esc(m)}</span></li>`).join('');
  $('#aboutTeam').innerHTML = Store.list('team').map(leaderCardHTML).join('');
  $('#aboutOffices').innerHTML = OFFICES.map(officeHTML).join('');
  $('#aboutCommit').innerHTML = COMMITMENT.points.map(p => `<li>${icon('check')}<span>${esc(p)}</span></li>`).join('');
  mountCTA('aboutCta');
  const target = location.hash && document.getElementById(location.hash.slice(1));   // e.g. about.html#leader-ceo from the homepage
  if (target) requestAnimationFrame(() => target.scrollIntoView());
}

/* ================= contact.html (Package 1: form goes to EduRise's email) ================= */
function renderContactPage() {
  $('#contactOffices').innerHTML = OFFICES.map(officeHTML).join('');
  $('#contactCountry').innerHTML = '<option value="">Not decided yet</option>' +
    DESTINATIONS.map(d => `<option>${esc(d.name)}</option>`).join('') + '<option>Other</option>';
  $('#contactHours').textContent = SITE.hours;
  renderOfficeMap();

  const form = $('#contactForm');
  Forms.attach(form, { name: 'name', phone: 'bdPhone', email: 'optionalEmail', qual: 'required' }, v => {
    const message = `Hello EduRise Global, I am ${v.name}. Qualification: ${v.qual}. Interested in: ${v.country || 'not decided yet'}.${v.msg ? ' ' + v.msg : ''}`;
    Leads.add({ name: v.name, phone: v.phone, email: v.email, qual: v.qual, interest: (v.country || 'Not decided') + (v.msg ? ' · ' + v.msg : ''), source: 'Contact page' });   // Package 3 lead list
    form.hidden = true;
    const ok = $('#contactSuccess');
    ok.hidden = false;
    ok.innerHTML = `<span class="success__tick">${icon('check')}</span>
      <h2>Thank you, ${esc(v.name.split(' ')[0])}</h2>
      <p>On the live website this message is emailed to EduRise and a counsellor contacts you on <b class="tnum">${esc(v.phone)}</b>. For a faster reply, send it on WhatsApp too.</p>
      <div class="success__summary">${esc(message)}</div>
      <div class="success__actions">
        <a class="btn btn--go" href="${waLink(message)}" target="_blank" rel="noopener">${icon('whatsapp')}Send on WhatsApp</a>
        <a class="btn btn--ghost" href="${Forms.mailLink('Consultation request from ' + v.name, message + '\nPhone: ' + v.phone + (v.email ? '\nEmail: ' + v.email : ''))}">${icon('mail')}Send by email</a>
        <button class="btn btn--ghost btn--sm" type="button" id="contactAgain">Send another message</button>
      </div>`;
    $('#contactAgain').addEventListener('click', () => { ok.hidden = true; form.hidden = false; form.reset(); form.elements.name.focus(); });
    ok.focus();
  });
}

/* office map (DOCX §4.1: contact page with a map). Google Maps embed, one office at a time. */
function renderOfficeMap() {
  const box = $('#officeMap'); if (!box) return;
  const src = o => `https://maps.google.com/maps?q=${encodeURIComponent(o.map)}&z=15&output=embed`;
  box.innerHTML = `
    <div class="map__tabs" role="tablist" aria-label="Choose an office">${OFFICES.map((o, i) =>
      `<button type="button" role="tab" class="map__tab" aria-selected="${i === 0}" data-i="${i}">${esc(o.name)}${o.tbc ? ' <span class="tbc">TBC</span>' : ''}</button>`).join('')}</div>
    <div class="map__frame">
      <iframe id="mapFrame" src="${src(OFFICES[0])}" title="Map: ${esc(OFFICES[0].name)} office" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
      <div class="map__card"><b id="mapName">${esc(OFFICES[0].name)}</b><span id="mapAddr">${esc(OFFICES[0].address)}</span>
        <a class="link-arrow" id="mapLink" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(OFFICES[0].map)}" target="_blank" rel="noopener">Directions${icon('arrow')}</a></div>
    </div>`;
  $$('.map__tab', box).forEach(t => t.addEventListener('click', () => {
    const o = OFFICES[+t.dataset.i];
    $$('.map__tab', box).forEach(x => x.setAttribute('aria-selected', String(x === t)));
    const f = $('#mapFrame'); f.src = src(o); f.title = `Map: ${o.name} office`;
    $('#mapName').textContent = o.name; $('#mapAddr').textContent = o.address;
    $('#mapLink').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.map)}`;
  }));
}

/* ================= policies.html ================= */
function renderPoliciesPage() {
  $('#policyNav').innerHTML = POLICIES.map(p => `<a href="#${p.id}">${esc(p.title)}</a>`).join('');
  $('#policyBody').innerHTML = POLICIES.map(p => `<section class="policy" id="${p.id}">
    <h2>${esc(p.title)}</h2>${p.paragraphs.map(t => `<p>${esc(t)}</p>`).join('')}
  </section>`).join('');
  // photo credits: the destination photos are under licences that require the photographer to be credited
  if (typeof DEST_PHOTOS !== 'undefined') {
    $('#policyNav').insertAdjacentHTML('beforeend', '<a href="#photo-credits">Photo credits</a>');
    $('#policyBody').insertAdjacentHTML('beforeend', `<section class="policy" id="photo-credits">
      <h2>Photo credits</h2>
      <p>Destination photos are from Wikimedia Commons and are used under the licences below.</p>
      <ul class="credits">${Object.entries(DEST_PHOTOS).map(([id, ph]) => {
        const d = DESTINATIONS.find(x => x.id === id);
        return `<li><b>${esc(d ? d.name : id)}</b>: ${esc(ph.alt)}. Photo by <a href="${ph.page}" target="_blank" rel="noopener">${esc(ph.by)}</a>, <a href="${ph.licenseUrl}" target="_blank" rel="noopener license">${esc(ph.license)}</a>.</li>`;
      }).join('')}</ul>
    </section>`);
  }
}

/* small helper: buttons with data-toast show a message */
function initToastButtons() {
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-toast]');
    if (b) Toast.show(b.dataset.toast);
  });
}

/* ================= checklist.html#<id> (Phase 8, Package 3) =================
   A printable document checklist per country. "Print or save as PDF" uses the
   browser's print dialog, where visitors choose "Save as PDF". */
function renderChecklistPage() {
  const d = destById(location.hash.slice(1)) || DESTINATIONS[0];
  const docs = documentsFor(d);
  document.title = `${d.name} document checklist | EduRise Global`;
  $('#checklist').innerHTML = `
    <header class="cl-head">
      <div class="cl-brand"><img src="assets/img/brand/logo-mark.png" alt="" width="71" height="40"><div><b>EduRise Global</b><span>Guiding Your Global Future</span></div></div>
      <div class="cl-actions no-print">
        <button type="button" class="btn btn--brand btn--sm" id="clPrint">${icon('download')}Print or save as PDF</button>
        <a class="btn btn--ghost btn--sm" href="destination.html#${d.id}">Back to ${esc(d.name)}</a>
      </div>
    </header>
    <h1>Document checklist: ${esc(d.name)}</h1>
    <p class="cl-meta">Study levels: ${d.levels.map(esc).join(', ')} · Prepared ${formatDate(todayISO())}</p>
    <table class="cl-table">
      <thead><tr><th scope="col" class="cl-num">#</th><th scope="col">Document</th><th scope="col" class="cl-box">Ready</th></tr></thead>
      <tbody>${docs.map((x, i) => `<tr><td class="cl-num tnum">${i + 1}</td><td>${esc(x)}</td><td class="cl-box"><span class="cl-tick" aria-hidden="true"></span></td></tr>`).join('')}</tbody>
    </table>
    <h2>Before you apply</h2>
    <ul class="cl-notes">
      ${d.requirements.map(r => `<li><b>${esc(r[0])}:</b> ${esc(r[1])}</li>`).join('')}
      <li>Requirements differ by university and program. A counsellor confirms the exact list for your shortlist.</li>
      <li>Work rights, family accompaniment and visa rules are set by the government and change often.</li>
    </ul>
    <footer class="cl-foot">
      <span><b>EduRise Global</b> · ${esc(SITE.address)}</span>
      <span class="tnum">${esc(SITE.phone)} · WhatsApp · ${esc(SITE.email)}</span>
    </footer>`;
  $('#clPrint').addEventListener('click', () => window.print());
}
