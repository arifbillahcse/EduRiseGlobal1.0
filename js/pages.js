/* =====================================================================
   pages.js — inner pages (Phase 4). Each page calls one render function.
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
  return `<a class="dest-card" href="destination.html#${d.id}">
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
  $('#destGrid').innerHTML = DESTINATIONS.map(destCardHTML).join('');
  $('#otherRegions').innerHTML = OTHER_REGIONS.map(r =>
    `<div class="card"><h3 class="region__title">${esc(r.region)}</h3><p>${r.countries.map(esc).join(', ')}</p></div>`).join('');
  mountCTA('destCta', 'Not sure which country fits you?', 'Tell us your results, English score and budget. We will suggest the countries where you have a real chance.');
}

/* ================= destination.html#<id> ================= */
function renderCountryPage() {
  const id = location.hash.replace('#', '');
  const d = destById(id) || DESTINATIONS[0];
  document.title = `Study in ${d.name} | EduRise Global`;
  const docs = BASE_DOCUMENTS.concat(d.extraDocs);
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
      <button class="btn btn--ghost btn--sm btn--block" type="button" data-toast="The ${esc(d.name)} checklist PDF will be added before launch (TBC).">${icon('download')}Download checklist (PDF)</button>
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
  $('#offerRows').innerHTML = SCHOLARSHIP_OFFERS.map(o => `<tr>
    <th scope="row">${esc(o.university)}<span class="cell-sub">${esc(o.country)}</span></th>
    <td>${esc(o.level)}</td>
    <td><b class="award">${esc(o.award)}</b><span class="cell-sub">${esc(o.condition)}</span></td>
    <td class="nowrap">${esc(o.intake)}</td>
  </tr>`).join('');
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

/* ================= about.html ================= */
function renderAboutPage() {
  $('#aboutIntro').innerHTML = ABOUT.intro.map(p => `<p>${esc(p)}</p>`).join('');
  $('#aboutVision').textContent = ABOUT.vision;
  $('#aboutMission').innerHTML = ABOUT.mission.map(m => `<li>${icon('check')}<span>${esc(m)}</span></li>`).join('');
  $('#aboutTeam').innerHTML = TEAM.map(p => `<article class="leader card">
    <img class="leader__photo" src="${p.photo}" alt="Portrait of ${esc(p.name)}" width="320" height="320" loading="lazy">
    <div class="leader__body">
      <span class="person__loc">${icon('pin', 'icon--sm')}${esc(p.location)}</span>
      <h3 class="person__name">${esc(p.name)}</h3>
      <span class="person__role">${esc(p.role)}</span>
      <p>${esc(p.story)}</p>
      <div class="tag-row">${p.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    </div>
  </article>`).join('');
  $('#aboutOffices').innerHTML = OFFICES.map(officeHTML).join('');
  $('#aboutCommit').innerHTML = COMMITMENT.points.map(p => `<li>${icon('check')}<span>${esc(p)}</span></li>`).join('');
  mountCTA('aboutCta');
}

/* ================= contact.html (Package 1: form goes to EduRise's email) ================= */
function renderContactPage() {
  $('#contactOffices').innerHTML = OFFICES.map(officeHTML).join('');
  $('#contactCountry').innerHTML = '<option value="">Not decided yet</option>' +
    DESTINATIONS.map(d => `<option>${esc(d.name)}</option>`).join('') + '<option>Other</option>';
  $('#contactHours').textContent = SITE.hours;

  const form = $('#contactForm');
  Forms.attach(form, { name: 'name', phone: 'bdPhone', email: 'optionalEmail', qual: 'required' }, v => {
    const message = `Hello EduRise Global, I am ${v.name}. Qualification: ${v.qual}. Interested in: ${v.country || 'not decided yet'}.${v.msg ? ' ' + v.msg : ''}`;
    form.hidden = true;
    const ok = $('#contactSuccess');
    ok.hidden = false;
    ok.innerHTML = `<span class="success__tick">${icon('check')}</span>
      <h2>Thank you, ${esc(v.name.split(' ')[0])}</h2>
      <p>On the live website this message is emailed to EduRise and a counsellor contacts you on <b class="tnum">${esc(v.phone)}</b>. For a faster reply, send it on WhatsApp too.</p>
      <div class="success__summary">${esc(message)}</div>
      <div class="success__actions">
        <a class="btn btn--go" href="${waLink(message)}" target="_blank" rel="noopener">${icon('whatsapp')}Send on WhatsApp</a>
        <button class="btn btn--ghost btn--sm" type="button" id="contactAgain">Send another message</button>
      </div>`;
    $('#contactAgain').addEventListener('click', () => { ok.hidden = true; form.hidden = false; form.reset(); form.elements.name.focus(); });
    ok.focus();
  });
}

/* ================= policies.html ================= */
function renderPoliciesPage() {
  $('#policyNav').innerHTML = POLICIES.map(p => `<a href="#${p.id}">${esc(p.title)}</a>`).join('');
  $('#policyBody').innerHTML = POLICIES.map(p => `<section class="policy" id="${p.id}">
    <h2>${esc(p.title)}</h2>${p.paragraphs.map(t => `<p>${esc(t)}</p>`).join('')}
  </section>`).join('');
}

/* small helper: buttons with data-toast show a message */
function initToastButtons() {
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-toast]');
    if (b) Toast.show(b.dataset.toast);
  });
}
