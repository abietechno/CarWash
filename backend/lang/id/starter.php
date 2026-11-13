<?php

// Data contoh untuk tenant baru (TenantProvisioner). Urutan paket & add-on harus sama di semua bahasa.
return [
    'vehicle_types' => [
        'compact' => ['name' => 'Sedan / Hatchback', 'examples' => 'Civic, City, Yaris, Brio'],
        'medium' => ['name' => 'Medium SUV / Crossover', 'examples' => 'HR-V, CR-V, CX-5, Xforce'],
        'large' => ['name' => 'Large SUV / MPV / Van', 'examples' => 'Fortuner, Pajero, Innova, Alphard'],
        'luxury' => ['name' => 'Luxury / Sport', 'examples' => 'Porsche, G-Wagon, Defender, M4'],
        'motor_matic' => ['name' => 'Motor Matic', 'examples' => 'Beat, Vario, Scoopy, NMAX'],
        'motor_listrik' => ['name' => 'Electric Vehicle (Molis)', 'examples' => 'Gesits, Alva One, Polytron Fox'],
        'motor_manual' => ['name' => 'Motor Manual', 'examples' => 'Supra, Vixion, CB150R, Ninja'],
    ],

    'packages' => [
        [
            'name' => 'Cuci Hidrolik Snow Foam',
            'tagline' => 'Bersih menyeluruh luar dalam',
            'description' => 'Cuci hidrolik dengan sampo pH-netral snow foam, pembersihan velg & kolong, vacuum kabin, dan semir ban.',
            'features' => ['Cuci kolong hidrolik', 'Snow foam pH-netral', 'Vacuum kabin & bagasi', 'Semir ban'],
        ],
        [
            'name' => 'Cuci + Wax & Interior',
            'tagline' => 'Kilau & proteksi 30 hari',
            'description' => 'Cuci snow foam plus spray sealant, dressing interior, dan fogging anti-bakteri.',
            'features' => ['Semua fasilitas cuci snow foam', 'Spray sealant efek daun talas', 'Dressing dashboard & plastik', 'Fogging anti-bakteri'],
        ],
        [
            'name' => 'Salon Interior Lengkap',
            'tagline' => 'Kabin kembali seperti baru',
            'description' => 'Pembersihan mendalam jok, plafon, dan karpet dengan uap panas, plus perawatan jok kulit.',
            'features' => ['Cuci jok & karpet', 'Steam plafon & doortrim', 'Perawatan jok kulit', 'Ozone penghilang bau'],
        ],
    ],

    'addons' => [
        ['name' => 'Detailing Ruang Mesin', 'description' => 'Pembersihan ruang mesin aman tanpa siram air dan semir selang.'],
        ['name' => 'Rain Repellent Kaca Depan', 'description' => 'Lapisan hidrofobik agar air hujan cepat meluncur.'],
        ['name' => 'Fogging Anti-Bakteri', 'description' => 'Sterilisasi kabin dan saluran AC.'],
    ],
];
