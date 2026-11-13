# WashWuzz — SaaS website bisnis cuci mobil

Multi-tenant: setiap bisnis cuci mobil mendaftar, mendapat subdomain sendiri, mengatur profil & harga dari dashboard, lalu mempublikasikan situsnya.

```
washwuzz.cloudbizz.my.id       landing page + form daftar         backend/ (Laravel, Blade)
dash-admin.cloudbizz.my.id    dashboard pemilik bisnis           dash-admin/ (Vue 3 + TS, gaya Threads)
{subdomain}.cloudbizz.my.id   situs publik tenant                root repo (React, app CarWash)
/api di semua domain          satu API Laravel; tenant dikenali dari subdomain host
```

Subdomain tenant tidak dibuat satu per satu di DNS: satu record wildcard `*.cloudbizz.my.id` mengarah ke server, lalu backend mencocokkan subdomain dengan tabel `tenants`.

## Alur

1. Calon tenant membuka landing page, mengisi nama bisnis & memilih subdomain (dicek langsung), lalu daftar.
   Akun owner, tenant berstatus **draft**, dan data awal (3 paket, 3 add-on, 7 jenis kendaraan: 4 mobil + 3 motor) dibuat otomatis.
2. Owner login di dash-admin, melengkapi profil (WhatsApp, alamat, kota, jam buka) dan layanan & harga.
3. Klik **Publikasikan** (ditolak kalau data wajib belum lengkap). Situs `{subdomain}` langsung bisa dibuka publik.
   Owner bisa menyembunyikannya lagi kapan saja.
4. Pelanggan membuka situs tenant:
   - **Beranda:** slider promo, paket cuci/salon dengan foto & harga, ringkasan antrian live.
   - **Reservasi:** nama, HP, jenis kendaraan (+ warna), paket → langsung dapat nomor antrian hari ini (A-001, …). Hanya saat jam buka.
   - **Status:** papan antrian realtime (diperbarui tiap 10 detik) dengan ilustrasi mobil sesuai jenis & warna, progress, estimasi mulai. Mobil milik pengunjung disorot.
5. Di dash-admin **Antrian**, owner menambah pelanggan yang datang langsung dan memindahkan status:
   menunggu → dikerjakan (bay otomatis) → selesai/siap diambil → sudah diambil. Papan publik ikut berubah.

## Paket langganan

| | Gratis | Pro (Rp99rb/bln · Rp990rb/thn, bisa diubah) |
|---|---|---|
| Situs + papan antrian + walk-in | ✓ | ✓ |
| Paket layanan aktif | maks. 3 | tanpa batas |
| Reservasi online | — (tombol "Pesan" → WhatsApp) | ✓ |
| Foto promo slider | 1 | 25 |
| Logo sendiri di header situs | — | ✓ |
| Kasir & laporan uang masuk/keluar | ✓ | ✓ |
| Label "Dibuat dengan WashWuzz" | tampil | tidak |

Pembayaran **manual**: menu **Langganan** berisi tata cara (pilih periode → transfer → kirim bukti via WhatsApp → admin mengaktifkan)
dan tombol WhatsApp melayang ke admin (nomor dari Pengaturan super-admin, bawaan 081233741899). Super-admin lalu mencatat pembayarannya.
Pro aktif sampai `tenants.pro_until`; lewat dari itu otomatis kembali Gratis (tanpa cron). Batas paket, promo, dan logo dicek di backend.
Dashboard tenant menampilkan peringatan 7 hari sebelum Pro habis, dan masih 30 hari setelahnya.

## Kasir & laporan

