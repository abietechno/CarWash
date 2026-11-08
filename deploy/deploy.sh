#!/usr/bin/env bash
# WashWuzz — deploy / update di server, sebagai user deploy (tanpa sudo):
#   bash /www/wwwroot/carwash/CarWash/deploy/deploy.sh
#
# Tarik kode terbaru dari main, update backend (composer, migrasi, cache config/route),
# lalu build dash-admin dan situs tenant. Hasil build ditukar setelah selesai,
# jadi situs tidak kosong selama build berjalan.
set -euo pipefail

APP=$(cd "$(dirname "$0")/.." && pwd)
COMPOSER=${COMPOSER:-$HOME/bin/composer.phar}

cd "$APP"
git pull --ff-only

echo "== Backend"
cd "$APP/backend"
php "$COMPOSER" install --no-dev --optimize-autoloader --no-interaction --no-progress
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:clear

build() {
    echo "== Build $1"
    cd "$1"
    npm ci --no-audit --no-fund
    npm run type-check --if-present
    rm -rf dist-next
    # Vite dipanggil langsung: argumen lewat `npm run build -- ...` tidak sampai utuh ke vite (run-p di dash-admin).
    npx vite build --outDir dist-next --emptyOutDir
    rm -rf dist-prev
    if [ -d dist ]; then mv dist dist-prev; fi
    mv dist-next dist
    rm -rf dist-prev
}

build "$APP/dash-admin"
build "$APP"

echo "Deploy selesai: $(git -C "$APP" log --oneline -1)"
