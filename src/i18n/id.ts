// Kamus utama situs tenant (Bahasa Indonesia). ms.ts dan en.ts wajib punya kunci yang sama (dicek TypeScript).
// {nama} = nilai yang disisipkan; "satu|banyak" = bentuk tunggal|jamak menurut {count}.
const id = {
  nav: {
    home: 'Beranda',
    booking: 'Reservasi',
    status: 'Status Antrian',
    statusShort: 'Status',
    mainMenu: 'Menu utama',
    language: 'Bahasa',
  },

  header: {
    openToday: 'Buka hari ini {hours}',
    closedNow: 'Sedang tutup',
    logoAlt: 'Logo {name}',
  },

  // Pesan WhatsApp ke bisnis.
  wa: {
    ask: 'Halo {name}, saya mau tanya.',
    askService: 'Halo {name}, saya mau tanya layanan cuci mobil.',
    order: 'Halo {name}, saya mau pesan cuci mobil.',
    orderPackage: 'Halo {name}, saya mau pesan {package}.',
    booked: 'Halo {name}, saya sudah reservasi online dengan nomor antrian {ticket}.',
  },

  footer: {
    madeWith: 'Dibuat dengan',
  },

  gate: {
    loading: 'Memuat',
    notFound: 'Situs tidak ditemukan',
    notFoundText: 'belum terdaftar atau belum dipublikasikan oleh pemiliknya.',
    create: 'Buat situs cuci mobilmu',
    loadFailed: 'Gagal memuat situs',
    checkConnection: 'Periksa koneksi internet, lalu coba lagi.',
    retry: 'Coba lagi',
  },

  format: {
    minutes: '{count} menit',
    hours: '{count} jam',
    shortMinutes: '{count} mnt',
    closed: 'Tutup',
    // Contoh: "Cuci Mobil"; paket untuk semua kendaraan hanya memakai nama kategori.
    packageLabel: '{category} {scope}',
  },

  enums: {
    days: { mon: 'Senin', tue: 'Selasa', wed: 'Rabu', thu: 'Kamis', fri: 'Jumat', sat: 'Sabtu', sun: 'Minggu' },
    categories: { wash: 'Cuci', salon: 'Salon', coating: 'Coating' },
    scopes: { car: 'Mobil', motor: 'Motor' },
    // Kodenya sama dengan VEHICLE_COLORS di lib/carSvg.ts.
    colors: {
      white: 'Putih',
      black: 'Hitam',
      silver: 'Silver',
      gray: 'Abu-abu',
      red: 'Merah',
      maroon: 'Maroon',
      blue: 'Biru',
      navy: 'Biru Dongker',
      green: 'Hijau',
      tosca: 'Tosca',
      yellow: 'Kuning',
      orange: 'Oranye',
      brown: 'Cokelat',
      beige: 'Krem',
      pink: 'Pink',
    },
  },

  promo: {
    welcome: 'Cuci & salon mobil di {name}',
    bookNow: 'Pesan sekarang',
    carousel: 'Promo',
    slideOf: '{n} dari {count}',
    slide: 'Promo {n}',
    previous: 'Promo sebelumnya',
    next: 'Promo berikutnya',
  },

  package: {
    popular: 'Terlaris',
    from: 'Mulai',
    book: 'Pesan',
  },

  bay: {
    yours: 'Kendaraan kamu',
    remaining: 'sisa ±{minutes} menit',
  },

  home: {
    empty: 'Kosong',
    queueNow: 'Antrian sekarang',
    queueStats: '{progress} dicuci · {waiting} menunggu',
    waitAbout: 'tunggu ±{minutes} mnt',
    noWait: 'bisa langsung dikerjakan',
    packagesTitle: 'Paket Layanan',
    packagesText: 'Harga paket mobil untuk sedan/hatchback; jenis kendaraan lain menyesuaikan.',
    categoriesLabel: 'Kategori layanan',
    all: 'Semua',
    hours: 'Jam buka',
    location: 'Lokasi',
    directions: 'Petunjuk arah',
    chat: 'Chat WhatsApp',
  },

  booking: {
    title: 'Reservasi Online',
    subtitle: 'Isi data singkat, langsung dapat nomor antrian.',
    closed: 'Kami sedang tutup. Reservasi online bisa dilakukan saat jam buka.',
    closedToday: 'Kami sedang tutup. Reservasi online bisa dilakukan saat jam buka (hari ini {hours}).',
    step1: 'Data kamu',
    name: 'Nama',
    namePlaceholder: 'Nama kamu',
    phone: 'No. HP / WhatsApp',
    privacy: 'Di papan antrian publik hanya tampil nama depan & inisial, nomor HP tidak ditampilkan.',
    step2: 'Jenis kendaraan',
    color: 'Warna kendaraan',
    step3: 'Pilih paket',
    vehicle: 'Kendaraan',
    package: 'Paket',
    total: 'Total',
    payOnSite: 'Bayar di tempat setelah selesai.',
    submit: 'Ambil Nomor Antrian',
    offline: 'Tidak bisa terhubung ke server. Periksa koneksi lalu coba lagi.',
    tooMany: 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.',
    failed: 'Reservasi gagal. Coba lagi.',
  },

  unavailable: {
    title: 'Pesan via WhatsApp',
    text: '{name} menerima pesanan lewat WhatsApp atau datang langsung. Pantau antrian dari halaman status.',
    viewQueue: 'Lihat antrian sekarang',
  },

  success: {
    title: 'Reservasi berhasil!',
    save: 'Simpan nomor antrianmu.',
    ticket: 'Nomor antrian',
    position: 'Posisi antrian',
    positionValue: 'ke-{n}',
    estimate: 'Estimasi mulai',
    minutes: '±{count} mnt',
    now: 'Sekarang',
    around: 'sekitar {time}',
    track: 'Pantau status antrian',
    confirm: 'Konfirmasi via WhatsApp',
  },

  status: {
    title: 'Antrian Cuci',
    disconnected: 'Koneksi terputus, mencoba lagi…',
    live: 'Live · diperbarui otomatis',
    washing: 'Sedang dicuci',
    waiting: 'Menunggu',
    finishedToday: 'Selesai hari ini',
    emptyTitle: 'Belum ada antrian hari ini',
    emptyText: 'Datang langsung atau ambil nomor antrian online sekarang.',
    book: 'Reservasi',
    inProgress: 'Sedang Dicuci',
    next: 'Antrian Berikutnya',
    vehicles: '{count} kendaraan',
    ready: 'Siap Diambil',
    estStart: 'Est. mulai',
    now: 'Sekarang',
    nextUp: 'Berikutnya',
  },

  myCar: {
    label: 'Kendaraan kamu · {ticket}',
    ready: 'Selesai! Kendaraan kamu siap diambil.',
    washing: 'Sedang dicuci · {progress}% · sisa ±{minutes} menit',
    washingAt: 'Sedang dicuci di Bay {bay} · {progress}% · sisa ±{minutes} menit',
    waiting: 'Menunggu · posisi ke-{n} · {when}',
    startsAround: 'mulai sekitar {time}',
    soon: 'segera dikerjakan',
  },
}

export default id
export type Messages = typeof id
