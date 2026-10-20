/* =====================================================================
   landmarks.js — hand-drawn landmark scenes (inline SVG, 240 x 180) with
   a sky colour per country, plus national flags. Used by the homepage
   panels (destpanels.js) and the destination cards (pages.js).
   A destination with a `photo` in data.js shows the photo instead.
   ===================================================================== */
const Landmarks = (() => {
  /* ---- small drawing helpers (viewBox 0 0 240 180) ---- */
  const sun = (cx, cy, r, c, o = 1) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" opacity="${o}"/>`;
  const rect = (x, y, w, h, c, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${c}"/>`;
  const path = (d, c, extra = '') => `<path d="${d}" fill="${c}" ${extra}/>`;
  const skyline = (c, base, list) => list.map(([x, w, h]) => rect(x, base - h, w, h, c)).join('');
  const clouds = (c, o) => `<g fill="${c}" opacity="${o}"><ellipse cx="46" cy="40" rx="22" ry="7"/><ellipse cx="60" cy="35" rx="14" ry="8"/><ellipse cx="196" cy="70" rx="18" ry="5"/></g>`;
  const onion = (cx, by, w, h, c) =>
    path(`M${cx - w / 2} ${by} C${cx - w / 2} ${by - h * .42} ${cx - w * .95} ${by - h * .55} ${cx} ${by - h} C${cx + w * .95} ${by - h * .55} ${cx + w / 2} ${by - h * .42} ${cx + w / 2} ${by}Z`, c) +
    rect(cx - .8, by - h - 9, 1.6, 9, '#E8B63C') + rect(cx - 3, by - h - 6, 6, 1.4, '#E8B63C');

  const SCENES = {
    korea: () => sun(182, 50, 20, '#FFE3B3', .95) + clouds('#fff', .35) +
      skyline('#B9A6D6', 150, [[0, 14, 22], [16, 10, 34], [28, 16, 26], [178, 12, 30], [192, 18, 22], [212, 12, 36], [226, 14, 26]]) +
      path('M0 150 C50 118 90 106 120 108 C160 110 200 126 240 146 V180 H0Z', '#3A3F75') +
      `<g fill="#20255A">${path('M109 112 L114 82 H126 L131 112Z', '#20255A')}${rect(116, 40, 8, 44, '#20255A')}${rect(103, 57, 34, 9, '#20255A', 4)}${rect(106, 48, 28, 10, '#20255A', 4)}${rect(111, 42, 18, 7, '#20255A', 2)}${rect(119, 8, 2, 36, '#20255A')}${rect(117, 22, 6, 3, '#20255A')}</g>` +
      rect(106, 60, 28, 2, '#FFD27A') + rect(109, 52, 22, 1.6, '#FFD27A') +
      `<g fill="#171B44">${[8, 30, 52, 190, 212, 234].map(x => `<circle cx="${x}" cy="164" r="16"/>`).join('')}</g>` + rect(0, 168, 240, 12, '#171B44'),
    japan: () => sun(176, 54, 20, '#E8473C') +
      path('M8 152 L90 72 Q100 64 110 66 Q120 63 130 72 L232 152Z', '#7C8DB5') +
      path('M90 72 Q100 64 110 66 Q120 63 130 72 L141 83 L129 80 L121 89 L112 80 L102 89 L94 80 L79 83Z', '#FFFFFF') +
      rect(0, 150, 240, 30, '#3C4C7A') + rect(0, 150, 240, 3, '#5D6FA0') +
      `<g>${path('M10 95 Q56 86 102 95 L102 101 Q56 93 10 101Z', '#C8322F')}${path('M8 93 Q56 83 104 93 L104 96 Q56 87 8 96Z', '#2A2F3F')}${rect(22, 110, 68, 5, '#C8322F')}${rect(31, 99, 8, 70, '#C8322F')}${rect(73, 99, 8, 70, '#C8322F')}${rect(52, 99, 8, 11, '#C8322F')}</g>`,
    uk: () => clouds('#fff', .55) +
      `<g fill="none" stroke="#8FA0C4" stroke-width="1.6"><circle cx="58" cy="104" r="40"/><circle cx="58" cy="104" r="4"/>${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 8; return `<line x1="${58 + 40 * Math.cos(a)}" y1="${104 + 40 * Math.sin(a)}" x2="${58 - 40 * Math.cos(a)}" y2="${104 - 40 * Math.sin(a)}"/>`; }).join('')}</g>` +
      path('M50 152 L58 104 L66 152Z', '#8FA0C4') +
      `<g fill="#2B3352">${path('M86 154 V122 H96 V116 H102 V122 H112 V116 H118 V122 H140 V154Z', '#2B3352')}${rect(140, 62, 26, 94, '#2B3352')}${rect(137, 50, 32, 28, '#2B3352')}${rect(141, 36, 24, 14, '#2B3352')}${path('M139 37 L153 6 L167 37Z', '#2B3352')}${path('M136 50 L139 42 L142 50Z', '#2B3352')}${path('M164 50 L167 42 L170 50Z', '#2B3352')}</g>` +
      `<circle cx="153" cy="64" r="9" fill="#F4E3B0"/><path d="M153 64 V58 M153 64 L157 66" stroke="#2B3352" stroke-width="1.4" stroke-linecap="round"/>` +
      rect(0, 154, 240, 26, '#55698F') + rect(0, 154, 240, 2, '#7D90B5'),
    italy: () => sun(64, 52, 24, '#FFD08A') +
      `<g fill="#2F4A3A">${[[16, 112, 7, 40], [30, 118, 6, 34], [222, 110, 7, 42]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`).join('')}</g>` +
      path('M36 158 V96 Q120 74 206 96 L206 106 L194 101 L188 114 L206 118 V158Z', '#8A4A2E') +
      Array.from({ length: 3 }, (_, r) => Array.from({ length: 8 }, (_, i) => (r === 0 && i > 6) ? '' : rect(46 + i * 19, 104 + r * 17, 10, 12, '#F6B98A', 5)).join('')).join('') +
      rect(36, 98, 158, 3, '#A35C3A') + rect(0, 158, 240, 22, '#C98A55'),
    malta: () => sun(186, 46, 18, '#FFF1B8') + clouds('#fff', .5) +
      `<g fill="#B98E55">${rect(66, 94, 34, 32, '#B98E55')}${path('M62 96 Q83 52 104 96Z', '#7C8F9E')}${rect(80, 58, 6, 10, '#B98E55')}${rect(82.2, 48, 1.6, 10, '#B98E55')}${rect(79, 51, 8, 1.6, '#B98E55')}${rect(136, 78, 20, 48, '#A9824F')}${path('M136 79 L146 36 L156 79Z', '#A9824F')}</g>` +
      path('M0 150 V126 H40 V118 H96 V126 H128 V120 H170 V128 H240 V150Z', '#D4B07A') + rect(0, 132, 240, 2, '#BF9A62') +
      path('M0 150 Q30 145 60 150 T120 150 T180 150 T240 150 V180 H0Z', '#2A7BA0') +
      path('M0 162 Q30 158 60 162 T120 162 T180 162 T240 162 V180 H0Z', '#21688A') +
      path('M40 156 Q52 162 64 156 L60 152 H44Z', '#E2B33C') + path('M150 158 Q162 164 174 158 L170 154 H154Z', '#C0392B'),
    russia: () => clouds('#fff', .45) +
      rect(52, 118, 136, 40, '#9B3A32') + rect(52, 118, 136, 4, '#7E2D26') +
      `${rect(112, 74, 16, 46, '#B8453A')}${path('M110 76 L120 30 L130 76Z', '#3E6B4F')}${onion(120, 32, 10, 12, '#E2B33C')}` +
      `${rect(71, 100, 14, 20, '#B8453A')}${onion(78, 102, 22, 30, '#2E7D5B')}${rect(93, 92, 14, 28, '#B8453A')}${onion(100, 94, 20, 28, '#E2B33C')}` +
      `${rect(133, 92, 14, 28, '#B8453A')}${onion(140, 94, 20, 28, '#C0392B')}${rect(155, 100, 14, 20, '#B8453A')}${onion(162, 102, 22, 30, '#2F6DB0')}` +
      Array.from({ length: 6 }, (_, i) => rect(60 + i * 22, 130, 8, 14, '#F2C6B8', 4)).join('') +
      rect(0, 156, 240, 24, '#E9EEF8') + rect(0, 156, 240, 3, '#FFFFFF'),
    finland: () => sun(48, 50, 16, '#FFFFFF', .9) +
      path('M40 160 H200 V152 H48Z', '#B8C4D8') + path('M48 152 H192 V146 H56Z', '#CED7E6') +
      rect(60, 104, 120, 42, '#FFFFFF') + rect(60, 104, 120, 3, '#DCE3EE') +
      Array.from({ length: 6 }, (_, i) => rect(92 + i * 11, 108, 4, 38, '#DCE3EE')).join('') +
      path('M86 105 L120 86 L154 105Z', '#FFFFFF', 'stroke="#DCE3EE" stroke-width="1.5"') +
      rect(104, 70, 32, 18, '#FFFFFF') + Array.from({ length: 4 }, (_, i) => rect(108 + i * 7, 74, 3, 12, '#DCE3EE')).join('') +
      path('M100 72 Q120 32 140 72Z', '#3E8E6E') + rect(117, 40, 6, 9, '#3E8E6E') + rect(119.2, 30, 1.6, 11, '#E8B63C') + rect(116.5, 33, 7, 1.6, '#E8B63C') +
      path('M62 106 Q72 86 82 106Z', '#3E8E6E') + path('M158 106 Q168 86 178 106Z', '#3E8E6E') +
      rect(0, 160, 240, 20, '#8FA3C2'),
    malaysia: () => sun(60, 62, 22, '#FFC07A', .95) +
      skyline('#9C6C9E', 152, [[0, 16, 30], [18, 12, 44], [200, 14, 40], [216, 10, 28], [228, 12, 46]]) +
      [96, 144].map(cx => `<g fill="#2D3163">${rect(cx - 13, 110, 26, 48, '#2D3163')}${rect(cx - 11, 80, 22, 32, '#2D3163')}${rect(cx - 9, 60, 18, 22, '#2D3163')}${rect(cx - 7, 46, 14, 16, '#2D3163')}${rect(cx - 5, 36, 10, 12, '#2D3163')}${rect(cx - 1, 6, 2, 32, '#2D3163')}${rect(cx - 3, 64, 2, 92, '#4B5196')}${rect(cx + 2, 64, 2, 92, '#4B5196')}</g>`).join('') +
      rect(96, 88, 48, 3, '#2D3163') + path('M104 91 L120 104 L136 91', 'none', 'stroke="#2D3163" stroke-width="2"') +
      `<g fill="#1E2A3D">${rect(206, 112, 4, 48, '#1E2A3D')}${path('M208 112 Q188 104 180 118 Q194 108 208 114Z', '#1E2A3D')}${path('M208 112 Q228 102 238 116 Q222 108 208 114Z', '#1E2A3D')}${path('M208 112 Q200 94 188 92 Q204 100 208 113Z', '#1E2A3D')}</g>` +
      rect(0, 158, 240, 22, '#3B2E55'),
    china: () => sun(186, 48, 18, '#FFE2A0') + clouds('#fff', .4) +
      rect(40, 148, 160, 12, '#EEF0F4') + rect(54, 138, 132, 10, '#E2E6EE') + rect(68, 130, 104, 8, '#EEF0F4') +
      rect(96, 108, 48, 22, '#B8322B') + Array.from({ length: 5 }, (_, i) => rect(100 + i * 9, 110, 2, 20, '#E8B63C')).join('') +
      path('M78 110 L92 98 H148 L162 110Z', '#1F4E8C') + rect(102, 86, 36, 12, '#B8322B') +
      path('M86 88 L98 76 H142 L154 88Z', '#1F4E8C') + rect(108, 66, 24, 10, '#B8322B') +
      path('M94 68 L106 56 H134 L146 68Z', '#1F4E8C') + path('M106 57 Q120 38 134 57Z', '#1F4E8C') +
      `<circle cx="120" cy="38" r="3.4" fill="#E8B63C"/>` + rect(118.8, 40, 2.4, 6, '#E8B63C') +
      rect(0, 160, 240, 20, '#7FA68E'),
/* Petra tou Romiou (Aphrodite's Rock) off the south coast */
    cyprus: () => '<circle cx="64" cy="52" r="18" fill="#FFF3C9"/><g fill="#fff" opacity=".5"><ellipse cx="176" cy="40" rx="20" ry="6"/><ellipse cx="190" cy="35" rx="12" ry="7"/></g>' +
    '<path d="M0 118 C30 104 52 100 78 112 L84 132 0 132Z" fill="#D7B98C"/><path d="M0 124 C24 114 44 112 66 122 L70 132 0 132Z" fill="#C49A68"/>' +
    '<rect y="128" width="240" height="52" fill="#2F86B4"/><rect y="128" width="240" height="6" fill="#62B3D6"/>' +
    '<path d="M118 132 C120 108 132 94 146 92 C160 92 168 108 170 132Z" fill="#C9A47A"/><path d="M146 92 C160 92 168 108 170 132 L152 132 C152 112 150 100 146 92Z" fill="#A9845B"/>' +
    '<path d="M172 132 C174 120 182 114 190 116 C198 118 200 126 202 132Z" fill="#B8915F"/><path d="M98 132 C100 124 106 120 112 122 C116 124 117 128 118 132Z" fill="#B8915F"/>' +
    '<g fill="#fff" opacity=".55"><rect x="20" y="146" width="40" height="2" rx="1"/><rect x="132" y="156" width="56" height="2" rx="1"/><rect x="84" y="166" width="30" height="2" rx="1"/></g>',
  /* Stockholm City Hall tower with the three crowns, across the water */
    sweden: () => '<circle cx="58" cy="48" r="16" fill="#fff" opacity=".9"/><g fill="#fff" opacity=".55"><ellipse cx="170" cy="42" rx="22" ry="6"/><ellipse cx="184" cy="37" rx="13" ry="7"/></g>' +
    '<rect x="96" y="96" width="120" height="40" fill="#B4553C"/><rect x="96" y="92" width="120" height="6" fill="#8E3F2C"/>' +
    '<g fill="#7A3524">' + [104, 116, 128, 152, 164, 176, 188, 200].map(x => `<rect x="${x}" y="104" width="6" height="12" rx="3"/>`).join('') + '</g>' +
    '<rect x="132" y="62" width="18" height="74" fill="#A84D36"/><rect x="129" y="58" width="24" height="7" fill="#8E3F2C"/>' +
    '<path d="M131 58 L141 42 L151 58Z" fill="#4E8C78"/><rect x="140" y="34" width="2" height="10" fill="#E8B63C"/>' +
    '<g fill="#E8B63C"><circle cx="137" cy="34" r="2.4"/><circle cx="141" cy="32" r="2.4"/><circle cx="145" cy="34" r="2.4"/></g>' +
    '<g fill="#7A3524"><rect x="138" y="72" width="6" height="10" rx="3"/></g>' +
    '<path d="M0 124 L24 112 L52 120 L70 110 L96 124 L96 136 0 136Z" fill="#5E7F6A"/>' +
    '<rect y="134" width="240" height="46" fill="#3F6F9E"/><rect y="134" width="240" height="4" fill="#6D97C2"/>' +
    '<g fill="#B4553C" opacity=".35"><rect x="96" y="140" width="120" height="14"/><rect x="132" y="140" width="18" height="34"/></g>',
    usa: () => sun(186, 50, 18, '#FFF1C4') + clouds('#fff', .5) +
      skyline('#8FA6C8', 150, [[0, 12, 34], [14, 10, 52], [26, 14, 40], [196, 12, 46], [210, 16, 30], [228, 12, 56]]) +
      `<g fill="#3E8C7A">${rect(104, 128, 32, 26, '#5D6F86')}${rect(98, 122, 44, 8, '#6E819A')}${path('M110 122 L112 76 Q120 70 128 76 L130 122Z', '#3E8C7A')}${path('M112 84 Q120 78 128 84 L127 96 Q120 92 113 96Z', '#357A6A')}<circle cx="120" cy="68" r="7"/>${path('M113 64 L111 56 M116 62 L115 53 M120 61 L120 51 M124 62 L125 53 M127 64 L129 56', 'none', 'stroke="#3E8C7A" stroke-width="2.2" stroke-linecap="round"')}${rect(129, 40, 4, 36, '#3E8C7A', 2)}${path('M127 41 Q131 30 135 41Z', '#F2B23C')}${rect(106, 92, 8, 14, '#357A6A', 2)}</g>` +
      path('M0 150 Q30 146 60 150 T120 150 T180 150 T240 150 V180 H0Z', '#3F6F9E') + rect(0, 164, 240, 16, '#335C86')
  };

  /* sky gradient per country: top, bottom */
  const SKY = {
    korea: ['#F7C6D9', '#9E8FD3'], japan: ['#FFE7CC', '#F6C9A8'], uk: ['#C9D6EA', '#9FB2D3'], italy: ['#FFD7A6', '#F2A774'],
    malta: ['#BFE6F2', '#7CC4DD'], russia: ['#D7D3F0', '#AFC0E6'], finland: ['#DDF0FB', '#A9D3EE'], malaysia: ['#F8B98B', '#B06AA0'],
    china: ['#CDEBE0', '#F4D79A'], cyprus: ['#FFE6C2', '#8FCDE4'], sweden: ['#DCE8F6', '#A6C1E3'], usa: ['#D9E7F7', '#A9C3E6']
  };

  const sceneSVG = id => `<svg class="dpanel__art" viewBox="0 0 240 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${SCENES[id] ? SCENES[id]() : ''}</svg>`;
  /* national flags, 30 x 20 (public domain designs) */
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
      `<rect width="15" height="11.43" fill="#010066"/><circle cx="5.6" cy="5.7" r="3.8" fill="#FC0"/><circle cx="6.6" cy="5.7" r="3.2" fill="#010066"/><polygon points="${star(10.6, 5.7, 2.8, 14, .45)}" fill="#FC0"/>`,
    sweden: '<rect width="30" height="20" fill="#006AA7"/><rect x="9.4" width="3.8" height="20" fill="#FECC02"/><rect y="8.1" width="30" height="3.8" fill="#FECC02"/>',
    cyprus: '<rect width="30" height="20" fill="#fff"/><path d="M6.5 8.6 9.6 6.6 13 6.9 16.4 5.7 19.6 4.9 23.6 2.9 21.6 5.7 19.2 7.5 15.6 8.9 12.2 9.9 8.6 9.9Z" fill="#D57800"/><g fill="none" stroke="#4E5B31" stroke-width=".9" stroke-linecap="round"><path d="M10.4 15.6c1.6 1.4 3.4 1.6 4.4 1.5"/><path d="M19.6 15.6c-1.6 1.4-3.4 1.6-4.4 1.5"/></g><g fill="#4E5B31"><ellipse cx="11.4" cy="14.9" rx="1" ry=".45" transform="rotate(-35 11.4 14.9)"/><ellipse cx="12.9" cy="16.1" rx="1" ry=".45" transform="rotate(-20 12.9 16.1)"/><ellipse cx="18.6" cy="14.9" rx="1" ry=".45" transform="rotate(35 18.6 14.9)"/><ellipse cx="17.1" cy="16.1" rx="1" ry=".45" transform="rotate(20 17.1 16.1)"/></g>',
    usa: Array.from({ length: 13 }, (_, i) => `<rect y="${(i * 20 / 13).toFixed(3)}" width="30" height="${(20 / 13 + .02).toFixed(3)}" fill="${i % 2 ? '#fff' : '#B22234'}"/>`).join('') +
      '<rect width="12" height="10.77" fill="#3C3B6E"/>' + Array.from({ length: 20 }, (_, i) => `<circle cx="${(1.3 + (i % 5) * 2.35).toFixed(2)}" cy="${(1.3 + Math.floor(i / 5) * 2.7).toFixed(2)}" r=".55" fill="#fff"/>`).join('')
  };
  const flagSVG = (id, cls = '') => `<svg class="${cls}" viewBox="0 0 30 20" aria-hidden="true" focusable="false">${FLAGS[id] || '<rect width="30" height="20" fill="#9DB8F5"/>'}</svg>`;

  const sky = id => SKY[id] || ['#DDE6F5', '#AFC0E6'];
  return { sceneSVG, sky, flagSVG, has: id => !!SCENES[id] };
})();
