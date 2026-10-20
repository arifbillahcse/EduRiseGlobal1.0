# EduRise Global — PHP backend (branch `PHP`)

Raw PHP backend, built in phases. `main` keeps the static site until the backend is ready.
Plan document: https://claude.ai/code/artifact/d8bfb890-a05d-4d20-88bd-900cc19b54d3

| Phase | Scope | Status |
| --- | --- | --- |
| 0 | Hosting checklist, folder structure, database design | Done |
| 1 | Front controller, router, DB layer, pages served from PHP with content from the database | Done |
| 2 | Admin login, Admin/Editor roles, sessions, CSRF, password reset, users | Done |
| 3 | Content editing in English and Bangla, image uploads, settings | Done |
| 4 | SEO: page titles and descriptions per country and program, sitemap from the database | Next |
| 5 | Forms and leads in the database, email, spam protection | |
| 6 | Launch checks: live server, backups, clean-up | |

## How Phase 1 works

- Every request that is not a real file goes to `public_html/index.php` (see `.htaccess`).
- `app/routes.php` maps addresses to `PageController`. Page addresses are the same as the static site (`about.html`, `destination.html#korea` ...), plus:
  - `/about` → 301 to `/about.html` (one address per page)
  - `/study-in-<country>` → that country's guide, e.g. `/study-in-cyprus`
  - anything else → the 404 page with a real 404 status
- Pages are the original templates in `app/Views/pages/`, so the design is unchanged. `App\Core\View` adds:
  - the database content as `window.EDURISE_DB`, which `js/data.js` uses instead of its built-in lists
  - absolute `css/`, `js/`, `assets/` links, with `?v=` set from each file's content (a changed file is never served stale)
  - canonical and og links on this site's own `base_url`
- If the database is down, pages still work with the content built into `js/data.js`; the error is logged.
- Errors never show on screen with `debug = false`; they go to `storage/logs/php-error.log`.

Tested (PHP 8.3, MariaDB 10.11, Apache 2.4 with this `.htaccess`):

- All 17 content lists from the database are identical to `js/data.js`.
- 18 pages screenshot-identical to the static site; the only change is the photo-credit list, which now follows the client's country order.
- A `<script>` in a database field shows as text, with no popup.
- Database down: the site uses its built-in content. An exception shows a plain 500 page with no details.
- `/app/...`: 404. Hidden files: 403. `.php` in `uploads/`: 403. HTTP: 301 to HTTPS. Security headers on pages and files.

## How Phase 2 works (admin panel at `/admin`)

- **Sign-in** at `/admin/login`. Passwords are stored only as Argon2id hashes. There is no web setup page; the first Admin is created in the Terminal with `php bin/create-admin.php`.
- **Roles:** Admin can do everything. Editor can open the content sections, but not Users, Settings, Offices or Policies (403).
- **Lockout:** 5 wrong passwords for one email, or 20 from one IP, lock sign-in for 15 minutes, even with the right password. The per-IP limit is higher because staff share one office connection.
- **Session:**
  - The cookie is HttpOnly, SameSite=Strict, Secure on HTTPS, and limited to `/admin`, so public pages set no cookie.
  - A new session ID is issued at sign-in. The server ignores IDs it did not create.
  - Sign-out after 30 minutes idle, or 12 hours in total.
  - Sign-out deletes the session on the server.
- **Instant effect:** turning an account off, changing a role, or changing a password takes effect on the next click. A password change signs out every other device.
- **Forgot password:** gives the same answer whether or not the email exists. The link works once and expires in 1 hour.
- **New users** get an email link to set their own password, valid 48 hours. The link is also shown once to the Admin, in case email is not set up yet.
- **Safety rules:**
  - You cannot remove your own Admin role, or turn off the last Admin.
  - Accounts are turned off, never deleted.
- **Every form** carries a CSRF token. Admin pages are sent with `no-store`, `X-Frame-Options: DENY`, `noindex` and a strict Content-Security-Policy (no inline scripts).
- **Email:** `mail.transport = log` writes emails to `storage/logs/mail.log` (local). `mail` sends through cPanel. Every email is also saved in `mail_queue`.

Tested end to end: 35 checks covering every Phase 2 item on the security checklist, plus CSRF, open redirect, privilege escalation by an Editor, XSS in names, and session fixation.

## How Phase 3 works (content editing)

- **One editor for every section:** Destinations, Programs, Universities, Intakes, Scholarships, Government scholarships, Leadership, News, Testimonials, Offices and Policies.
  - Each section is described once in `app/Models/Sections.php` (fields, Bangla, who may do what). `ContentController` builds the list, form, checks and saving from it.
  - Adding a field = one line there plus a database column.
- **English and Bangla side by side:**
  - Each row's Bangla is stored in its `bn` column.
  - The server adds those pairs to the `i18n.js` dictionary, so visitors who choose বাংলা see staff-written Bangla.
  - Bangla that already existed in `i18n.js` was copied in by the import.
  - In list boxes, Bangla lines follow the English order; `-` marks a line not translated yet.
- **Show on website:** hidden items leave the website at once but stay in the admin. Anything that belongs to a hidden country is hidden with it.
- **Changes are live at once:** pages read the database on every request (`Cache-Control: no-cache`).
- **Who can do what:**

  | Section | Editor | Admin |
  | --- | --- | --- |
  | Destinations | edit, hide | add, delete |
  | Programs, universities, intakes, scholarships | add, edit, hide | delete |
  | Leadership | edit | add, hide, delete |
  | News | write drafts | publish, hide, delete |
  | Testimonials | add (stays hidden) | confirm consent, mark checked, show, delete |
  | Offices, policies, settings, users | — | everything |

