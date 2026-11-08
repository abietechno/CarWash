#!/usr/bin/env bash
# WashWuzz — setup server, SEKALI saja (butuh root):
#   sudo bash /www/wwwroot/carwash/CarWash/deploy/server-setup.sh
#
# - user deploy (abie) masuk grup www, supaya deploy berikutnya tidak perlu sudo;
# - backend/storage bisa ditulis PHP-FPM (user www) dan user deploy;
# - backend/.env hanya bisa dibaca abie + www;
# - pasang config nginx untuk carwash, dash-admin, dan *.cloudbizz.my.id, lalu reload.
# Aman dijalankan ulang (mis. setelah deploy/nginx-carwash.conf berubah).
set -euo pipefail

APP=/www/wwwroot/carwash/CarWash
DEPLOY_USER=${DEPLOY_USER:-abie}
NGINX=/www/server/nginx/sbin/nginx
VHOST=/www/server/panel/vhost/nginx/carwash-cloud.conf

if [ "$(id -u)" -ne 0 ]; then
    echo "Jalankan dengan sudo." >&2
    exit 1
fi
if [ ! -f "$APP/backend/.env" ]; then
    echo "backend/.env belum ada — buat dulu dari backend/.env.production.example." >&2
    exit 1
fi

usermod -aG www "$DEPLOY_USER"

chown -R www:www "$APP/backend/storage"
find "$APP/backend/storage" -type d -exec chmod 2775 {} +
find "$APP/backend/storage" -type f -exec chmod 664 {} +

chown "$DEPLOY_USER:www" "$APP/backend/.env"
chmod 640 "$APP/backend/.env"

install -m 644 -o root -g root "$APP/deploy/nginx-carwash.conf" "$VHOST"
"$NGINX" -t
"$NGINX" -s reload

echo "Selesai. Login ulang SSH sebagai $DEPLOY_USER supaya grup www aktif."
