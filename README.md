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
| 7 | Program detail pages, program finder, live application board, eligibility check, cost estimator | Package 3 | ✅ Done |
| 8 | Full Bangla, lead list, checklist downloads, final QA, handover | Package 3 | ✅ Done |

## Pages

| File | Page |
|---|---|
| `index.html` | Homepage, in the DOCX §4.1 order: hero, destinations, programs, why choose us, services, process, scholarship highlight, intakes board, team, news, stories, contact summary |
| `destinations.html` | All destinations |
| `destination.html#korea` | Country guide (one template; `#korea`, `#japan`, `#uk`, `#malta`, `#italy`, `#russia`, `#finland`, `#malaysia`, `#china`) |
| `universities.html` | Universities and application intakes (Package 2) |
| `program.html#gachon-mba` | Program detail (one template; ids in `PROGRAMS`) — Package 3 |
| `eligibility.html` | Eligibility check (Package 3) |
| `cost-estimator.html` | Cost estimator in taka (Package 3) |
| `programs.html` | Program finder (Package 3) and program types |
| `scholarships.html` | University offers and government scholarships |
| `services.html` | Services and process |
| `about.html` | About, leadership, offices |
| `contact.html` | Contact form, offices and an office map (Google Maps embed) |
| `news.html` | News posts (Package 2) |
| `admin.html` | Staff dashboard preview with Leads (Packages 2 + 3, demo only) |
| `checklist.html#korea` | Printable document checklist per destination, save as PDF (Package 3) |
| `404.html` | Page not found |
| `policies.html` | Privacy, terms, disclaimer |
| `styleguide.html` | Design system (internal) |

## How the code is organised

- Each page contains only its own `<main>`. The header, menu, footer and WhatsApp button are added by `js/layout.js`, so they are written once.
- **All text and data** (contact details, destinations, services, team, scholarships, policies) lives in `js/data.js`.
- `js/icons.js` adds the icon set to every page (master copy: `partials/icons.html`).
- Script order on every page: `icons → data → utils → store → forms → layout → home → pages → listings → stories → premium → i18n → main`.
- **Content store (`js/store.js`):** pages read lists through `Store.list('universities')` etc. The admin preview saves edits, hidden items, order and new items in the visitor's browser, and the pages apply them. On the live site this is the database behind the admin panel.
- **Admin preview (`admin.html`, `js/admin.js`):** choose a role (Administrator, Content editor, Counsellor) to see role-based access; edit, hide/show, reorder, and add intakes, testimonials and news. "Reset demo data" restores the original content.
- **Testimonials:** `TESTIMONIALS` is empty on purpose. The homepage section appears only when a story with the student's consent is published.
- **Package 3 (`js/premium.js`, `css/premium.css`):** `PROGRAMS` holds fees, scholarships and linked intakes; `RATES` and `LIVING_COSTS` drive every taka figure. Program pages show fees with taka, scholarship tiers, timeline and a live countdown; the homepage board lists live intakes; `eligibility.html` scores programs against five answers; `cost-estimator.html` adds tuition, scholarship, one-time fees and living costs.
- Package 2 features (filters, enquiry dialog, intakes) live in `js/listings.js` and `css/listings.css`. Intake status is calculated from the dates in `INTAKES` (Dhaka time); closed windows are hidden automatically.
- **Bangla (`js/i18n.js`):** the EN / বাংলা switch swaps every text, placeholder and label found in the `BN` dictionary, including content drawn later by scripts, and shows numbers in Bangla digits. The choice is remembered. To translate new text, add `'English': 'বাংলা'` to `BN`. Elements with `data-no-i18n` are left alone.
- **Leads (`Leads` in `js/store.js`):** the contact form and every enquiry dialog save a lead (name, phone, qualification, interest, source) before opening WhatsApp. Administrators and counsellors see them under **Leads** in `admin.html`: change status (New → Contacted → Applied → Converted / Not interested), reply on WhatsApp, delete, export to CSV (opens in Excel with Bangla intact). Demo leads live in the visitor's browser; on the live site they go to the database.
- **Homepage sections (DOCX §4.1):** destinations bento grid (`renderHomeDestinations`, colours in `DEST_TONES`; add a photo per country later), program tiles, why choose us (`WHY_CHOOSE` in `data.js`, every point taken from the PDF), scholarship highlight (featured offer = soonest open window), contact summary form (saves a lead, then WhatsApp or email).
- **Revision history (Package 3):** every admin change (edit, add, delete, hide/show, reorder, reset) is logged by `Store` with who, when and what, plus a copy of the content before the change. Administrators and content editors see **History** in `admin.html` and can restore any earlier version.
- **Cache-busting:** every CSS and JS link ends in `?v=<hash>` (a hash of all CSS/JS). After any change, regenerate the pages (or bump the number) so browsers load the new files instead of an old cached copy.
- **Spam protection:** every form gets a hidden honeypot field and a 1.5-second minimum fill time (`forms.js`). The live backend must repeat both checks on the server.
- **Contact by email:** the contact page and homepage forms offer "Send by email" (pre-filled `mailto:`) next to WhatsApp. On the live site the backend emails EduRise directly.
- **Checklist downloads:** each country guide links to `checklist.html#id`, a clean A4 page built from `BASE_DOCUMENTS` plus the country's `extraDocs` (`documentsFor()` merges them). "Print or save as PDF" uses the browser's print dialog, so no PDF files need to be kept up to date.
- Styles: `tokens.css` (design tokens), `base.css`, `components.css` (shared pieces), `layout.css` (header/footer), `home.css`, `pages.css`, `listings.css`, `stories.css`, `premium.css`, `admin.css`, `checklist.css` (print).

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

