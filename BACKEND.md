# EduRise Global — PHP backend (branch `PHP`)

Raw PHP backend, built in phases. `main` keeps the static site until the backend is ready.
Plan document: https://claude.ai/code/artifact/d8bfb890-a05d-4d20-88bd-900cc19b54d3

| Phase | Scope | Status |
| --- | --- | --- |
| 0 | Hosting checklist, folder structure, database design | Done |
| 1 | Front controller, router, DB layer, pages served from PHP with content from the database | Done |
| 2 | Admin login, Admin/Editor roles, sessions, CSRF, password reset, users | Done |
| 3 | Content editing in English and Bangla, image uploads, settings | Done |
| 4 | SEO: own address, title and description per country and program; sitemap and robots from the database | Done |
| 5 | Forms and leads in the database, email with retries, spam protection, Leads in the admin | Done |
| 6 | Launch readiness: live layout and deploy, backups and restore, maintenance, staging password, launch checks | Done |

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

## How Phase 4 works (SEO)

- **Own address per country and program:**
  - `/study-in-korea` and `/program-gachon-mba`. Before, every country shared one page (`destination.html#korea`), and search engines ignore the `#` part.
  - The site's own links use the new addresses.
  - Old `#` links (bookmarks, shared links, Facebook posts) forward in the browser. The old pages carry `noindex`.
