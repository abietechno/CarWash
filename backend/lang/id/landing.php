<?php

// Teks landing page (resources/views/landing.blade.php). :domain = domain induk tenant, :publish = kata "Publikasikan" yang ditebalkan.
return [
    'meta' => [
        'title' => 'WashWuzz: Website Bisnis Cuci Mobil & Motor dalam 5 Menit',
        'description' => 'WashWuzz: website & katalog layanan online untuk bisnis cuci mobil dan motor. Daftar gratis, dapat subdomain sendiri, atur harga dari dashboard.',
        // Teks gambar pratinjau link (public/og/washwuzz-id.png); ubah gambarnya juga kalau teks ini berubah.
        'image_alt' => 'WashWuzz: bisnis cuci mobil & motor, online dalam 5 menit. Daftar gratis di washwuzz.cloudbizz.my.id',
    ],

    'language' => 'Bahasa',

    'announce' => [
        'highlight' => 'Mulai gratis',
        'text' => '— upgrade ke Pro kapan saja.',
        'cta' => 'Daftar sekarang →',
    ],

    'nav' => [
        'features' => 'Fitur',
        'how' => 'Cara Kerja',
        'pricing' => 'Harga',
        'faq' => 'FAQ',
        'login' => 'Masuk Dashboard',
        'signup' => 'Daftar Gratis',
    ],

    'hero' => [
        'badge' => 'Untuk bisnis cuci & salon mobil',
        'title' => 'Cuci mobilmu,',
        'title_accent' => 'online dalam 5 menit.',
        'lead' => 'Daftar, pilih nama subdomain, isi layanan & harga — pelanggan langsung bisa lihat paket, harga per jenis kendaraan, jam buka, dan chat WhatsApp dari situs bisnismu sendiri.',
        'demo' => 'Lihat Contoh Situs',
        'points' => ['Tanpa coding', 'Subdomain sendiri', 'Atur dari HP'],
    ],

    'mockup' => [
        'open' => 'Buka · 08.00–17.00',
        'tagline' => 'Cuci & salon mobil premium di Surabaya',
        'packages' => [
            ['Cuci Hidrolik Snow Foam', '45 menit · Cuci', 'Rp65rb'],
            ['Cuci + Wax & Interior', '75 menit · Cuci', 'Rp165rb'],
            ['Salon Interior Lengkap', '150 menit · Salon', 'Rp450rb'],
        ],
        'popular' => 'Terlaris',
        'whatsapp' => 'Chat WhatsApp',
        'admin' => 'Dashboard Admin',
        'site_status' => 'Status situs',
        'active_packages' => '3 paket aktif',
        'vehicle_prices' => 'Harga per kendaraan',
        'online' => '● Online',
    ],

    'stats' => [
        ['5 Menit', 'Dari daftar sampai online'],
        ['1 Subdomain', 'namabisnis.:domain'],
        ['7 Kelas', 'Harga per jenis kendaraan'],
        ['Rp0', 'Untuk mulai'],
    ],

    'features' => [
        'badge' => 'Fitur',
        'title' => 'Semua yang dibutuhkan bisnis cuci mobil,',
        'title_accent' => 'dalam satu dashboard.',
        'lead' => 'Kamu fokus melayani pelanggan — situs, katalog, dan harga diurus dari dashboard yang bisa dibuka di HP.',
        'items' => [
            ['Subdomain Otomatis', 'Pilih nama saat daftar, situs langsung punya alamat sendiri seperti putrajayawash.:domain.', ['Tanpa beli domain', 'SSL aktif']],
            ['Katalog Paket & Harga', 'Atur paket cuci, salon, dan coating lengkap dengan durasi, fitur, dan label terlaris.', ['Cuci', 'Salon', 'Coating']],
            ['Harga per Jenis Kendaraan', 'Satu harga dasar, otomatis disesuaikan untuk sedan, SUV, MPV, mobil mewah, sampai motor.', ['Pengali harga', 'Bisa diubah']],
            ['Add-on Layanan', 'Tawarkan tambahan seperti detailing mesin, rain repellent, atau fogging di setiap paket.', ['Interior', 'Eksterior', 'Proteksi']],
            ['Jam Buka & Lokasi', 'Jam operasional per hari, alamat, dan link Google Maps tampil jelas di situs.', ['Senin–Minggu', 'Google Maps']],
            ['Chat WhatsApp', 'Tombol WhatsApp di situs, pelanggan langsung tanya atau pesan jadwal ke nomormu.', ['Satu klik', 'Tanpa aplikasi']],
        ],
    ],

    'how' => [
        'badge' => 'Cara Kerja',
        'title' => 'Empat langkah,',
        'title_accent' => 'situs langsung online.',
        'lead' => 'Tonton alur lengkapnya dalam video kurang dari semenit, dari pelanggan reservasi sampai laporan uang.',
        'video_note' => '',
        'video_label' => 'Video promo alur WashWuzz',
        'play' => 'Putar video promo',
        'steps' => [
            ['Daftar & pilih subdomain', 'Isi nama bisnis dan pilih alamat situs, misalnya putrajayawash.:domain.'],
            ['Lengkapi profil', 'Masuk ke dashboard, isi alamat, WhatsApp, deskripsi, dan jam buka.'],
            ['Atur layanan & harga', 'Edit paket contoh yang sudah disiapkan, atau buat paket sendiri.'],
            ['Publikasikan', 'Klik Publikasikan — situs langsung bisa dibuka pelanggan.'],
        ],
    ],

    'pricing' => [
        'title' => 'Mulai gratis,',
        'title_accent' => 'tanpa kartu kredit.',
        'lead' => 'Paket Gratis cukup untuk mulai online. Upgrade ke Pro untuk reservasi online, 25 foto promo, paket tanpa batas, manajemen transaksi keuangan, dan laporan akurat tiap bulan.',
        'free' => 'Gratis',
        'per_month' => '/ bulan',
        'free_items' => ['Situs bisnis dengan subdomain sendiri', 'Papan antrian realtime & pelanggan walk-in', 'Maks. 3 paket layanan aktif', 'Promo slider 1 foto', 'Profil, jam buka, WhatsApp & Maps'],
        'free_cta' => 'Daftar Gratis',
        'popular' => 'Paling lengkap',
        'thousand' => 'rb',
        'or_yearly' => 'atau Rp:price / tahun',
        'pro_items' => ['Semua fitur Gratis', 'Reservasi online dengan nomor antrian', 'Promo slider sampai 25 foto', 'Logo sendiri di header situs', 'Paket layanan tanpa batas', 'Tanpa label "Dibuat dengan WashWuzz"'],
        'pro_cta' => 'Mulai Gratis, Upgrade Nanti',
    ],

    'signup' => [
        'badge' => 'Daftar',
        'title' => 'Daftarkan bisnismu,',
        'title_accent' => 'pilih alamat situsnya.',
        'lead' => 'Setelah daftar, masuk ke dashboard untuk melengkapi profil dan harga. Situs baru bisa dibuka publik setelah kamu klik :publish.',
        'publish' => 'Publikasikan',
        'have_account' => 'Sudah punya akun?',
        'login' => 'Masuk dashboard',
    ],

    'form' => [
        'business_name' => 'Nama bisnis',
        'business_placeholder' => 'Putra Jaya Wash',
        'subdomain' => 'Alamat situs (subdomain)',
        'subdomain_hint' => 'Huruf kecil, angka, atau tanda hubung (-).',
        'owner_name' => 'Nama pemilik',
        'phone' => 'Nomor WhatsApp',
        'email' => 'Email (untuk login)',
        'password' => 'Password',
        'password_confirmation' => 'Ulangi password',
        'submit' => 'Daftar & Buat Situs',
        'note' => 'Mulai dengan paket Gratis. Situs belum tampil publik sampai kamu publikasikan.',
    ],

    'success' => [
        'title' => 'Pendaftaran berhasil!',
        'url_label' => 'Alamat situsmu:',
        'text' => 'Masuk ke dashboard untuk melengkapi profil & harga, lalu klik :publish.',
        'login' => 'Masuk ke Dashboard →',
    ],

    'faq' => [
        'title' => 'Pertanyaan umum',
        'items' => [
            ['Apakah benar gratis?', 'Ya. Paket Gratis bisa dipakai selamanya: situs, papan antrian, dan sampai 3 paket layanan. Upgrade ke Pro hanya kalau butuh reservasi online, promo, dan paket tanpa batas.'],
            ['Bagaimana cara bayar Pro?', 'Dari dashboard buka menu Langganan, ikuti instruksi pembayaran, lalu konfirmasi via WhatsApp. Pro aktif begitu pembayaran dikonfirmasi admin.'],
            ['Apakah saya perlu beli domain?', 'Tidak. Kamu dapat subdomain sendiri, misalnya putrajayawash.:domain, lengkap dengan SSL (https).'],
            ['Kapan situs saya bisa dibuka pelanggan?', 'Setelah kamu melengkapi nama bisnis, WhatsApp, alamat, kota, jam buka, minimal satu paket aktif, lalu klik Publikasikan di dashboard. Kamu bisa menyembunyikannya lagi kapan saja.'],
            ['Bisa ganti nama subdomain?', 'Saat ini subdomain dipilih sekali saat daftar. Hubungi kami kalau perlu menggantinya.'],
            ['Apakah pelanggan bisa booking online?', 'Bisa, di paket Pro: pelanggan reservasi dari situsmu, langsung dapat nomor antrian, dan memantau status mobilnya secara realtime. Di paket Gratis pelanggan pesan lewat WhatsApp atau datang langsung.'],
        ],
    ],

    'contact' => [
        'message' => 'Halo ABIE TECHNOLOGY, saya mau tanya soal WashWuzz.',
        'label' => 'Chat WhatsApp ABIE TECHNOLOGY',
    ],

    // Dipakai JavaScript form pendaftaran.
    'js' => [
        'checking' => 'Mengecek…',
        'available' => ':name tersedia',
        'unavailable' => 'Tidak tersedia',
        'check_failed' => 'Gagal mengecek, coba lagi.',
        'processing' => 'Memproses…',
        'too_many' => 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.',
        'error' => 'Terjadi kesalahan. Coba lagi.',
        'offline' => 'Tidak bisa terhubung ke server. Periksa koneksi lalu coba lagi.',
    ],
];
