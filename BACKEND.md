# EduRise Global — PHP backend (branch `PHP`)

Raw PHP backend, built in phases. `main` keeps the static site until the backend is ready.
Plan document: https://claude.ai/code/artifact/d8bfb890-a05d-4d20-88bd-900cc19b54d3

| Phase | Scope | Status |
| --- | --- | --- |
| 0 | Hosting checklist, folder structure, database design | Done |
| 1 | Front controller, router, DB layer, pages served from PHP with content from the database | Done |
| 2 | Admin login, roles, sessions, CSRF | Next |

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

## Folder structure

```
public_html/        web root: index.php, .htaccess, css/, js/, assets/, uploads/
app/
  bootstrap.php     config, autoload, error handling
  routes.php        all website addresses
  config/           config.php lives here on each server, never in Git
  core/             Config, Database (PDO), Router, View, Response, ErrorHandler
  Controllers/      PageController (Admin/ from Phase 2)
  Models/           ContentRepository (reads content in data.js shape)
  Views/pages/      the page templates (the old *.html files)
  Helpers/          e(), json_for_script(), url()
storage/            logs/, cache/, backups/ — runtime only, not in Git
bin/                env-check, export-data (Node), import-data, dev-router
database/           schema.sql, seed/content.json
partials/           icon sprite master copy (not served)
```

## Changing content before the admin panel exists (Phase 1 only)

Edit `public_html/js/data.js`, then on your PC run `node bin/export-data.js` and commit. On the server run `php bin/import-data.php --replace`. From Phase 2 the admin panel replaces this.

## Run it on your PC

```
cp app/config/config.example.php app/config/config.php   # set db and base_url = http://localhost:8000
mysql -u root -e "CREATE DATABASE edurise_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
mysql -u root edurise_local < database/schema.sql
php bin/import-data.php
php -S localhost:8000 -t public_html bin/dev-router.php
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
   ```
6. Open https://staging.eduriseglobal.bd and click through every page.

Later deploys: push to `PHP`, then *Pull* and *Deploy HEAD Commit* in cPanel. `config.php`, logs and uploads on the server are never overwritten.