## Quality checks (Phase 8)

- **Accessibility:** axe-core (WCAG 2.1 A/AA + best practice) on all 17 pages in light mode, dark mode and Bangla: 0 violations. Keyboard skip link, focus styles, labelled forms, AA contrast in both themes.
- **Responsive:** tested at 1366, 820 and 375 px wide; no sideways scroll on any page (Bangla included).
- **Browsers:** tested in Chromium. Check Safari (iPhone) and Firefox before launch.
- **Performance:** no frameworks; all CSS ≈ 100 KB and JS ≈ 240 KB before compression; images under 60 KB each; pages load in under 0.5 s locally. Fonts load with `display=swap`.
- **SEO:** unique title and description per page, canonical link, Open Graph / Twitter card (`assets/img/brand/og-image.png`, 1200×630), `sitemap.xml`, `robots.txt` (admin, style guide and checklist excluded), `404.html`.

## Handover: going live

1. **Domain:** `www.eduriseglobal.com` (confirmed in the EduRise PDF profile). `sitemap.xml`, `robots.txt` and the canonical / Open Graph tags use `https://www.eduriseglobal.com`.
2. **Hosting:** any static host works (cPanel, Nginx, Cloudflare Pages, Netlify). Upload the folder as is; set `404.html` as the error page (Nginx: `error_page 404 /404.html;`, Apache: `ErrorDocument 404 /404.html`). Enable HTTPS and gzip/brotli.
3. **Backend for the live site (Packages 2–3):** the admin preview, leads and content edits are saved in the browser for this demo. For launch they need a small backend (for example WordPress with custom post types, or a PHP/Laravel API) plus staff logins. The data shapes in `js/data.js` and `js/store.js` are the spec for that database.
4. **Leads to WhatsApp / email:** today the form opens WhatsApp with the message pre-filled. To also receive an email or a Google Sheet row, post the lead to the backend or a form service when it is saved (`Leads.add`).
5. **Analytics:** add Google Analytics 4 or Meta Pixel only after the privacy policy is final, and add a cookie notice if required.

## Open items (TBC: EduRise to confirm)

**Brand and media**
- Original logo file (SVG or AI) and high-resolution leadership photos
- Campus and student photos (free stock from Unsplash / Pexels can be added, or EduRise's own photos with consent). The homepage destination cards use colours until a photo per country is supplied

**Contact and company**
- A domain email such as info@eduriseglobal.com (currently `info.eduriseglobal@gmail.com`)
- Office hours, Instagram and LinkedIn links
- Full addresses for the Madrid and Suffolk offices; company registration details if they should be shown

**Content and figures**
- University offers, intakes, tuition, scholarships and deadlines: sample data taken from EduRise Facebook posts; every figure must be checked
- Exchange rates (`RATES`) and living costs (`LIVING_COSTS`) used for all taka figures
- Country requirements and document lists
- Destination list: the PDF names the UK, Japan, South Korea, Malta, Italy and other European countries; Russia, Finland, Malaysia and China come from Facebook posts and need confirming (DOCX §11)
- News posts (sample) and the final privacy policy, terms and disclaimer wording
- Student stories: none published; add only with each student's written consent

**Bangla**
- Menus, headings, forms, buttons, statuses and tools are translated. Long-form content (country guides, program details, policies) stays in English until staff add Bangla versions; a native-speaker review of the Bangla is recommended.
