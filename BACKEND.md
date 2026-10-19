# EduRise Global — PHP backend (branch `PHP`)

Raw PHP backend, built in phases. `main` keeps the current static site until the backend is ready.
Plan document: https://claude.ai/code/artifact/d8bfb890-a05d-4d20-88bd-900cc19b54d3

## Phase 0 — status: done (repo side)

| Item | Where |
| --- | --- |
| Folder structure | `app/`, `storage/`, `bin/`, `database/` (see below) |
| Database design, 18 tables | `database/schema.sql` |
| Config template | `app/config/config.example.php` |
| Server check script | `bin/env-check.php` |
| Secrets kept out of Git | `.gitignore`, `storage/.gitignore` |

Tested on PHP 8.3 + MariaDB 10.11: schema imports cleanly (18 tables), Bangla text stores correctly (utf8mb4).

## Folder structure

```
public_html/        web root (Phase 1: index.php, .htaccess, assets/, uploads/)
app/
  config/           config.php lives here on each server, never in Git
  core/             Router, DB, Auth, CSRF, Session          (Phase 1)
  Controllers/      one per page; Admin/ for the panel       (Phase 1+)
  Models/           queries per table                        (Phase 1+)
  Views/            HTML templates, EN and BN                (Phase 1+)
  Helpers/          escape, upload, mail, slug               (Phase 1+)
storage/            logs/, cache/, backups/ — runtime only, not in Git
bin/                CLI scripts (env check now; cron jobs later)
database/           schema.sql (later: migrations, import from js/data.js)
```

`app/`, `storage/` and `bin/` sit one level above `public_html/` on cPanel, so the browser can never open them.

## Server setup on cPanel (staging first, then live)

1. **MySQL Databases:** create `edurise_staging` (and later `edurise_live`), one user each, and give that user ALL PRIVILEGES on its own database only.
2. **phpMyAdmin:** open the database, set the collation to `utf8mb4_unicode_ci`, then use *Import* to load `database/schema.sql`.
3. **Git Version Control:** clone this repo, branch `PHP`, into a folder outside `public_html` (for example `~/repositories/edurise`).
4. **Terminal:**
   ```
   cd ~/repositories/edurise
   cp app/config/config.example.php app/config/config.php
   nano app/config/config.php        # fill in db, mail, app_key; env = staging
   php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"   # paste as app_key
   php bin/env-check.php
   ```
5. Fix every `FAIL` line. `WARN` lines are worth fixing too: raise `upload_max_filesize` to 8M in *MultiPHP INI Editor*.

## Next: Phase 1

Front controller (`public_html/index.php`), router, DB layer and layout views; serve the current pages from PHP with the same design; one-off import of `js/data.js` into the database; `.cpanel.yml` deploy once the staging path is known.