- **Kasir** (`/kasir`): tagih antrian yang belum bayar (tombol **Bayar** di Antrian) atau jual langsung (paket sesuai jenis kendaraan, add-on, item bebas). Ada diskon, metode bayar, uang diterima & kembalian, lalu struk (cetak thermal / kirim WhatsApp). Harga paket & add-on selalu dihitung server.
- **Laporan** (`/laporan`): uang masuk, keluar, bersih per periode; grafik arus kas; metode bayar, kategori pengeluaran, layanan terlaris; daftar transaksi; unduh CSV. Pengeluaran dicatat dari halaman ini.
- **Pembayaran** (`/pembayaran`): tenant memilih metode bayar yang diterima di Kasir (`tenants.payment_settings`). Pembayaran online saat reservasi masih dalam pengembangan.
- Transaksi tidak pernah dihapus: **dibatalkan dengan alasan**, tetap terlihat, tidak dihitung di laporan, dan antriannya kembali "belum bayar". Antrian yang sudah dibayar tidak bisa dibatalkan sebelum transaksinya dibatalkan.
- Tanggal laporan = `transactions.business_date` menurut `SAAS_TIMEZONE`.

## Super-admin

Login di dash-admin dengan akun berperan `superadmin`; menu berubah menjadi:

- **Ringkasan:** jumlah tenant (online/draft/nonaktif), Pro vs Gratis, langganan habis ≤ 7 hari, pembayaran bulan ini, perkiraan pendapatan/bulan, antrian hari ini.
- **Tenant:** cari (nama, subdomain, email pemilik) & filter status/paket → detail: catat pembayaran (masa aktif otomatis diperpanjang dari akhir masa aktif sekarang), ubah masa aktif manual, nonaktifkan/aktifkan situs, **masuk sebagai tenant** (token 2 jam, ada banner "Mode bantuan"), riwayat pembayaran & log aktivitas.
- **Pengaturan:** harga Pro, instruksi pembayaran, WhatsApp admin untuk konfirmasi.

Semua aksi super-admin tercatat di tabel `activity_logs`.

Buat akun super-admin di server: `php artisan saas:superadmin admin@cloudbizz.my.id` (password ditanya, tidak tersimpan di riwayat shell).

## Jalankan lokal

Butuh PHP 8.3+, Composer, Node 22.18+. Tiga terminal:

```sh
# 1. API + landing page — http://carwash.localhost:8000
cd backend
composer install && cp .env.example .env && php artisan key:generate
php artisan migrate --seed      # sekali saja; seed = tenant demo
php artisan serve

# 2. Dash-admin — http://dash-admin.localhost:5173
cd dash-admin && npm install && cp .env.example .env && npm run dev

# 3. Situs tenant — http://putrajayawash.localhost:3000
npm install && npm run dev
```

`*.localhost` otomatis mengarah ke komputer sendiri di Chrome/Edge/Firefox, jadi subdomain bisa dites tanpa edit file hosts.

Akun demo (dari seeder, password semua `password`):

| Email | Peran | Situs |
|---|---|---|
| `super@carwash.test` | super-admin | — |
| `demo@carwash.test` | tenant Pro **Putra Jaya Wash** | http://putrajayawash.localhost:3000 |
| `sinar@carwash.test` | tenant Gratis **Sinar Wash** | http://sinarwash.localhost:3000 |

Test backend: `cd backend && php artisan test` (alur daftar, publish, isolasi data antar-tenant, rate limit, antrian, paket langganan, super-admin).

## Konfigurasi penting (`backend/.env`)

| Variabel | Lokal | Production |
|---|---|---|
| `SAAS_BASE_DOMAIN` | `localhost` | `cloudbizz.my.id` |
| `SAAS_TENANT_URL` | `http://{subdomain}.localhost:3000` | `https://{subdomain}.cloudbizz.my.id` |
| `SAAS_ADMIN_URL` | `http://dash-admin.localhost:5173` | `https://dash-admin.cloudbizz.my.id` |
| `SAAS_LANDING_URL` | `http://carwash.localhost:8000` | `https://washwuzz.cloudbizz.my.id` |
| `DB_CONNECTION` | `sqlite` | `mysql` (MariaDB di aaPanel) |

Subdomain yang dicadangkan (tidak bisa dipakai tenant) ada di `backend/config/saas.php`.

