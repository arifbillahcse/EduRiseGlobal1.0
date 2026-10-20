/* =====================================================================
   stories.js — student testimonials and news (Phase 6, Package 2).
   Both lists come from Store, so staff changes in the admin preview show here.
   ===================================================================== */

const initials = name => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

/* ---------- testimonials: only stories with consent are shown ---------- */
function publishedStories() { return Store.list('testimonials').filter(t => t.consent); }

function storyCardHTML(t) {
  return `<figure class="story card">
    <blockquote class="story__quote">${esc(t.quote)}</blockquote>
    <figcaption class="story__who">
      <span class="story__avatar" aria-hidden="true">${esc(initials(t.name))}</span>
      <span><b>${esc(t.name)}</b><span class="story__meta">${esc([t.program, t.university, t.destination].filter(Boolean).join(' · '))}</span></span>
    </figcaption>
  </figure>`;
}
/* the homepage section stays hidden until at least one real story is published */
function renderHomeStories() {
  const section = $('#stories');
  if (!section) return;
  const list = publishedStories();
  section.hidden = list.length === 0;
  $('#storyGrid').innerHTML = list.slice(0, 3).map(storyCardHTML).join('');
}

/* ---------- news ---------- */
function newsSorted() { return Store.list('news').slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')); }

function newsCardHTML(n, expandable) {
  const body = expandable && n.body
    ? `<div class="news__body" id="body-${n.id}" hidden><p>${esc(n.body)}</p></div>
       <button type="button" class="link-arrow news__toggle" aria-expanded="false" aria-controls="body-${n.id}">Read more ${icon('chevron')}</button>`
    : '';
  return `<article class="news card" id="${n.id}">
    <div class="news__meta"><span class="tag">${esc(n.tag || 'Update')}</span>${n.date ? `<time class="tnum" datetime="${n.date}">${formatDate(n.date)}</time>` : ''}</div>
    <h3>${esc(n.title)}</h3>
    <p>${esc(n.summary)}</p>
    ${expandable ? body : `<a class="link-arrow" href="news.html#${n.id}">Read more ${icon('arrow')}</a>`}
  </article>`;
}
function renderHomeNews() {
  const el = $('#homeNews');
  if (!el) return;
  const list = newsSorted().slice(0, 3);
  $('#news').hidden = list.length === 0;
  el.innerHTML = list.map(n => newsCardHTML(n, false)).join('');
}
function renderNewsPage() {
  const tags = ['All', ...new Set(Store.list('news').map(n => n.tag || 'Update'))];
  let current = 'All';
  const draw = () => {
    const list = newsSorted().filter(n => current === 'All' || (n.tag || 'Update') === current);
    $('#newsList').innerHTML = list.length ? list.map(n => newsCardHTML(n, true)).join('') : emptyHTML('posts');
    // open the post named in the link (news.html#n-gachon)
    const target = location.hash && document.getElementById(location.hash.slice(1));
    if (target) { const btn = $('.news__toggle', target); if (btn) toggle(btn, true); target.scrollIntoView({ block: 'start' }); }
  };
  $('#newsTags').innerHTML = tags.map(t => `<button type="button" class="chip-btn" aria-pressed="${t === current}">${esc(t)}</button>`).join('');
  $('#newsTags').addEventListener('click', e => {
    const b = e.target.closest('.chip-btn'); if (!b) return;
    current = b.textContent;
    $$('.chip-btn', $('#newsTags')).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    draw();
  });
  const toggle = (btn, open) => {
    const body = document.getElementById(btn.getAttribute('aria-controls'));
    const show = open ?? body.hidden;
    body.hidden = !show;
    btn.setAttribute('aria-expanded', String(show));
    btn.firstChild.textContent = show ? 'Show less ' : 'Read more ';
  };
  $('#newsList').addEventListener('click', e => { const b = e.target.closest('.news__toggle'); if (b) toggle(b); });
  draw();
}
