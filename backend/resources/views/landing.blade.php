<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="WashWuzz — website & katalog layanan online untuk bisnis cuci dan salon mobil. Daftar gratis, dapat subdomain sendiri, atur harga dari dashboard." />
    <title>WashWuzz — Website Bisnis Cuci Mobil dalam 5 Menit</title>
    <link rel="icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.3.5"></script>

    @verbatim
    <style type="text/tailwindcss">
        @theme {
            /* Brand: biru air */
            --color-brand-50:  #EEF6FF;
            --color-brand-100: #D9EAFF;
            --color-brand-200: #BCDAFF;
            --color-brand-300: #8EC2FF;
            --color-brand-400: #599FFF;
            --color-brand-500: #2F7BF6;
            --color-brand-600: #1A5FE0;
            --color-brand-700: #154BB5;
            --color-brand-800: #173F8E;
            --color-brand-900: #183870;

            /* Accent: cyan busa */
            --color-accent-50:  #ECFEFF;
            --color-accent-100: #CFFAFE;
            --color-accent-300: #67E8F9;
            --color-accent-400: #22D3EE;
            --color-accent-500: #06B6D4;
            --color-accent-600: #0891B2;

            /* Ink: navy */
            --color-ink-950: #06101F;
            --color-ink-900: #0B1A2E;
            --color-ink-800: #13263F;
            --color-ink-700: #23395A;
            --color-ink-500: #51627C;
            --color-ink-400: #8796AD;

            --color-platinum-50:  #F8FAFD;
            --color-platinum-100: #EFF3F9;
            --color-platinum-200: #E1E8F2;
            --color-platinum-300: #C9D4E3;

            --font-display: "Bricolage Grotesque", ui-sans-serif, system-ui;
            --font-sans: "Inter", ui-sans-serif, system-ui;
        }
        body { font-family: var(--font-sans); color: var(--color-ink-900); background: #FFFFFF; }
        h1, h2, h3, h4, .font-display { font-family: var(--font-display); letter-spacing: -0.02em; }

        .bg-grid {
            background-image:
              linear-gradient(rgba(47,123,246,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(47,123,246,0.06) 1px, transparent 1px);
            background-size: 36px 36px;
        }
        .bg-pattern-stripe {
            background-image:
              repeating-linear-gradient(45deg, rgba(6,182,212,0.08) 0, rgba(6,182,212,0.08) 2px, transparent 2px, transparent 14px);
        }
        .glow { box-shadow: 0 30px 80px -20px rgba(47,123,246,0.45); }
        .glow-accent { box-shadow: 0 20px 60px -20px rgba(6,182,212,0.55); }
        .reveal { opacity: 0; transform: translateY(16px); transition: all .7s ease; }
        .reveal.in { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
        details[open] .faq-plus { transform: rotate(45deg); }
    </style>
    @endverbatim
</head>
<body class="antialiased">

<!-- Announcement -->
<div class="bg-ink-950 text-white text-xs sm:text-sm">
    <div class="max-w-7xl mx-auto px-5 lg:px-8 py-2 text-center">
        <span class="text-accent-300 font-semibold">Mulai gratis</span> — upgrade ke Pro kapan saja.
        <a href="#daftar" class="underline underline-offset-2 hover:text-accent-300">Daftar sekarang →</a>
    </div>
</div>

<!-- Header -->
<header class="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-platinum-200">
    <nav class="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
        <a href="#" class="flex items-center gap-2.5">
            <img src="/logo.png" alt="" class="h-9 w-auto">
            <span class="font-display font-bold text-lg">WashWuzz</span>
        </a>
        <div class="hidden md:flex items-center gap-8 text-sm text-ink-700">
            <a href="#fitur" class="hover:text-brand-600">Fitur</a>
            <a href="#cara-kerja" class="hover:text-brand-600">Cara Kerja</a>
            <a href="#harga" class="hover:text-brand-600">Harga</a>
            <a href="#faq" class="hover:text-brand-600">FAQ</a>
        </div>
        <div class="flex items-center gap-2 sm:gap-3">
            <a href="{{ $adminUrl }}/login" class="hidden sm:inline-flex text-sm font-medium text-ink-700 hover:text-brand-600 px-3 py-2">Masuk Dashboard</a>
            <a href="#daftar" class="inline-flex items-center gap-1.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 transition">
                Daftar Gratis
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
        </div>
    </nav>
</header>

<!-- Hero -->
<section class="relative overflow-hidden bg-white">
    <div class="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]"></div>
    <div class="absolute -top-40 -right-40 w-[42rem] h-[42rem] rounded-full bg-gradient-to-br from-brand-100 via-accent-50 to-transparent blur-3xl opacity-80"></div>

    <div class="relative max-w-7xl mx-auto px-5 lg:px-8 pt-16 pb-20 lg:pt-28 lg:pb-32 grid lg:grid-cols-2 gap-14 items-center">
        <div class="reveal">
            <span class="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                <span class="w-1.5 h-1.5 rounded-full bg-accent-500"></span>
                Untuk bisnis cuci &amp; salon mobil
            </span>
            <h1 class="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] text-ink-950">
                Cuci mobilmu,<br><span class="text-brand-500">online dalam 5 menit.</span>
            </h1>
            <p class="mt-6 text-lg text-ink-700 max-w-xl leading-relaxed">
                Daftar, pilih nama subdomain, isi layanan &amp; harga — pelanggan langsung bisa lihat paket,
                harga per jenis kendaraan, jam buka, dan chat WhatsApp dari situs bisnismu sendiri.
            </p>
            <div class="mt-8 flex flex-wrap items-center gap-3">
                <a href="#daftar" class="inline-flex items-center gap-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 glow transition">
                    Daftar Gratis
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
                @if ($demoUrl)
                <a href="{{ $demoUrl }}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 rounded-full border border-platinum-300 bg-white hover:border-brand-300 font-semibold px-6 py-3 text-ink-900 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-brand-500" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    Lihat Contoh Situs
                </a>
                @endif
            </div>
            <ul class="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-700">
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-accent-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Tanpa coding</li>
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-accent-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Subdomain sendiri</li>
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-accent-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Atur dari HP</li>
            </ul>
        </div>

        <!-- Mockup: situs tenant di HP + kartu dashboard -->
        <div class="relative reveal flex justify-center lg:justify-end">
            <div class="relative w-[290px] sm:w-[320px] rounded-[2.5rem] bg-ink-950 p-3 shadow-2xl glow rotate-[2deg]">
                <div class="rounded-[2rem] overflow-hidden bg-platinum-50">
                    <div class="bg-white px-4 pt-3 pb-2 border-b border-platinum-200">
                        <div class="flex items-center gap-2 rounded-full bg-platinum-100 px-3 py-1.5 text-[11px] text-ink-500">
                            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                            putrajayawash.{{ $baseDomain }}
                        </div>
                    </div>
                    <div class="bg-gradient-to-br from-brand-500 to-accent-500 px-5 py-5 text-white">
                        <p class="text-[11px] uppercase tracking-wider opacity-80">Buka · 08.00–17.00</p>
                        <p class="font-display font-bold text-xl mt-1">Putra Jaya Wash</p>
                        <p class="text-xs opacity-90 mt-1">Cuci & salon mobil premium di Surabaya</p>
                    </div>
                    <div class="p-4 space-y-3">
                        <div class="rounded-2xl bg-white p-3.5 border border-platinum-200">
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="text-sm font-semibold">Cuci Hidrolik Snow Foam</p>
                                    <p class="text-[11px] text-ink-500 mt-0.5">45 menit · Cuci</p>
                                </div>
                                <p class="text-sm font-bold text-brand-600">Rp65rb</p>
                            </div>
                        </div>
                        <div class="rounded-2xl bg-white p-3.5 border-2 border-brand-400 relative">
                            <span class="absolute -top-2 right-3 rounded-full bg-accent-500 text-white text-[10px] font-bold px-2 py-0.5">Terlaris</span>
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="text-sm font-semibold">Cuci + Wax &amp; Interior</p>
                                    <p class="text-[11px] text-ink-500 mt-0.5">75 menit · Cuci</p>
                                </div>
                                <p class="text-sm font-bold text-brand-600">Rp165rb</p>
                            </div>
                        </div>
                        <div class="rounded-2xl bg-white p-3.5 border border-platinum-200">
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="text-sm font-semibold">Salon Interior Lengkap</p>
                                    <p class="text-[11px] text-ink-500 mt-0.5">150 menit · Salon</p>
                                </div>
                                <p class="text-sm font-bold text-brand-600">Rp450rb</p>
                            </div>
                        </div>
                        <div class="rounded-full bg-[#25D366] text-white text-center text-sm font-semibold py-2.5">Chat WhatsApp</div>
                    </div>
                </div>
            </div>
            <div class="absolute -left-2 sm:left-4 lg:-left-6 bottom-6 w-48 rounded-2xl border-2 border-accent-400 bg-white p-4 shadow-xl glow-accent -rotate-[4deg]">
                <p class="text-[10px] font-semibold uppercase tracking-wider text-accent-600">Dashboard Admin</p>
                <p class="font-display font-bold text-sm mt-1">Status situs</p>
                <div class="mt-2 space-y-1.5 text-[11px]">
                    <p class="rounded-lg bg-platinum-100 px-2 py-1">3 paket aktif</p>
                    <p class="rounded-lg bg-platinum-100 px-2 py-1">Harga per kendaraan</p>
                    <p class="rounded-lg bg-accent-50 text-accent-600 font-semibold px-2 py-1">● Online</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Stats -->
<section class="border-y border-platinum-200 bg-platinum-50 bg-pattern-stripe">
    <div class="max-w-7xl mx-auto px-5 lg:px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        <div><p class="font-display text-2xl sm:text-3xl font-bold text-brand-600">5 Menit</p><p class="text-sm text-ink-500 mt-1">Dari daftar sampai online</p></div>
        <div><p class="font-display text-2xl sm:text-3xl font-bold text-brand-600">1 Subdomain</p><p class="text-sm text-ink-500 mt-1">namabisnis.{{ $baseDomain }}</p></div>
        <div><p class="font-display text-2xl sm:text-3xl font-bold text-brand-600">7 Kelas</p><p class="text-sm text-ink-500 mt-1">Harga per jenis kendaraan</p></div>
        <div><p class="font-display text-2xl sm:text-3xl font-bold text-brand-600">Rp0</p><p class="text-sm text-ink-500 mt-1">Untuk mulai</p></div>
    </div>
</section>

<!-- Fitur -->
<section id="fitur" class="py-24 lg:py-32">
    <div class="max-w-7xl mx-auto px-5 lg:px-8">
        <div class="max-w-2xl reveal">
            <span class="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
                <span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Fitur
            </span>
            <h2 class="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                Semua yang dibutuhkan bisnis cuci mobil, <span class="text-brand-500">dalam satu dashboard.</span>
            </h2>
            <p class="mt-5 text-lg text-ink-500">Kamu fokus melayani pelanggan — situs, katalog, dan harga diurus dari dashboard yang bisa dibuka di HP.</p>
        </div>

        <div class="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            @foreach ([
                ['Subdomain Otomatis', 'Pilih nama saat daftar, situs langsung punya alamat sendiri seperti putrajayawash.'.$baseDomain.'.', ['Tanpa beli domain', 'SSL aktif'], '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'],
                ['Katalog Paket & Harga', 'Atur paket cuci, salon, dan coating lengkap dengan durasi, fitur, dan label terlaris.', ['Cuci', 'Salon', 'Coating'], '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>'],
                ['Harga per Jenis Kendaraan', 'Satu harga dasar, otomatis disesuaikan untuk sedan, SUV, MPV, mobil mewah, sampai motor.', ['Pengali harga', 'Bisa diubah'], '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>'],
                ['Add-on Layanan', 'Tawarkan tambahan seperti detailing mesin, rain repellent, atau fogging di setiap paket.', ['Interior', 'Eksterior', 'Proteksi'], '<path d="M12 3v18"/><path d="M3 12h18"/>'],
                ['Jam Buka & Lokasi', 'Jam operasional per hari, alamat, dan link Google Maps tampil jelas di situs.', ['Senin–Minggu', 'Google Maps'], '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'],
                ['Chat WhatsApp', 'Tombol WhatsApp di situs, pelanggan langsung tanya atau pesan jadwal ke nomormu.', ['Satu klik', 'Tanpa aplikasi'], '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'],
            ] as [$title, $text, $tags, $icon])
            <div class="reveal rounded-3xl border border-platinum-200 bg-white p-7 hover:border-brand-200 hover:shadow-lg transition">
                <span class="grid place-items-center w-11 h-11 rounded-xl bg-brand-500 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{!! $icon !!}</svg>
                </span>
                <h3 class="mt-5 text-lg font-bold">{{ $title }}</h3>
                <p class="mt-2 text-sm text-ink-500 leading-relaxed">{{ $text }}</p>
                <div class="mt-4 flex flex-wrap gap-2">
                    @foreach ($tags as $tag)
                    <span class="rounded-full bg-platinum-100 px-2.5 py-1 text-xs text-ink-700">{{ $tag }}</span>
                    @endforeach
                </div>
            </div>
            @endforeach
        </div>
    </div>
</section>

<!-- Cara kerja -->
<section id="cara-kerja" class="relative py-24 lg:py-32 bg-gradient-to-b from-brand-50 via-white to-accent-50 overflow-hidden">
    <div class="max-w-7xl mx-auto px-5 lg:px-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-x-16 gap-y-12">
        <div class="max-w-2xl reveal">
            <span class="inline-flex items-center gap-2 rounded-full border border-accent-300 bg-accent-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-600">
                <span class="w-1.5 h-1.5 rounded-full bg-accent-500"></span> Cara Kerja
            </span>
            <h2 class="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                Empat langkah, <span class="text-brand-500">situs langsung online.</span>
            </h2>
            <p class="mt-5 text-lg text-ink-500">Tonton alur lengkapnya dalam video kurang dari semenit, dari pelanggan reservasi sampai laporan uang.</p>
        </div>

        <div class="reveal w-full max-w-[300px] mx-auto lg:max-w-none lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-center">
            <div class="relative rounded-[2.5rem] bg-ink-950 p-3 shadow-2xl glow">
                <video
                    id="promo-video"
                    src="/video/washwuzz-promo.mp4"
                    poster="/video/washwuzz-promo-poster.jpg"
                    preload="none"
                    controls
                    playsinline
                    aria-label="Video promo alur WashWuzz"
                    class="block w-full aspect-[9/16] rounded-[2rem] bg-ink-900"
                ></video>
                <button id="promo-play" type="button" aria-label="Putar video promo" class="absolute inset-0 m-auto w-20 h-20 flex items-center justify-center rounded-full bg-white/90 text-brand-600 shadow-xl transition-colors hover:bg-white">
                    <svg class="w-9 h-9 ml-1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
                </button>
            </div>
        </div>

        <ol class="grid sm:grid-cols-2 gap-5">
            @foreach ([
                ['Daftar & pilih subdomain', 'Isi nama bisnis dan pilih alamat situs, misalnya putrajayawash.'.$baseDomain.'.'],
                ['Lengkapi profil', 'Masuk ke dashboard, isi alamat, WhatsApp, deskripsi, dan jam buka.'],
                ['Atur layanan & harga', 'Edit paket contoh yang sudah disiapkan, atau buat paket sendiri.'],
                ['Publikasikan', 'Klik Publikasikan — situs langsung bisa dibuka pelanggan.'],
            ] as $i => [$title, $text])
            <li class="reveal rounded-3xl bg-white/80 backdrop-blur border border-platinum-200 p-7">
                <span class="font-display text-5xl font-extrabold text-brand-200">0{{ $i + 1 }}</span>
                <h3 class="mt-3 text-lg font-bold">{{ $title }}</h3>
                <p class="mt-2 text-sm text-ink-500 leading-relaxed">{{ $text }}</p>
            </li>
            @endforeach
        </ol>
    </div>
</section>

<!-- Harga -->
<section id="harga" class="py-24 lg:py-32 bg-platinum-50">
    <div class="max-w-5xl mx-auto px-5 lg:px-8">
        <div class="text-center max-w-2xl mx-auto reveal">
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">Mulai gratis, <span class="text-brand-500">tanpa kartu kredit.</span></h2>
            <p class="mt-5 text-lg text-ink-500">Paket Gratis cukup untuk mulai online. Upgrade ke Pro untuk reservasi online, 25 foto promo, paket tanpa batas, manajemen transaksi keuangan, dan laporan akurat tiap bulan.</p>
        </div>
        <div class="mt-14 grid md:grid-cols-2 gap-6">
            <div class="reveal rounded-3xl border border-platinum-200 bg-white p-8">
                <h3 class="text-xl font-bold">Gratis</h3>
                <p class="mt-3"><span class="font-display text-5xl font-extrabold">Rp0</span><span class="text-ink-500"> / bulan</span></p>
                <ul class="mt-6 space-y-3 text-sm text-ink-700">
                    @foreach (['Situs bisnis dengan subdomain sendiri', 'Papan antrian realtime & pelanggan walk-in', 'Maks. 3 paket layanan aktif', 'Promo slider 1 foto', 'Profil, jam buka, WhatsApp & Maps'] as $item)
                    <li class="flex gap-2"><svg class="w-5 h-5 shrink-0 text-accent-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>{{ $item }}</li>
                    @endforeach
                </ul>
                <a href="#daftar" class="mt-8 block text-center rounded-full bg-platinum-100 hover:bg-platinum-200 text-ink-900 font-semibold py-3 transition">Daftar Gratis</a>
            </div>
            <div class="reveal rounded-3xl border-2 border-brand-400 bg-white p-8 relative glow">
                <span class="absolute -top-3 left-8 rounded-full bg-brand-500 text-white text-xs font-bold px-3 py-1">Paling lengkap</span>
                <h3 class="text-xl font-bold">Pro</h3>
                <p class="mt-3"><span class="font-display text-5xl font-extrabold">Rp{{ number_format($prices['monthly'] / 1000, 0, ',', '.') }}rb</span><span class="text-ink-500"> / bulan</span></p>
                <p class="mt-1 text-sm text-ink-500">atau Rp{{ number_format($prices['yearly'], 0, ',', '.') }} / tahun</p>
                <ul class="mt-6 space-y-3 text-sm text-ink-700">
                    @foreach (['Semua fitur Gratis', 'Reservasi online dengan nomor antrian', 'Promo slider sampai 25 foto', 'Logo sendiri di header situs', 'Paket layanan tanpa batas', 'Tanpa label "Dibuat dengan WashWuzz"'] as $item)
                    <li class="flex gap-2"><svg class="w-5 h-5 shrink-0 text-accent-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>{{ $item }}</li>
                    @endforeach
                </ul>
                <a href="#daftar" class="mt-8 block text-center rounded-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 transition">Mulai Gratis, Upgrade Nanti</a>
            </div>
        </div>
    </div>
</section>

<!-- Daftar -->
<section id="daftar" class="py-24 lg:py-32">
    <div class="max-w-7xl mx-auto px-5 lg:px-8 grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        <div class="lg:col-span-2 reveal">
            <span class="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
                <span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Daftar
            </span>
            <h2 class="mt-5 text-3xl sm:text-4xl font-extrabold leading-tight">Daftarkan bisnismu, <span class="text-brand-500">pilih alamat situsnya.</span></h2>
            <p class="mt-5 text-ink-500 leading-relaxed">Setelah daftar, masuk ke dashboard untuk melengkapi profil dan harga. Situs baru bisa dibuka publik setelah kamu klik <strong class="text-ink-900">Publikasikan</strong>.</p>
            <p class="mt-6 text-sm text-ink-500">Sudah punya akun? <a href="{{ $adminUrl }}/login" class="font-semibold text-brand-600 hover:underline">Masuk dashboard</a></p>
        </div>

        <div class="lg:col-span-3 reveal">
            <form id="register-form" class="rounded-3xl border border-platinum-200 bg-white p-6 sm:p-8 shadow-xl shadow-brand-100/60 space-y-5" novalidate>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <label class="block sm:col-span-2">
                        <span class="text-sm font-medium">Nama bisnis</span>
                        <input name="business_name" required maxlength="100" placeholder="Putra Jaya Wash" class="mt-1.5 w-full rounded-xl border border-platinum-300 px-4 py-3 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100">
                        <span data-error="business_name" class="hidden mt-1 text-xs text-red-600"></span>
                    </label>
                    <label class="block sm:col-span-2">
                        <span class="text-sm font-medium">Alamat situs (subdomain)</span>
                        <div class="mt-1.5 flex rounded-xl border border-platinum-300 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100 overflow-hidden">
                            <input name="subdomain" required maxlength="32" placeholder="putrajayawash" autocomplete="off" autocapitalize="off" spellcheck="false" class="min-w-0 flex-1 px-4 py-3 outline-none">
                            <span class="shrink-0 bg-platinum-50 border-l border-platinum-200 px-3 py-3 text-sm text-ink-500">.{{ $baseDomain }}</span>
                        </div>
                        <span id="subdomain-status" class="block mt-1 text-xs text-ink-500">Huruf kecil, angka, atau tanda hubung (-).</span>
                        <span data-error="subdomain" class="hidden mt-1 text-xs text-red-600"></span>
                    </label>
                    <label class="block">
                        <span class="text-sm font-medium">Nama pemilik</span>
                        <input name="owner_name" required maxlength="100" autocomplete="name" class="mt-1.5 w-full rounded-xl border border-platinum-300 px-4 py-3 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100">
                        <span data-error="owner_name" class="hidden mt-1 text-xs text-red-600"></span>
                    </label>
                    <label class="block">
                        <span class="text-sm font-medium">Nomor WhatsApp</span>
                        <input name="phone" required inputmode="tel" autocomplete="tel" placeholder="0812..." class="mt-1.5 w-full rounded-xl border border-platinum-300 px-4 py-3 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100">
                        <span data-error="phone" class="hidden mt-1 text-xs text-red-600"></span>
                    </label>
                    <label class="block sm:col-span-2">
                        <span class="text-sm font-medium">Email (untuk login)</span>
                        <input name="email" type="email" required autocomplete="email" class="mt-1.5 w-full rounded-xl border border-platinum-300 px-4 py-3 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100">
                        <span data-error="email" class="hidden mt-1 text-xs text-red-600"></span>
                    </label>
                    <label class="block">
                        <span class="text-sm font-medium">Password</span>
                        <input name="password" type="password" required minlength="8" autocomplete="new-password" class="mt-1.5 w-full rounded-xl border border-platinum-300 px-4 py-3 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100">
                        <span data-error="password" class="hidden mt-1 text-xs text-red-600"></span>
                    </label>
                    <label class="block">
                        <span class="text-sm font-medium">Ulangi password</span>
                        <input name="password_confirmation" type="password" required minlength="8" autocomplete="new-password" class="mt-1.5 w-full rounded-xl border border-platinum-300 px-4 py-3 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100">
                    </label>
                </div>
                <p id="form-error" class="hidden rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"></p>
                <button type="submit" class="w-full rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold py-3.5 transition">Daftar &amp; Buat Situs</button>
                <p class="text-center text-xs text-ink-400">Mulai dengan paket Gratis. Situs belum tampil publik sampai kamu publikasikan.</p>
            </form>

            <div id="register-success" class="hidden rounded-3xl border-2 border-accent-400 bg-white p-8 text-center glow-accent">
                <span class="mx-auto grid place-items-center w-14 h-14 rounded-full bg-accent-50 text-accent-600">
                    <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </span>
                <h3 class="mt-5 text-2xl font-bold">Pendaftaran berhasil!</h3>
                <p class="mt-3 text-ink-500">Alamat situsmu:</p>
                <p id="success-url" class="mt-1 font-semibold text-brand-600 break-all"></p>
                <p class="mt-4 text-sm text-ink-500">Masuk ke dashboard untuk melengkapi profil &amp; harga, lalu klik <strong class="text-ink-900">Publikasikan</strong>.</p>
                <a id="success-login" href="#" class="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 transition">Masuk ke Dashboard →</a>
            </div>
        </div>
    </div>
</section>

<!-- FAQ -->
<section id="faq" class="py-24 lg:py-32 bg-platinum-50">
    <div class="max-w-3xl mx-auto px-5 lg:px-8">
        <h2 class="text-3xl sm:text-4xl font-extrabold text-center reveal">Pertanyaan umum</h2>
        <div class="mt-12 space-y-3">
            @foreach ([
                ['Apakah benar gratis?', 'Ya. Paket Gratis bisa dipakai selamanya: situs, papan antrian, dan sampai 3 paket layanan. Upgrade ke Pro hanya kalau butuh reservasi online, promo, dan paket tanpa batas.'],
                ['Bagaimana cara bayar Pro?', 'Dari dashboard buka menu Langganan, ikuti instruksi pembayaran, lalu konfirmasi via WhatsApp. Pro aktif begitu pembayaran dikonfirmasi admin.'],
                ['Apakah saya perlu beli domain?', 'Tidak. Kamu dapat subdomain sendiri, misalnya putrajayawash.'.$baseDomain.', lengkap dengan SSL (https).'],
                ['Kapan situs saya bisa dibuka pelanggan?', 'Setelah kamu melengkapi nama bisnis, WhatsApp, alamat, kota, jam buka, minimal satu paket aktif, lalu klik Publikasikan di dashboard. Kamu bisa menyembunyikannya lagi kapan saja.'],
                ['Bisa ganti nama subdomain?', 'Saat ini subdomain dipilih sekali saat daftar. Hubungi kami kalau perlu menggantinya.'],
                ['Apakah pelanggan bisa booking online?', 'Bisa, di paket Pro: pelanggan reservasi dari situsmu, langsung dapat nomor antrian, dan memantau status mobilnya secara realtime. Di paket Gratis pelanggan pesan lewat WhatsApp atau datang langsung.'],
            ] as [$q, $a])
            <details class="reveal group rounded-2xl border border-platinum-200 bg-white px-6 py-5">
                <summary class="flex cursor-pointer items-center justify-between gap-4 font-semibold">
                    {{ $q }}
                    <span class="faq-plus text-2xl leading-none text-brand-500 transition">+</span>
                </summary>
                <p class="mt-3 text-sm text-ink-500 leading-relaxed">{{ $a }}</p>
            </details>
            @endforeach
        </div>
    </div>
</section>

@php($whatsappUrl = 'https://wa.me/6281233741899?text='.rawurlencode('Halo ABIE TECHNOLOGY, saya mau tanya soal WashWuzz.'))

<!-- Footer (padding bawah memberi ruang untuk tombol WhatsApp melayang) -->
<footer class="bg-ink-950 text-white/70">
    <div class="max-w-7xl mx-auto px-5 lg:px-8 pt-12 pb-24 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
        <div class="flex items-center gap-2.5">
            <img src="/logo-white.png" alt="" class="h-9 w-auto">
            <span class="font-display font-bold text-white">WashWuzz</span>
        </div>
        <div class="text-sm sm:text-right">
            <p>© {{ date('Y') }} WashWuzz · cloudbizz.my.id</p>
            <a href="{{ $whatsappUrl }}" target="_blank" rel="noopener" class="mt-1 inline-block hover:text-white">WhatsApp 081233741899 · ABIE TECHNOLOGY</a>
        </div>
    </div>
</footer>

<a
    href="{{ $whatsappUrl }}"
    target="_blank"
    rel="noopener"
    aria-label="Chat WhatsApp ABIE TECHNOLOGY"
    class="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/25 transition-colors hover:bg-[#1ebe5b] md:right-6 md:bottom-6"
>
    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
    ABIE TECHNOLOGY
</a>

<script>window.SAAS = @json(['adminUrl' => $adminUrl]);</script>
@verbatim
<script>
    // Animasi muncul saat discroll.
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

    // Tombol putar besar di atas sampul; setelah video jalan, kontrol bawaan browser yang dipakai.
    const promoVideo = document.getElementById('promo-video');
    const promoPlay = document.getElementById('promo-play');
    promoPlay.addEventListener('click', () => promoVideo.play());
    promoVideo.addEventListener('play', () => promoPlay.remove(), { once: true });

    const form = document.getElementById('register-form');
    const nameInput = form.elements.business_name;
    const subInput = form.elements.subdomain;
    const subStatus = document.getElementById('subdomain-status');
    const formError = document.getElementById('form-error');
    let subEdited = false;
    let checkTimer;
    let checkSeq = 0;

    const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '').slice(0, 32);

    function setStatus(text, tone) {
        subStatus.textContent = text;
        subStatus.className = 'block mt-1 text-xs ' + ({ ok: 'text-accent-600 font-medium', bad: 'text-red-600', muted: 'text-ink-500' }[tone]);
    }

    function scheduleCheck() {
        clearTimeout(checkTimer);
        const value = subInput.value.trim().toLowerCase();
        if (!value) { setStatus('Huruf kecil, angka, atau tanda hubung (-).', 'muted'); return; }
        setStatus('Mengecek…', 'muted');
        checkTimer = setTimeout(async () => {
            const seq = ++checkSeq;
            try {
                const res = await fetch('/api/subdomains/check?name=' + encodeURIComponent(value), { headers: { Accept: 'application/json' } });
                const data = await res.json();
                if (seq !== checkSeq) return;
                if (data.available) setStatus('✓ ' + data.subdomain + ' tersedia', 'ok');
                else setStatus(data.reason || 'Tidak tersedia', 'bad');
            } catch {
                if (seq === checkSeq) setStatus('Gagal mengecek, coba lagi.', 'bad');
            }
        }, 400);
    }

    nameInput.addEventListener('input', () => {
        if (!subEdited) { subInput.value = slugify(nameInput.value); scheduleCheck(); }
    });
    subInput.addEventListener('input', () => {
        subEdited = subInput.value !== '';
        subInput.value = subInput.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        scheduleCheck();
    });

    function clearErrors() {
        form.querySelectorAll('[data-error]').forEach((el) => { el.textContent = ''; el.classList.add('hidden'); });
        formError.classList.add('hidden');
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearErrors();
        const button = form.querySelector('button[type=submit]');
        button.disabled = true;
        button.textContent = 'Memproses…';

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(Object.fromEntries(new FormData(form))),
            });
            const data = await res.json().catch(() => ({}));

            if (res.status === 201) {
                document.getElementById('success-url').textContent = data.tenant.url;
                document.getElementById('success-login').href = data.login_url;
                form.classList.add('hidden');
                document.getElementById('register-success').classList.remove('hidden');
                return;
            }
            if (res.status === 422 && data.errors) {
                Object.entries(data.errors).forEach(([field, messages]) => {
                    const el = form.querySelector(`[data-error="${field}"]`);
                    if (el) { el.textContent = messages[0]; el.classList.remove('hidden'); }
                });
                form.querySelector('[data-error]:not(.hidden)')?.closest('label')?.querySelector('input')?.focus();
                return;
            }
            formError.textContent = res.status === 429
                ? 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.'
                : (data.message || 'Terjadi kesalahan. Coba lagi.');
            formError.classList.remove('hidden');
        } catch {
            formError.textContent = 'Tidak bisa terhubung ke server. Periksa koneksi lalu coba lagi.';
            formError.classList.remove('hidden');
        } finally {
            button.disabled = false;
            button.textContent = 'Daftar & Buat Situs';
        }
    });
</script>
@endverbatim
</body>
</html>
