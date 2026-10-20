#!/bin/bash
# EduRise Global — copy this repository to where the site runs. Called by
# .cpanel.yml when you press "Deploy HEAD Commit" in cPanel → Git Version Control.
#
#   branch PHP  -> staging:  ~/staging/            (staging.eduriseglobal.bd, document root staging/public_html)
#   branch main -> live:     ~/public_html/        (web root of eduriseglobal.bd)
#                            ~/edurise/            (app, bin, database, storage: outside the web root)
#
# Never copied over or deleted on the server: app/config/config.php, storage/ contents,
# public_html/uploads/, and on live the files cPanel and Google put in the web root.
set -euo pipefail
cd "$(dirname "$0")/.."

BRANCH="${DEPLOY_BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"
KEEP=(--exclude='.git' --exclude='.cpanel.yml' --exclude='app/config/config.php'
      --exclude='storage/logs/*' --exclude='storage/sessions/*' --exclude='storage/cache/*' --exclude='storage/backups/*')
WEB_KEEP=(--exclude='uploads/*' --exclude='.well-known/' --exclude='cgi-bin/' --exclude='google*.html' --exclude='BingSiteAuth.xml')

# Hosts without rsync (CageFS on some cPanel servers): copy with cp instead, keeping the same files.
HAVE_RSYNC=$(command -v rsync >/dev/null 2>&1 && echo 1 || echo 0)

# app copy without rsync: replace the code folders, keep config.php and storage contents
copy_app() {   # $1 = target folder, $2 = "with-web" to copy public_html too (staging)
  local T="$1" CFG=""
  mkdir -p "$T"
  [ -f "$T/app/config/config.php" ] && CFG=$(mktemp) && cp -p "$T/app/config/config.php" "$CFG"
  for d in app bin database partials; do rm -rf "${T:?}/$d"; [ -e "$d" ] && cp -a "$d" "$T/"; done
  find . -maxdepth 1 -type f ! -name '.cpanel.yml' -exec cp -p {} "$T/" \;
  mkdir -p "$T/storage"; cp -an storage/. "$T/storage/"          # -n: never overwrite logs, sessions, backups
  if [ "${2:-}" = with-web ]; then copy_web public_html "$T/public_html"; fi
  if [ -n "$CFG" ]; then mkdir -p "$T/app/config"; cp -p "$CFG" "$T/app/config/config.php"; rm -f "$CFG"; fi
}
# web root copy without rsync: remove old site files, keep uploads and host files, copy the new ones
copy_web() {   # $1 = source, $2 = web root
  local S="$1" W="$2"
  mkdir -p "$W"
  find "$W" -mindepth 1 -maxdepth 1 ! -name uploads ! -name .well-known ! -name cgi-bin ! -name 'google*.html' ! -name BingSiteAuth.xml -exec rm -rf {} +
  for f in "$S"/* "$S"/.[!.]*; do
    [ -e "$f" ] || continue
    if [ "$(basename "$f")" = uploads ]; then mkdir -p "$W/uploads"; cp -an "$f/." "$W/uploads/"; else cp -a "$f" "$W/"; fi
  done
}

case "$BRANCH" in
  PHP)
    T="$HOME/staging"
    mkdir -p "$T"
    if [ "$HAVE_RSYNC" = 1 ]; then
      rsync -a --delete "${KEEP[@]}" --exclude='public_html/uploads/*' ./ "$T/"
    else
      copy_app "$T" with-web
    fi
    echo "Deployed $BRANCH to $T"
    ;;
  main)
    A="$HOME/edurise"; W="$HOME/public_html"
    mkdir -p "$A" "$W"
    if [ "$HAVE_RSYNC" = 1 ]; then
      # everything except the web root goes to ~/edurise
      rsync -a --delete "${KEEP[@]}" --exclude='/public_html/' ./ "$A/"
      # the web root: --delete only inside public_html, keeping uploads and host files
      rsync -a --delete "${WEB_KEEP[@]}" public_html/ "$W/"
    else
      copy_app "$A"
      copy_web public_html "$W"
    fi
    mkdir -p "$W/uploads"
    echo "Deployed $BRANCH to $W (web) and $A (app)"
    ;;
  *)
    echo "Branch '$BRANCH' is not deployed (only PHP -> staging and main -> live)." >&2
    exit 1
    ;;
esac
