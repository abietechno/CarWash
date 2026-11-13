<?php

// Data contoh untuk tenant baru (TenantProvisioner). Urutan paket & add-on harus sama di semua bahasa.
return [
    'vehicle_types' => [
        'compact' => ['name' => 'Sedan / Hatchback', 'examples' => 'Myvi, Axia, Saga, City'],
        'medium' => ['name' => 'SUV Sederhana / Crossover', 'examples' => 'HR-V, X50, CX-5, CR-V'],
        'large' => ['name' => 'SUV Besar / MPV / Van', 'examples' => 'Alza, Innova, Fortuner, Alphard'],
        'luxury' => ['name' => 'Mewah / Sport', 'examples' => 'Porsche, G-Wagon, Defender, M4'],
        'motor_matic' => ['name' => 'Skuter Automatik', 'examples' => 'Vario, NVX, ADV, NMAX'],
        'motor_listrik' => ['name' => 'Motosikal Elektrik', 'examples' => 'Blueshark, NIU, EVT'],
        'motor_manual' => ['name' => 'Motosikal Manual', 'examples' => 'Y15ZR, RS150, LC135, Ninja'],
    ],

    'packages' => [
        [
            'name' => 'Cucian Hidraulik Snow Foam',
            'tagline' => 'Bersih menyeluruh, luar dan dalam',
            'description' => 'Cucian hidraulik dengan syampu snow foam pH neutral, pembersihan rim & bahagian bawah kenderaan, vakum kabin dan kilat tayar.',
            'features' => ['Cucian bawah kenderaan hidraulik', 'Snow foam pH neutral', 'Vakum kabin & but', 'Kilat tayar'],
        ],
        [
            'name' => 'Cucian + Wax & Dalaman',
            'tagline' => 'Berkilat & perlindungan 30 hari',
            'description' => 'Cucian snow foam berserta spray sealant, dressing dalaman dan fogging antibakteria.',
            'features' => ['Semua kemudahan cucian snow foam', 'Spray sealant kesan daun keladi', 'Dressing papan pemuka & plastik', 'Fogging antibakteria'],
        ],
        [
            'name' => 'Salun Dalaman Lengkap',
            'tagline' => 'Kabin kembali seperti baharu',
            'description' => 'Pembersihan mendalam tempat duduk, siling dan karpet dengan wap panas, serta rawatan kerusi kulit.',
            'features' => ['Cuci tempat duduk & karpet', 'Wap siling & panel pintu', 'Rawatan kerusi kulit', 'Ozon penghilang bau'],
        ],
    ],

    'addons' => [
        ['name' => 'Detailing Ruang Enjin', 'description' => 'Pembersihan ruang enjin yang selamat tanpa siraman air, berserta kilat hos.'],
        ['name' => 'Rain Repellent Cermin Depan', 'description' => 'Lapisan hidrofobik supaya air hujan cepat mengalir.'],
        ['name' => 'Fogging Antibakteria', 'description' => 'Pensterilan kabin dan saluran penghawa dingin.'],
    ],
];
