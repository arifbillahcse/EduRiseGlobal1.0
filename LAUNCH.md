# EduRise Global — going live

Step-by-step guide for moving the PHP site from staging to **https://www.eduriseglobal.bd**.
Allow about an hour, at a quiet time (late evening Dhaka time). The live site is down for about 5 minutes, between steps 6 and 7.

**Layout on the server (same cPanel account as staging)**

```
~/public_html/      web root of eduriseglobal.bd (the repo's public_html/)
~/edurise/          app/, bin/, database/, storage/ (outside the web root)
~/staging/          the staging copy (staging.eduriseglobal.bd), unchanged
```

`bin/deploy.sh` (run by cPanel when you deploy) puts branch `main` into the first two folders and branch `PHP` into `~/staging`.

## A. Before launch day

- [ ] Staging has been checked page by page, in English and বাংলা, on a phone and a computer.
- [ ] EduRise has confirmed the content marked TBC: the Cyprus, Sweden and USA programs, office addresses, the stats, and policies.
- [ ] EduRise has given you the inbox for leads (for example info@eduriseglobal.bd) and the list of staff who get admin accounts.
- [ ] On staging, `php bin/env-check.php` shows no FAIL.
- [ ] A test lead sent on staging reached the lead inbox, not the spam folder.
- [ ] A backup was restored on staging once (`php bin/restore.php …`), and the site worked afterwards.

## B. Launch

1. **Full backup of the current site:** cPanel → Backup Wizard → Full Backup, then download it. This is the way back (section D).
2. **Live database:**
   - cPanel → MySQL Databases: create `edurise_live` and a new user (a new, strong password).
   - Give that user ALL PRIVILEGES on `edurise_live` only.
3. **Merge the branch** on GitHub: open a pull request from `PHP` into `main`, and merge it.
4. **Clone for live:** cPanel → Git Version Control → Create.
   - Repository: this GitHub repo, branch `main`.
   - Path: `~/repositories/edurise-live`.
   - Do not deploy yet.
5. **Live config:** cPanel → Terminal:
   ```
   mkdir -p ~/edurise/app/config
   cp ~/repositories/edurise-live/app/config/config.example.php ~/edurise/app/config/config.php
   nano ~/edurise/app/config/config.php
   ```
   Set:
   - `env` = `'live'`, `debug` = `false`, `base_url` = `'https://www.eduriseglobal.bd'`
   - `'public_dir' => '/home/<cpanel user>/public_html'` (remove the `//` in front)
   - `db`: `edurise_live`, its user and password
   - `mail`: the same SMTP settings as staging, and `lead_to` = the EduRise inbox
   - `security.app_key`: a **new** key (`php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"`), not the staging one
   - `access`: leave the user empty, so the live site has no password
   - `turnstile`: the same keys as staging, if you use them
6. **Copy the content from staging, then deploy:**
   ```
   cd ~/staging && php bin/backup.php          # note the two file names it prints
   ```
   Then in cPanel → Git Version Control → `edurise-live` → Manage → Pull or Deploy → **Deploy HEAD Commit**. The old static site in `~/public_html` is replaced now, and the site stays down until step 7. The Let's Encrypt folder, Google verification files and `uploads/` are kept.
7. **Put the content in** (Terminal):
   ```
   mkdir -p ~/edurise/storage/backups
   cp ~/staging/storage/backups/edurise-<date>-db.sql.gz ~/staging/storage/backups/edurise-<date>-uploads.zip ~/edurise/storage/backups/
   cd ~/edurise
   php bin/restore.php storage/backups/edurise-<date>-db.sql.gz --uploads=storage/backups/edurise-<date>-uploads.zip
   ```
   Type `edurise_live` when it asks.
8. **Check the server:** `php ~/edurise/bin/env-check.php`. Fix every FAIL. On live, test accounts, a database user with wider rights and an http address are FAILs. Delete test accounts in Admin → Users (turn them off), or add the real staff first.
9. **Cron jobs:** cPanel → Cron Jobs:
   - every 5 minutes: `php $HOME/edurise/bin/send-mail.php >/dev/null 2>&1`
   - daily at 02:30: `php $HOME/edurise/bin/backup.php && php $HOME/edurise/bin/maintenance.php >/dev/null 2>&1`

   Keep the staging cron jobs, pointing at `~/staging/bin/...`.
10. **PHP settings:** MultiPHP Manager: PHP 8.3 for eduriseglobal.bd. MultiPHP INI Editor: `upload_max_filesize` 8M, `post_max_size` 12M, `display_errors` Off.
11. **Click through the live site:**
    - [ ] `http://eduriseglobal.bd` and `https://eduriseglobal.bd` both land on `https://www.eduriseglobal.bd/`.
    - [ ] Every menu page, three country pages (`/study-in-korea` …), two program pages, and বাংলা.
    - [ ] Send the contact form with your own number, check the email arrives, then delete the lead in Admin → Leads.
    - [ ] Sign in at `/admin`, change one small text, see it on the site, then change it back.
    - [ ] `https://www.eduriseglobal.bd/robots.txt` lists the sitemap; `/sitemap.xml` shows only `https://www.eduriseglobal.bd/…` addresses.
12. **Staff:** Admin → Users → add each person (Editor, or Admin for the owners). They get an email to set their own password.

## C. In the first week

- **Google Search Console:**
  - Add the domain `eduriseglobal.bd` (DNS TXT check).
  - Submit `https://www.eduriseglobal.bd/sitemap.xml`.
  - Use *URL inspection* on the homepage and `/study-in-korea`.
- **Old domain:** if EduRise owns `eduriseglobal.com`, point it at this hosting (cPanel → Domains) and redirect it to `https://www.eduriseglobal.bd` (Domains → Redirects, 301).
- **Uptime alerts:** a free UptimeRobot monitor on `https://www.eduriseglobal.bd/` (every 5 minutes, email or Telegram alert).
- **Off-server backups:** once a week, download the newest pair from `~/edurise/storage/backups`, or turn on JetBackup if the host offers it. A backup on the same server does not survive losing the server.
- **Check the cron jobs:** after a day, `php ~/edurise/bin/env-check.php` should show send-mail, backup and maintenance as run.
- **Email:** send one email to mail-tester.com from the contact form. Aim for 9/10 or more; if lower, fix SPF, DKIM or DMARC as it suggests.

## D. If something goes wrong

- **The new site has a problem you cannot fix quickly:** cPanel → Backup → *Restore a Home Directory backup* with the download from step 1. It brings back the old static site; nothing on staging is affected.
- **Content broken by an edit:** `php ~/edurise/bin/restore.php storage/backups/<newest good>-db.sql.gz`. It saves the current state first, so a restore can be undone.
- **A bad deploy:** in cPanel Git, check out the previous commit on `main` (or revert it on GitHub), then *Deploy HEAD Commit* again.
- **Errors:** `~/edurise/storage/logs/php-error.log`. Visitors never see error details on live.

## E. Every month

- Restore the newest live backup on staging (`cd ~/staging && php bin/restore.php …`) and check that staging works. This proves the backups are good.
- Run `php ~/edurise/bin/env-check.php`.
- In GitHub, check the `main` branch is what is live.
