<?php

return [

    /*
    | Domain induk tenant. Lokal: localhost (pakai *.localhost), production: cloudbizz.my.id.
    | Tenant dikenali dari subdomain host request: {subdomain}.{base_domain}.
    */
    'base_domain' => env('SAAS_BASE_DOMAIN', 'localhost'),

    // URL situs publik tenant; {subdomain} diganti nama subdomain tenant.
    'tenant_url' => env('SAAS_TENANT_URL', 'http://{subdomain}.localhost:3000'),

    'admin_url' => env('SAAS_ADMIN_URL', 'http://dash-admin.localhost:5173'),

    'landing_url' => env('SAAS_LANDING_URL', 'http://carwash.localhost:8000'),

    // Zona waktu jam buka & tanggal antrian harian.
    'timezone' => env('SAAS_TIMEZONE', 'Asia/Jakarta'),

    // Bahasa yang didukung; yang pertama = bawaan (sama dengan APP_LOCALE). Frontend mengirim pilihannya lewat header X-Locale.
    'locales' => ['id', 'ms', 'en'],

    // Tenant contoh untuk tombol "Lihat Contoh Situs" di landing page. Kosongkan untuk menyembunyikan.
    'demo_subdomain' => env('SAAS_DEMO_SUBDOMAIN', 'putrajayawash'),

    // Subdomain yang tidak boleh dipakai tenant.
    'reserved_subdomains' => [
        'www', 'carwash', 'washwuzz', 'dash-admin', 'admin', 'api', 'app', 'auth', 'login', 'register',
        'dashboard', 'panel', 'cpanel', 'webmail', 'mail', 'smtp', 'ftp', 'vps', 'ns1', 'ns2',
        'cdn', 'static', 'assets', 'blog', 'help', 'support', 'status', 'dev', 'staging', 'test', 'demo',
    ],

];