- **Each of those pages gets its own head from the server, before any script runs:**
  - `<title>`, meta description (at most 160 characters, cut at a word), canonical address;
  - share tags (`og:title`, `og:description`, `og:url`, `og:image` = the country's photo);
  - structured data: a breadcrumb, plus `Course` with the university for programs.
- **Search title and description in the admin:** Destinations and Programs have *Search title (Google)* and *Search description (Google)*.
  - Empty means written automatically, e.g. "Study in Japan from Bangladesh | EduRise Global" plus the start of the introduction.
  - HTML tags are removed and quotes escaped.
- **Homepage:** canonical `/` and organisation data (`EducationalOrganization`: name, logo, phone, email, address, Facebook), taken from Settings.
- **`/sitemap.xml`:** generated from the database, with every page, visible country and visible program and its last change date. A hidden country and its programs drop out at once.
- **`/robots.txt`:**
  - Live: everything except `/admin`, the style guide and the checklist, plus the sitemap address.
  - Staging and local: `Disallow: /`, and every page sends `X-Robots-Tag: noindex`, so staging never shows up in Google.
- **One address for the site:** `eduriseglobal.bd/...` → `https://www.eduriseglobal.bd/...` in a single 301 (`.htaccess`). Canonical links use `base_url`, so on live they point at `https://www.eduriseglobal.bd`.
- **Database down:** country and program pages, their titles and the sitemap still work from the built-in content.

Tested:
- 20 checks:
  - every country and program address and its tags;
  - the sitemap: valid XML, every address answers 200, hidden items left out;
  - robots on live and staging;
  - title override kept by the page script;
  - escaping;
  - old addresses forwarding;
  - no old-style links left on the site;
  - database down.
- Apache: the domain redirects.
- Phases 2 and 3 suites rerun: 35/35 and 38/38.

After launch: add the site to Google Search Console and submit `https://www.eduriseglobal.bd/sitemap.xml`. If EduRise also owns `eduriseglobal.com`, point it at the same hosting and add a redirect to the `.bd` address.

## How Phase 5 works (forms, leads, email)

- **The three website forms post to `/enquiry`:** the homepage call-back form, the contact page form, and the enquiry dialog on universities, programs and scholarships.
  - With JavaScript they answer in JSON, and errors appear under the right field.
  - Without JavaScript they still work and show a small result page.
- **The lead is saved first, then emailed.**
  - Every email goes into `mail_queue` before sending. A failed email stays there with its error, and `bin/send-mail.php` (cron, every 5 minutes) retries after 5, 15, 60, 180 and 720 minutes. A wrong SMTP password never loses a lead.
  - Emails are plain text, with Reply-To set to the student's email. Whatever a student types arrives as text, and line breaks cannot add email headers.
  - Leads go to `mail.lead_to`; if that is not set, to the email in Settings.
- **Checks on the server:**
  - name;
  - Bangladeshi mobile number (`01…`, `+880…`, `880…`), stored as `+8801…`;
  - email (optional) and qualification;
  - lengths.
- **Spam protection, in this order:**
  1. Only from this website: another site's form gets 403.
  2. At most 5 forms a minute and 20 an hour per connection.
  3. A hidden honeypot field.
  4. A signed page stamp: forms posted without one, or older than two days, are refused; forms sent within 2 seconds of loading are ignored.
  5. Cloudflare Turnstile, when its keys are set in config. Its token is verified on the server.

  Bots caught by the honeypot or the speed check get a normal "thank you", and nothing is saved.
- **Enquiry dialog:** WhatsApp still opens straight away with the details, and the lead is saved alongside.
- **Admin → Leads:**
  - Filter by status and form; search by name, phone, email or interest.
  - Each lead has WhatsApp (pre-filled greeting), call and email buttons, the email delivery status, and earlier enquiries from the same number.
  - Status: New → Contacted → Applied → Converted / Not interested, plus a counsellor's note. Editors can do this too.
  - Only Admins delete a lead (POST + confirm) or download the CSV.
  - The CSV is UTF-8 with a BOM, so Bangla opens correctly in Excel. Cells that could run as a formula (`=`, `+`, `-`, `@`) are written as plain text.
  - The dashboard shows how many leads are new.
- **`bin/env-check.php`** also checks the email settings and the domain's SPF, DKIM and DMARC records.

Tested:
- 27 checks covering every Phase 5 checklist item that can be tested here:
  - no-JavaScript validation; lead saved with a wrong SMTP password (local test mail server); cron retry delivering it;
  - honeypot; rate limit; Turnstile with a fake verifier; text-only email; CSV formulas and Bangla;
  - the three forms in a real browser; database down;
  - forged and old stamps; another site posting; header injection; HTML in leads shown safely in the admin.
- Phases 2–4 suites rerun: 35/35, 38/38, 20/20.
- **Not testable here:** the mail-tester.com score (needs the real domain's SPF, DKIM and DMARC), and real Turnstile keys.

## How Phase 6 works (launch readiness)

The step-by-step go-live guide is **[LAUNCH.md](LAUNCH.md)**.

- **Live layout:**
  - On the main domain, cPanel's web root is `~/public_html`, so on live the rest lives in `~/edurise` (app, bin, database, storage), outside the web root.
  - `public_html/index.php` finds the app beside the web root (staging, local) or in `~/edurise` (live).
  - Command-line scripts learn the web root from `config.php` → `public_dir`.
- **`bin/deploy.sh`** (run by `.cpanel.yml`) deploys by branch:
  - `PHP` → `~/staging`.
  - `main` → `~/public_html` + `~/edurise`.
  - It never touches `config.php`, logs, sessions, backups, `uploads/`, `.well-known/` (SSL), `cgi-bin/` or Google verification files.
  - Any other branch is refused. It never runs `--delete` over the whole home folder.
- **`bin/backup.php`** (daily cron) writes `storage/backups/edurise-<date>-db.sql.gz` (every table, structure and rows, utf8mb4, written by PHP alone) and `…-uploads.zip`, and keeps the newest 14 of each.
- **`bin/restore.php <db file> [--uploads=<zip>]`:**
  - Checks the file is a complete EduRise backup, and asks for the database name.
  - Saves the current state first, as a separate `before-restore` backup, then restores.
- **`bin/maintenance.php`** (daily cron):
  - Rotates logs over 5 MB (5 old copies, gzipped).
  - Removes session files older than 12 hours.
  - Deletes old sign-in attempts (30 days), used or expired reset links (7 days) and sent emails (90 days).
  - Leads and content are never touched.
- **Staging password** (`config.php` → `access`, made with `bin/hash-password.php`):
  - Checked in PHP for every page, the admin and the form endpoint; static files stay public.
  - Guessing is slowed down after 20 tries.
  - cPanel's Directory Privacy is not used, because a deploy replaces `.htaccess` and would silently open the site.
  - `.htaccess` passes the browser's login to PHP-FPM.
- **`bin/env-check.php`** now also checks:
  - `https` base address and that the web root is found;
  - `storage/` is outside the web root;
  - staging has a password, live has none;
  - no test or demo accounts, and at least one active Admin;
  - the database user can only reach its own database;
  - the three cron jobs actually ran;
  - a backup exists.

  On live, these are FAILs.

Tested:
- 17 checks:
  - backup → damage (deleted leads, dropped table, edited country, deleted image) → restore gives byte-identical data and schema, and every page works;
  - incomplete and foreign backup files refused;
  - no passwords or `config.php` anywhere in the git history;
  - env-check catching test accounts, a database user with rights on everything, and an `http` address on live;
  - the staging password on pages, admin and forms, including the slow-down after 20 guesses;
  - logs, config, scripts and `.git` unreachable from the browser;
  - sitemap, robots and canonical links on the live domain;
  - deploy of both branches into a fake home folder.
- The site in the live layout: uploads land in `~/public_html/uploads`.
- Log rotation and backup pruning.
- The staging password under Apache with PHP-FPM, as on cPanel.
- All earlier suites rerun: Phases 2–5 (35, 38, 20, 27) and the save-everything round trip.

## Folder structure

```
public_html/        web root: index.php, .htaccess, css/, js/, assets/, uploads/
app/
  bootstrap.php     config, autoload, error handling
  routes.php        all website addresses
  config/           config.php lives here on each server, never in Git
  core/             Config, Database (PDO), Router, View, Response, ErrorHandler, Session, Csrf, Auth, Access, Mailer, Smtp, FormToken, Upload, Backup
  Controllers/      PageController, SeoController (sitemap, robots), EnquiryController (forms); Admin/ (Auth, Panel, User, Content, Media, Settings, Lead)
  Models/           Sections (editable sections), Content (saving), ContentRepository (website data in data.js shape), Seo, Lead, AdminUser
  Views/pages/      the page templates (the old *.html files)
  Views/admin/      admin panel templates
  Helpers/          e(), json_for_script(), url()
storage/            logs/, sessions/, cache/, backups/ — runtime only, not in Git
bin/                deploy.sh, env-check, create-admin, hash-password, send-mail / backup / maintenance (cron), restore, export-data (Node), import-data, dev-router
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

1. **Subdomains:** create `staging.eduriseglobal.bd` with document root **`staging/public_html`** (not `public_html/staging`). The password is set in step 5; do not use *Directory Privacy*, because deploys replace `.htaccess`.
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
   php bin/hash-password.php       # staging password: put user + hash in config.php → access
   ```
   Email is set up in step 6 (password-reset and invite links use it too).
6. **Email** (`config.php` → `mail`):
   - Create the mailbox `noreply@eduriseglobal.bd` in cPanel → Email Accounts.
   - Set `transport` = `smtp`, `smtp_host` = `mail.eduriseglobal.bd`, `smtp_port` = `465`, `smtp_secure` = `ssl`, and the mailbox password.
   - Set `lead_to` to the inbox EduRise reads, e.g. info@eduriseglobal.bd.
   - In cPanel → Email Deliverability, make SPF and DKIM valid, and add a DMARC record.
7. **Cron jobs** (cPanel → Cron Jobs):
   - every 5 minutes: `php $HOME/staging/bin/send-mail.php >/dev/null 2>&1`
   - daily at 03:00: `php $HOME/staging/bin/backup.php && php $HOME/staging/bin/maintenance.php >/dev/null 2>&1`
8. **Optional bot check:** create a free Cloudflare Turnstile widget for the domain and put both keys in `config.php` → `turnstile`.
9. Run `php bin/env-check.php` again, and fix any FAIL. A WARN on SPF, DKIM or DMARC means email may land in spam.
10. Open https://staging.eduriseglobal.bd and click through every page, then sign in at `/admin` and add the EduRise staff under **Users**.

**Database already set up from an earlier phase?** In phpMyAdmin (SQL tab), run each migration in `database/migrations/` that has not been run yet, oldest first:
- `2026-10-19-phase2-admin.sql` (before `create-admin.php`)
- `2026-10-20-phase3-content.sql`
- `2026-10-20-phase4-seo.sql`
- `2026-10-20-phase5-leads.sql`
- `2026-10-21-admin-username.sql` (admins sign in with a username; the email still works and is used for password resets)

Then run `php bin/import-data.php --replace` once, to copy the existing Bangla into the new columns. Only do this before staff start editing, because it replaces the content.

Also set PHP's `upload_max_filesize` to 8M and `post_max_size` to 12M in *MultiPHP INI Editor*, so the 5 MB image limit is the one staff meet.

Later deploys: push to `PHP`, then *Pull* and *Deploy HEAD Commit* in cPanel. `config.php`, logs and uploads on the server are never overwritten.

Going live: follow **[LAUNCH.md](LAUNCH.md)**.
