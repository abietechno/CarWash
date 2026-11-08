# WashWuzz — Backend (Laravel)

Laravel 13 API + Sanctum. Database default SQLite (`database/database.sqlite`).

## Jalankan

```sh
composer install
cp .env.example .env          # kalau belum ada
php artisan key:generate
php artisan migrate
php artisan serve             # http://127.0.0.1:8000
```

Cek: `GET /api/health`.

## Ganti ke MySQL / PostgreSQL

Ubah di `.env`:

```env
DB_CONNECTION=mysql   # atau pgsql
DB_HOST=127.0.0.1
DB_PORT=3306          # pgsql: 5432
DB_DATABASE=carwash
DB_USERNAME=root
DB_PASSWORD=
```

Lalu `php artisan migrate`.

## Catatan

- Route API di `routes/api.php` (prefix `/api`).
- CORS: `CORS_ALLOWED_ORIGINS` di `.env` (lihat `config/cors.php`).
- Sanctum sudah terpasang (`User` memakai `HasApiTokens`) untuk auth token nanti.