- **Deleting:** only with a POST form, after a confirmation page. A country that still has programs, universities, intakes or scholarships cannot be deleted; hide it instead.
- **Uploads** (Media, or the image field of a country or leader):
  - Only JPG, PNG and WebP, up to 5 MB, with one file extension.
  - The content must really be an image. Each image is decoded and saved again with GD, which removes hidden code.
  - Saved with a random name in `uploads/YYYY/MM/`. Images larger than 2000 px are scaled down.
  - PHP never runs in `uploads/` (403 under Apache).
- **Checks before saving:**
  - required fields, lengths, dates (an intake cannot close before it opens), links (https only), unique address names;
  - photo focus (`50% 40%`);
  - the program JSON fields (English, tuition, scholarships) must have the exact shape the program pages and cost estimator expect, and currencies must exist in Settings.
- **Settings (Admin):**
  - phone, WhatsApp, email, address and hours (with Bangla), social links;
  - the promo bar messages (with Bangla);
  - exchange rates, with "last updated" set automatically.
- **Escaping:** while testing I found that the homepage program finder, photo attributes, photo-credit links and tuition values were written into the page without escaping. They are escaped now, and the server also refuses such values.

Tested: 38 end-to-end checks covering every Phase 3 item on the security checklist, plus:
- upload attacks: `.php`, `shell.php.jpg`, PHP disguised as a JPG, PHP hidden inside a real JPEG, GIF, SVG;
- role limits for Editors;
- XSS in names, Bangla, promo bar and address (site and admin, English and বাংলা);
- hiding a country, an intake, a university or a leader without breaking any page.

Saving all 65 existing items through the forms without changes leaves the website data byte-for-byte identical.

## Folder structure

```
public_html/        web root: index.php, .htaccess, css/, js/, assets/, uploads/
app/
  bootstrap.php     config, autoload, error handling
  routes.php        all website addresses
  config/           config.php lives here on each server, never in Git
  core/             Config, Database (PDO), Router, View, Response, ErrorHandler, Session, Csrf, Auth, Mailer, Upload
  Controllers/      PageController; Admin/ (Auth, Panel, User, Content, Media, Settings)
  Models/           Sections (editable sections), Content (saving), ContentRepository (website data in data.js shape), AdminUser
  Views/pages/      the page templates (the old *.html files)
  Views/admin/      admin panel templates
  Helpers/          e(), json_for_script(), url()
storage/            logs/, sessions/, cache/, backups/ — runtime only, not in Git
bin/                env-check, create-admin, export-data (Node), import-data, dev-router
database/           schema.sql, migrations/, seed/content.json
partials/           icon sprite master copy (not served)
```

## Changing content

Use the admin panel at `/admin`. The built-in lists in `public_html/js/data.js` are only a fallback for when the database cannot be reached. `bin/import-data.php --replace` resets the database to them, and asks before deleting staff changes.

## Run it on your PC

```
cp app/config/config.example.php app/config/config.php   # set db and base_url = http://localhost:8000
mysql -u root -e "CREATE DATABASE edurise_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
mysql -u root edurise_local < database/schema.sql
php bin/import-data.php
php bin/create-admin.php            # your own Admin account
php -S localhost:8000 -t public_html bin/dev-router.php
# admin: http://localhost:8000/admin  ·  emails go to storage/logs/mail.log
```

## Staging on cPanel

1. **Subdomains:** create `staging.eduriseglobal.bd` with document root **`staging/public_html`** (not `public_html/staging`). Then protect it with *Directory Privacy* so only you and EduRise can see it.
2. **MySQL Databases:** create `edurise_staging` and one user with ALL PRIVILEGES on that database only.
3. **phpMyAdmin:** set the collation to `utf8mb4_unicode_ci`, then use *Import* to load `database/schema.sql`.
4. **Git Version Control:** clone this repo, branch `PHP`, into `~/repositories/edurise`. Then click *Manage → Pull or Deploy → Deploy HEAD Commit*. `.cpanel.yml` copies it to `~/staging`.
5. **Terminal:**
   ```
   cd ~/staging
   cp app/config/config.example.php app/config/config.php
   nano app/config/config.php      # env = staging, debug = false, base_url = https://staging.eduriseglobal.bd, db, app_key
   php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"   # paste as app_key
   php bin/env-check.php
   php bin/import-data.php
   php bin/create-admin.php        # first Admin: your name, email and a strong password
   ```
   In `config.php` set `mail.transport` to `mail` so reset and invite links are emailed from `noreply@eduriseglobal.bd`.
6. Open https://staging.eduriseglobal.bd and click through every page, then sign in at `/admin` and add the EduRise staff under **Users**.

**Database already set up from an earlier phase?** In phpMyAdmin (SQL tab), run each migration in `database/migrations/` that has not been run yet, oldest first:
- `2026-10-19-phase2-admin.sql` (before `create-admin.php`)
- `2026-10-20-phase3-content.sql`

Then run `php bin/import-data.php --replace` once, to copy the existing Bangla into the new columns. Only do this before staff start editing, because it replaces the content.

Also set PHP's `upload_max_filesize` to 8M and `post_max_size` to 12M in *MultiPHP INI Editor*, so the 5 MB image limit is the one staff meet.

Later deploys: push to `PHP`, then *Pull* and *Deploy HEAD Commit* in cPanel. `config.php`, logs and uploads on the server are never overwritten.
