# EduRise Global website (built in phases)

Plain HTML, CSS and JavaScript. No build tools or frameworks.

## Status

| Phase | Scope | Package | Status |
|---|---|---|---|
| 1 | Design foundation and style guide | All | ✅ Done |
| 2 | Header, navigation, footer, WhatsApp button | All | ✅ Done |
| 3 | Homepage: hero, services, process, leadership, commitment | Package 1 | ✅ Done |
| 4 | Destinations, country guides, programs, scholarships, services, about, contact, policies | Package 1 | ✅ Done |
| 5 | Universities and intakes, filters, WhatsApp enquiry dialog, filterable scholarships | Package 2 | ✅ Done |
| 6 | Testimonials (consent-gated), news, staff dashboard preview | Package 2 | ✅ Done |
| 7 | Program detail pages, application board, eligibility quiz, cost estimator | Package 3 | Waiting |
| 8 | Full Bangla, lead list, downloads, final QA, handover | Package 3 | Waiting |

## Pages

| File | Page |
|---|---|
| `index.html` | Homepage |
| `destinations.html` | All destinations |
| `destination.html#korea` | Country guide (one template; `#korea`, `#japan`, `#uk`, `#malta`, `#italy`, `#russia`, `#finland`, `#malaysia`, `#china`) |
| `universities.html` | Universities and application intakes (Package 2) |
| `programs.html` | Program types |
| `scholarships.html` | University offers and government scholarships |
| `services.html` | Services and process |
| `about.html` | About, leadership, offices |
| `contact.html` | Contact form and offices |
| `news.html` | News posts (Package 2) |
| `admin.html` | Staff dashboard preview (Package 2, demo only) |
| `policies.html` | Privacy, terms, disclaimer |
| `styleguide.html` | Design system (internal) |

## How the code is organised

- Each page contains only its own `<main>`. The header, menu, footer and WhatsApp button are added by `js/layout.js`, so they are written once.
- **All text and data** (contact details, destinations, services, team, scholarships, policies) lives in `js/data.js`.
- `js/icons.js` adds the icon set to every page (master copy: `partials/icons.html`).
- Script order on every page: `icons → data → utils → forms → layout → home → pages → listings → main`.
- **Content store (`js/store.js`):** pages read lists through `Store.list('universities')` etc. The admin preview saves edits, hidden items, order and new items in the visitor's browser, and the pages apply them. On the live site this is the database behind the admin panel.
- **Admin preview (`admin.html`, `js/admin.js`):** choose a role (Administrator, Content editor, Counsellor) to see role-based access; edit, hide/show, reorder, and add intakes, testimonials and news. "Reset demo data" restores the original content.
- **Testimonials:** `TESTIMONIALS` is empty on purpose. The homepage section appears only when a story with the student's consent is published.
- Package 2 features (filters, enquiry dialog, intakes) live in `js/listings.js` and `css/listings.css`. Intake status is calculated from the dates in `INTAKES` (Dhaka time); closed windows are hidden automatically.
- Styles: `tokens.css` (design tokens), `base.css`, `components.css` (shared pieces), `layout.css` (header/footer), `home.css`, `pages.css`, `listings.css`.

## Phase 1 files

```
edurise-site/
├── styleguide.html        the design system page: open this to review
├── css/
│   ├── tokens.css         ALL colours, fonts, spacing, radius, shadows (light + dark)
│   ├── base.css           reset, typography, layout helpers
│   ├── components.css     buttons, chips, TBC badge, package labels, cards, person card, forms, image frames, toast
│   └── styleguide.css     style guide page only (not used by the public site)
├── js/
│   └── styleguide.js      theme preview, swatches with contrast check, form demo, icon list
├── partials/
│   ├── icons.html         master copy of the icon set (pasted into each page)
│   └── styleguide-body.html
└── assets/img/
    ├── brand/logo-mark.png
    └── team/ceo.jpg, faysal.jpg, raihan.jpg
```

## How to change the design

- **Colours, fonts, spacing:** edit `css/tokens.css`. Light values are at the top and dark values below them.
- **Button, card or form style:** edit `css/components.css`. Every page uses these classes.
- **Icons:** add a `<symbol id="i-name">` to `partials/icons.html`, then use `<svg class="icon"><use href="#i-name"></use></svg>`.

## Component classes (quick reference)

| Component | Classes |
|---|---|
| Button | `btn` + `btn--go` / `btn--brand` / `btn--sun` / `btn--ghost` / `btn--ghost-light`, sizes `btn--sm` / `btn--lg`, `btn--block` |
| Status chip | `chip` + `chip--open` / `chip--urgent` / `chip--soon` / `chip--tba` / `chip--closed` |
| Unconfirmed info | `<span class="tbc">TBC</span>` |
| Package label | `pkg pkg--1` / `pkg--2` / `pkg--3` (demo only) |
| Card | `card`, `card--link`, `card--night`, `card__icon` |
| Person | `person`, `person__photo`, `person__body`, `person__name`, `person__role` |
| Form field | `field` > `field__label` + `field__control` + `field__hint` / `field__error`; add `field--error` when invalid |
| Image frame | `media` + `media--wide` / `media--photo` / `media--square` / `media--tall`; `media--placeholder` until a photo is added |

## Open items (TBC)

- Original logo file (SVG or AI)
- High-resolution leadership photos
- Photos from Unsplash or Pexels: needs the computer connected through the Claude desktop app, or photos attached
