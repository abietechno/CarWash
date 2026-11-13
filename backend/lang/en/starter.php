<?php

// Data contoh untuk tenant baru (TenantProvisioner). Urutan paket & add-on harus sama di semua bahasa.
return [
    'vehicle_types' => [
        'compact' => ['name' => 'Sedan / Hatchback', 'examples' => 'Civic, City, Yaris, Brio'],
        'medium' => ['name' => 'Medium SUV / Crossover', 'examples' => 'HR-V, CR-V, CX-5, Xforce'],
        'large' => ['name' => 'Large SUV / MPV / Van', 'examples' => 'Fortuner, Pajero, Innova, Alphard'],
        'luxury' => ['name' => 'Luxury / Sport', 'examples' => 'Porsche, G-Wagon, Defender, M4'],
        'motor_matic' => ['name' => 'Automatic Scooter', 'examples' => 'Beat, Vario, Scoopy, NMAX'],
        'motor_listrik' => ['name' => 'Electric Motorcycle', 'examples' => 'Gesits, Alva One, Polytron Fox'],
        'motor_manual' => ['name' => 'Manual Motorcycle', 'examples' => 'Supra, Vixion, CB150R, Ninja'],
    ],

    'packages' => [
        [
            'name' => 'Hydraulic Snow Foam Wash',
            'tagline' => 'A thorough clean, inside and out',
            'description' => 'Hydraulic-lift wash with pH-neutral snow foam shampoo, wheel & undercarriage cleaning, cabin vacuum and tyre shine.',
            'features' => ['Hydraulic undercarriage wash', 'pH-neutral snow foam', 'Cabin & boot vacuum', 'Tyre shine'],
        ],
        [
            'name' => 'Wash + Wax & Interior',
            'tagline' => 'Shine & 30-day protection',
            'description' => 'Snow foam wash plus spray sealant, interior dressing and anti-bacterial fogging.',
            'features' => ['Everything in the snow foam wash', 'Spray sealant with lotus-leaf effect', 'Dashboard & trim dressing', 'Anti-bacterial fogging'],
        ],
        [
            'name' => 'Full Interior Detailing',
            'tagline' => 'A cabin that feels new again',
            'description' => 'Deep steam cleaning of seats, headliner and carpets, plus leather seat care.',
            'features' => ['Seat & carpet cleaning', 'Headliner & door trim steam', 'Leather seat care', 'Odour-removing ozone'],
        ],
    ],

    'addons' => [
        ['name' => 'Engine Bay Detailing', 'description' => 'Safe waterless engine bay cleaning with hose dressing.'],
        ['name' => 'Windscreen Rain Repellent', 'description' => 'Hydrophobic coating so rain beads off quickly.'],
        ['name' => 'Anti-Bacterial Fogging', 'description' => 'Sanitises the cabin and air-con vents.'],
    ],
];
