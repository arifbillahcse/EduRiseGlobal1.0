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
  const star = (cx, cy, r, n = 5, inner = .382, rot = -90) => {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const a = (rot + i * 180 / n) * Math.PI / 180, rr = i % 2 ? r * inner : r;
      pts.push((cx + rr * Math.cos(a)).toFixed(2) + ',' + (cy + rr * Math.sin(a)).toFixed(2));
    }
    return pts.join(' ');
  };
  /* 30 x 20 flags */
  const FLAGS = {
    italy: '<rect width="10" height="20" fill="#009246"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#CE2B37"/>',
    russia: '<rect width="30" height="6.67" fill="#fff"/><rect y="6.67" width="30" height="6.67" fill="#0039A6"/><rect y="13.33" width="30" height="6.67" fill="#D52B1E"/>',
    japan: '<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#BC002D"/>',
    finland: '<rect width="30" height="20" fill="#fff"/><rect x="8" width="5" height="20" fill="#003580"/><rect y="7.5" width="30" height="5" fill="#003580"/>',
    malta: '<rect width="15" height="20" fill="#fff"/><rect x="15" width="15" height="20" fill="#CF142B"/><rect x="2" y="2" width="4" height="4" fill="#B8B8B8" stroke="#CF142B" stroke-width=".5"/>',
    china: `<rect width="30" height="20" fill="#DE2910"/><polygon points="${star(5, 5, 3)}" fill="#FFDE00"/>` +
      [[10, 2], [12, 4], [12, 7], [10, 9]].map(([x, y]) => `<polygon points="${star(x, y, 1, 5, .382, -90 + Math.atan2(5 - y, 5 - x) * 180 / Math.PI)}" fill="#FFDE00"/>`).join(''),
    korea: '<rect width="30" height="20" fill="#fff"/><g transform="translate(15 10) rotate(33.7)"><path d="M-5 0a5 5 0 0 1 10 0z" fill="#C60C30"/><path d="M-5 0a5 5 0 0 0 10 0z" fill="#003478"/><circle cx="-2.5" r="2.5" fill="#C60C30"/><circle cx="2.5" r="2.5" fill="#003478"/></g>' +
      [[-1, -1], [1, 1], [1, -1], [-1, 1]].map(([sx, sy]) => `<g transform="translate(${15 + sx * 9.5} ${10 + sy * 6}) rotate(${sx * sy > 0 ? 56.3 : -56.3})"><rect x="-2" y="-1.6" width="4" height=".7" fill="#000"/><rect x="-2" y="-.35" width="4" height=".7" fill="#000"/><rect x="-2" y=".9" width="4" height=".7" fill="#000"/></g>`).join(''),
    uk: '<clipPath id="fUk1"><path d="M0 0h30v20H0z"/></clipPath><clipPath id="fUk2"><path d="M15 10h15v10zv10H0zH0V0zV0h15z"/></clipPath><g clip-path="url(#fUk1)"><path d="M0 0h30v20H0z" fill="#012169"/><path d="M0 0l30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0l30 20M30 0L0 20" clip-path="url(#fUk2)" stroke="#C8102E" stroke-width="2.4"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6.5"/><path d="M15 0v20M0 10h30" stroke="#C8102E" stroke-width="4"/></g>',
    malaysia: Array.from({ length: 14 }, (_, i) => `<rect y="${(i * 20 / 14).toFixed(3)}" width="30" height="${(20 / 14 + .02).toFixed(3)}" fill="${i % 2 ? '#fff' : '#CC0001'}"/>`).join('') +
      `<rect width="15" height="11.43" fill="#010066"/><circle cx="5.6" cy="5.7" r="3.8" fill="#FC0"/><circle cx="6.6" cy="5.7" r="3.2" fill="#010066"/><polygon points="${star(10.6, 5.7, 2.8, 14, .45)}" fill="#FC0"/>`
  };
  const flagSVG = id => `<svg class="dpanel__flagsvg" viewBox="0 0 30 20" aria-hidden="true" focusable="false">${FLAGS[id] || '<rect width="30" height="20" fill="#9DB8F5"/>'}</svg>`;

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
    return `<li class="dpanel" style="--bg:${bg};--accent:${accent}" data-i="${i}">
      <span class="dpanel__scene" aria-hidden="true" style="--sky-a:${Landmarks.sky(d.id)[0]};--sky-b:${Landmarks.sky(d.id)[1]}">${d.photo ? `<img src="${d.photo}" alt="" loading="lazy">` : Landmarks.sceneSVG(d.id)}</span>
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
        <div class="dpanel__levels">${d.levels.map(l => `<span>${esc(l)}</span>`).join('')}</div>
        <dl class="dpanel__stats">
          <div><dt>Open intakes</dt><dd class="tnum">${open}</dd></div>
          <div><dt>Scholarship offers</dt><dd class="tnum">${offers}</dd></div>
        </dl>
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
