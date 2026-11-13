import type { Messages } from './id'

// Bahasa Melayu (Malaysia). Kunci mengikuti id.ts.
const ms: Messages = {
  nav: {
    home: 'Utama',
    booking: 'Tempahan',
    status: 'Status Giliran',
    statusShort: 'Status',
    mainMenu: 'Menu utama',
    language: 'Bahasa',
  },

  header: {
    openToday: 'Buka hari ini {hours}',
    closedNow: 'Sedang tutup',
    logoAlt: 'Logo {name}',
  },

  wa: {
    ask: 'Hai {name}, saya ingin bertanya.',
    askService: 'Hai {name}, saya ingin bertanya tentang perkhidmatan cuci kereta.',
    order: 'Hai {name}, saya ingin menempah cucian kereta.',
    orderPackage: 'Hai {name}, saya ingin menempah {package}.',
    booked: 'Hai {name}, saya sudah membuat tempahan dalam talian dengan nombor giliran {ticket}.',
  },

  footer: {
    madeWith: 'Dibina dengan',
  },

  gate: {
    loading: 'Memuatkan',
    notFound: 'Laman tidak ditemui',
    notFoundText: 'belum didaftarkan atau belum diterbitkan oleh pemiliknya.',
    create: 'Cipta laman cuci kereta anda',
    loadFailed: 'Gagal memuatkan laman',
    checkConnection: 'Semak sambungan internet anda, kemudian cuba lagi.',
    retry: 'Cuba lagi',
  },

  format: {
    minutes: '{count} minit',
    hours: '{count} jam',
    shortMinutes: '{count} min',
    closed: 'Tutup',
    packageLabel: '{category} {scope}',
  },

  enums: {
    days: { mon: 'Isnin', tue: 'Selasa', wed: 'Rabu', thu: 'Khamis', fri: 'Jumaat', sat: 'Sabtu', sun: 'Ahad' },
    categories: { wash: 'Cuci', salon: 'Salun', coating: 'Coating' },
    scopes: { car: 'Kereta', motor: 'Motosikal' },
    colors: {
      white: 'Putih',
      black: 'Hitam',
      silver: 'Perak',
      gray: 'Kelabu',
      red: 'Merah',
      maroon: 'Merah Marun',
      blue: 'Biru',
      navy: 'Biru Gelap',
      green: 'Hijau',
      tosca: 'Firus',
      yellow: 'Kuning',
      orange: 'Oren',
      brown: 'Coklat',
      beige: 'Krim',
      pink: 'Merah Jambu',
    },
  },

  promo: {
    welcome: 'Cuci & salun kereta di {name}',
    bookNow: 'Tempah sekarang',
    carousel: 'Promosi',
    slideOf: '{n} daripada {count}',
    slide: 'Promosi {n}',
    previous: 'Promosi sebelumnya',
    next: 'Promosi seterusnya',
  },

  package: {
    popular: 'Paling laris',
    from: 'Dari',
    book: 'Tempah',
  },

  bay: {
    yours: 'Kenderaan anda',
    remaining: 'baki ±{minutes} minit',
  },

  home: {
    empty: 'Kosong',
    queueNow: 'Giliran sekarang',
    queueStats: '{progress} sedang dicuci · {waiting} menunggu',
    waitAbout: 'tunggu ±{minutes} min',
    noWait: 'boleh terus dikerjakan',
    packagesTitle: 'Pakej Perkhidmatan',
    packagesText: 'Harga pakej kereta untuk sedan/hatchback; jenis kenderaan lain diselaraskan.',
    categoriesLabel: 'Kategori perkhidmatan',
    all: 'Semua',
    hours: 'Waktu operasi',
    location: 'Lokasi',
    directions: 'Dapatkan arah',
    chat: 'Chat WhatsApp',
  },

  booking: {
    title: 'Tempahan Dalam Talian',
    subtitle: 'Isi maklumat ringkas dan terus dapatkan nombor giliran.',
    closed: 'Kami sedang tutup. Tempahan dalam talian boleh dibuat semasa waktu operasi.',
    closedToday: 'Kami sedang tutup. Tempahan dalam talian boleh dibuat semasa waktu operasi (hari ini {hours}).',
    step1: 'Maklumat anda',
    name: 'Nama',
    namePlaceholder: 'Nama anda',
    phone: 'No. telefon / WhatsApp',
    privacy: 'Papan giliran awam hanya memaparkan nama pertama & huruf awal; nombor telefon tidak dipaparkan.',
    step2: 'Jenis kenderaan',
    color: 'Warna kenderaan',
    step3: 'Pilih pakej',
    vehicle: 'Kenderaan',
    package: 'Pakej',
    total: 'Jumlah',
    payOnSite: 'Bayar di premis selepas selesai.',
    submit: 'Ambil Nombor Giliran',
    offline: 'Tidak dapat menyambung ke pelayan. Semak sambungan anda dan cuba lagi.',
    tooMany: 'Terlalu banyak percubaan. Tunggu sebentar dan cuba lagi.',
    failed: 'Tempahan gagal. Cuba lagi.',
  },

  unavailable: {
    title: 'Tempah melalui WhatsApp',
    text: '{name} menerima tempahan melalui WhatsApp atau secara walk-in. Pantau giliran di halaman status.',
    viewQueue: 'Lihat giliran sekarang',
  },

  success: {
    title: 'Tempahan berjaya!',
    save: 'Simpan nombor giliran anda.',
    ticket: 'Nombor giliran',
    position: 'Kedudukan giliran',
    positionValue: 'ke-{n}',
    estimate: 'Anggaran mula',
    minutes: '±{count} min',
    now: 'Sekarang',
    around: 'sekitar {time}',
    track: 'Pantau status giliran',
    confirm: 'Sahkan melalui WhatsApp',
  },

  status: {
    title: 'Giliran Cucian',
    disconnected: 'Sambungan terputus, mencuba semula…',
    live: 'Langsung · dikemas kini automatik',
    washing: 'Sedang dicuci',
    waiting: 'Menunggu',
    finishedToday: 'Selesai hari ini',
    emptyTitle: 'Belum ada giliran hari ini',
    emptyText: 'Datang terus atau ambil nombor giliran dalam talian sekarang.',
    book: 'Tempahan',
    inProgress: 'Sedang Dicuci',
    next: 'Giliran Seterusnya',
    vehicles: '{count} kenderaan',
    ready: 'Sedia Diambil',
    estStart: 'Anggaran mula',
    now: 'Sekarang',
    nextUp: 'Seterusnya',
  },

  myCar: {
    label: 'Kenderaan anda · {ticket}',
    ready: 'Selesai! Kenderaan anda sedia untuk diambil.',
    washing: 'Sedang dicuci · {progress}% · baki ±{minutes} minit',
    washingAt: 'Sedang dicuci di Bay {bay} · {progress}% · baki ±{minutes} minit',
    waiting: 'Menunggu · kedudukan ke-{n} · {when}',
    startsAround: 'mula sekitar {time}',
    soon: 'akan dikerjakan sebentar lagi',
  },
}

export default ms
