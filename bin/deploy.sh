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

case "$BRANCH" in
  PHP)
    T="$HOME/staging"
    mkdir -p "$T"
    rsync -a --delete "${KEEP[@]}" --exclude='public_html/uploads/*' ./ "$T/"
    echo "Deployed $BRANCH to $T"
    ;;
  main)
    A="$HOME/edurise"; W="$HOME/public_html"
    mkdir -p "$A" "$W"
    # everything except the web root goes to ~/edurise
    rsync -a --delete "${KEEP[@]}" --exclude='/public_html/' ./ "$A/"
    # the web root: --delete only inside public_html, keeping uploads and host files
    rsync -a --delete "${WEB_KEEP[@]}" public_html/ "$W/"
    mkdir -p "$W/uploads"
    echo "Deployed $BRANCH to $W (web) and $A (app)"
    ;;
  *)
    echo "Branch '$BRANCH' is not deployed (only PHP -> staging and main -> live)." >&2
    exit 1
    ;;
esac