File env per aplikasi:

| Aplikasi | Lokal | Production |
|---|---|---|
| Backend (landing + API) | `backend/.env` dari `.env.example` | `backend/.env` dari `.env.production.example` (berisi rahasia, tidak di-commit) |
| Dash-admin | `dash-admin/.env` dari `.env.example` | `dash-admin/.env.production` (otomatis dipakai `npm run build`) |
| Situs tenant | `.env.development` | `.env.production` (otomatis dipakai `npm run build`) |

## Deploy

Server: aaPanel (nginx + PHP 8.4 + MariaDB), repo di `/www/wwwroot/carwash/CarWash`, trafik publik lewat **Cloudflare Tunnel**
(HTTPS selesai di Cloudflare, tunnel → `http://localhost:80`).

| File | Isi |
|---|---|
| `deploy/nginx-carwash.conf` | tiga site: `washwuzz` → `backend/public`; `dash-admin` → `dash-admin/dist`; `*.cloudbizz.my.id` → `dist`. `/api` di semua site → Laravel, Host asli dipertahankan; alamat lama `carwash` dialihkan (301) ke `washwuzz` |
| `deploy/server-setup.sh` | sekali, dengan sudo: user deploy masuk grup `www`, izin `backend/storage` & `.env`, pasang config nginx + reload |
| `deploy/deploy.sh` | tiap update, tanpa sudo: `git pull`, composer, migrasi, cache config/route, build kedua frontend |

Pertama kali:

1. aaPanel: PHP 8.4 → pasang ekstensi **fileinfo**; buat database `carwash_cloud` (user `carwash_cloud`, akses lokal).
2. `cp backend/.env.production.example backend/.env`, isi `DB_PASSWORD` dan `APP_KEY`.
3. `sudo bash deploy/server-setup.sh`, lalu `bash deploy/deploy.sh`.
4. Cloudflare Tunnel → public hostname `washwuzz`, `carwash` (untuk pengalihan), `dash-admin`, dan `*` (paling bawah) → `http://localhost:80`.
5. `cd backend && php artisan saas:superadmin email@anda` (jangan jalankan seeder di production — isinya akun demo).

## Catatan teknis

- Setiap paket punya `vehicle_scope`: `car`, `motor`, atau `all`. Paket `motor` memakai harganya sendiri; `car` dan `all` memakai harga dasar × pengali jenis kendaraan. Reservasi situs hanya menawarkan jenis kendaraan yang punya paket.
- Ilustrasi kendaraan tampak atas: `src/lib/carSvg.ts` dan `dash-admin/src/lib/carSvg.ts` (isi identik — ubah keduanya).
- Gambar pratinjau link landing (`og:image`, satu per bahasa) ada di `backend/public/og`. Buat ulang dengan `node tools/og-image/make-og.mjs` kalau teks `landing.meta.image_alt` berubah.
- Foto paket & promo disimpan di `backend/storage/app/public/tenants/{id}/` dan disajikan lewat `/api/media/...`, jadi tidak perlu `storage:link` atau aturan nginx tambahan.
- Estimasi waktu tunggu dihitung dari jumlah bay (Profil Bisnis) dan durasi paket.
- Nomor antrian reset tiap hari menurut `SAAS_TIMEZONE` (default `Asia/Jakarta`).
- Tenant demo dari seeder buka 24 jam supaya reservasi bisa dicoba kapan saja.

## Status

- Selesai: landing + daftar, dash-admin (profil, jam buka, jumlah bay, paket + foto, add-on, promo, pengali harga kendaraan, antrian, publish), situs tenant (beranda promo, reservasi, papan antrian realtime).
- Belum ada: pembayaran langganan online (payment gateway), pengingat otomatis saat Pro hampir habis, notifikasi WhatsApp otomatis, logo bisnis, ganti subdomain, reset password.
- Add-on masih bisa diatur di dash-admin tapi belum dipakai di reservasi (sengaja disederhanakan).
