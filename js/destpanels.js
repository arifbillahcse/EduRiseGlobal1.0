/* =====================================================================
   destpanels.js — homepage "Study destinations": expanding flag panels.
   One tall panel per country in its flag colours. Hover, focus or click
   widens a panel to show the details. Flags are simple inline SVGs
   (national flags, public domain). Stacks into an accordion on phones.
   ===================================================================== */
const DestPanels = (() => {
  /* panel colours taken from each flag: [deep background, accent] */
  const TONE = {
    korea: ['#0B2A63', '#C60C30'], japan: ['#5E0A1E', '#BC002D'], uk: ['#0A1A52', '#C8102E'], malta: ['#5A1018', '#CF142B'],
    italy: ['#0B4A2E', '#CE2B37'], russia: ['#0E2A66', '#D52B1E'], finland: ['#0A2E66', '#5B8FD9'], malaysia: ['#0A1A5C', '#FFCC00'],
    china: ['#7A0E12', '#FFDE00']
  };
  const flagSVG = id => Landmarks.flagSVG(id, 'dpanel__flagsvg');

  const noteFor = d => {
    const h = HERO_DESTINATIONS.find(x => x.id === d.id);
    return h ? h.note : d.intro.split('. ')[0].replace(/\.$/, '') + '.';
  };
  const openIntakes = id => Store.list('intakes').filter(i => i.dest === id && ['open', 'closing'].includes(windowStatus(i).state)).length;
  const offersFor = id => Store.list('scholarships').filter(o => o.dest === id).length;

  let panels = [], current = 0, hoverTimer = null;

  function panelHTML(d, i) {
    const [bg, accent] = TONE[d.id] || ['#14254A', '#2F5CCB'];
    const open = openIntakes(d.id), offers = offersFor(d.id);
    const ph = (typeof DEST_PHOTOS !== 'undefined' && DEST_PHOTOS[d.id]) || null;
    return `<li class="dpanel${ph ? ' has-photo' : ''}" style="--bg:${bg};--accent:${accent}" data-i="${i}">
      ${ph ? `<img class="dpanel__photo" src="${ph.src}" alt="${esc(ph.alt)}" width="1280" height="853" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async" referrerpolicy="no-referrer" style="object-position:${ph.pos}">` : ''}
      <span class="dpanel__tint" aria-hidden="true"></span>
      <span class="dpanel__scene" aria-hidden="true" style="--sky-a:${Landmarks.sky(d.id)[0]};--sky-b:${Landmarks.sky(d.id)[1]}">${Landmarks.sceneSVG(d.id)}</span>
      <span class="dpanel__code-bg" aria-hidden="true">${d.code}</span>
      <button type="button" class="dpanel__face" id="dp-btn-${d.id}" aria-expanded="false" aria-controls="dp-body-${d.id}">
        <span class="dpanel__flag">${flagSVG(d.id)}</span>
        <span class="dpanel__vname">${esc(d.name)}</span>
        <span class="dpanel__code">${d.code}</span>
        ${open ? `<span class="dpanel__live" title="${open} open">${open}</span>` : ''}
      </button>
      <div class="dpanel__body" id="dp-body-${d.id}" role="region" aria-labelledby="dp-btn-${d.id}">
        <span class="dpanel__city">${icon('pin', 'icon--sm')}<span>${esc(d.city)}</span> · ${d.code}</span>
        <h3 class="dpanel__name">${esc(d.name)}</h3>
        <p class="dpanel__note">${esc(noteFor(d))}</p>
        <div class="dpanel__meta">
          <div class="dpanel__levels">${d.levels.map(l => `<span>${esc(l)}</span>`).join('')}</div>
          <dl class="dpanel__stats">
            <div><dt>Open intakes</dt><dd class="tnum">${open}</dd></div>
            <div><dt>Scholarship offers</dt><dd class="tnum">${offers}</dd></div>
          </dl>
        </div>
        <div class="dpanel__actions">
          <a class="btn btn--sun btn--sm" href="destination.html#${d.id}">Explore ${esc(d.name)}${icon('arrow')}</a>
          <button type="button" class="dpanel__ask" data-enquire="${esc('Studying in ' + d.name)}">${icon('whatsapp')}Ask us</button>
        </div>
      </div>
    </li>`;
  }

  function open(i, { focus = false } = {}) {
    current = (i + panels.length) % panels.length;
    $$('.dpanel').forEach((li, j) => {
      const on = j === current;
      li.classList.toggle('is-open', on);
      $('.dpanel__face', li).setAttribute('aria-expanded', String(on));
      const body = $('.dpanel__body', li);
      body.inert = !on;
      body.setAttribute('aria-hidden', String(!on));
    });
    if (focus) $$('.dpanel__face')[current].focus();
  }

  function init() {
    const box = $('#destPanels'); if (!box) return;
    panels = Store.list('destinations');
    box.innerHTML = panels.map(panelHTML).join('');
    // a photo that fails to load is removed, and the panel shows its drawn landmark instead
    $$('.dpanel__photo', box).forEach(img => {
      const fail = () => { const li = img.closest('.dpanel'); li.classList.remove('has-photo'); img.remove(); };
      if (img.complete && img.naturalWidth === 0 && img.src) fail(); else img.addEventListener('error', fail, { once: true });
    });
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    $$('.dpanel').forEach((li, i) => {
      const face = $('.dpanel__face', li);
      face.addEventListener('click', () => open(i));
      face.addEventListener('keydown', e => {
        const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (k) { e.preventDefault(); open(current + k, { focus: true }); }
      });
      if (canHover) {
        li.addEventListener('mouseenter', () => { clearTimeout(hoverTimer); hoverTimer = setTimeout(() => open(i), 140); });
        li.addEventListener('mouseleave', () => clearTimeout(hoverTimer));
      }
    });
    open(0);
  }
  return { init };
})();
