<?php

// Mesej pengesahan Bahasa Melayu untuk peraturan yang digunakan aplikasi ini (pasangan lang/id/validation.php).
// Peraturan lain jatuh ke bahasa Inggeris (fallback_locale).
return [
    'array' => ':Attribute mestilah dalam bentuk senarai.',
    'between' => [
        'numeric' => ':Attribute mestilah antara :min dan :max.',
    ],
    'boolean' => ':Attribute mestilah ya atau tidak.',
    'confirmed' => 'Pengesahan :attribute tidak sepadan.',
    'date_format' => ':Attribute mestilah dalam format :format.',
    'distinct' => ':Attribute tidak boleh berulang.',
    'email' => ':Attribute mestilah alamat e-mel yang sah.',
    'in' => ':Attribute tidak sah.',
    'integer' => ':Attribute mestilah nombor bulat.',
    'max' => [
        'array' => ':Attribute maksimum :max item.',
        'numeric' => ':Attribute maksimum :max.',
        'string' => ':Attribute maksimum :max aksara.',
    ],
    'min' => [
        'numeric' => ':Attribute minimum :min.',
        'string' => ':Attribute minimum :min aksara.',
    ],
    'numeric' => ':Attribute mestilah nombor.',
    'regex' => 'Format :attribute tidak sah.',
    'required' => ':Attribute wajib diisi.',
    'size' => [
        'array' => ':Attribute mestilah mengandungi :size item.',
    ],
    'string' => ':Attribute mestilah teks.',
    'unique' => ':Attribute sudah digunakan.',
    'url' => ':Attribute mestilah URL yang sah.',

    'attributes' => [
        'business_name' => 'nama perniagaan',
        'subdomain' => 'subdomain',
        'owner_name' => 'nama pemilik',
        'email' => 'e-mel',
        'phone' => 'nombor WhatsApp',
        'password' => 'kata laluan',
        'name' => 'nama',
        'tagline' => 'tagline',
        'description' => 'penerangan',
        'whatsapp' => 'nombor WhatsApp',
        'address' => 'alamat',
        'city' => 'bandar',
        'maps_url' => 'pautan Google Maps',
        'category' => 'kategori',
        'price' => 'harga',
        'duration_minutes' => 'tempoh',
        'features' => 'ciri',
        'opening_hours' => 'waktu operasi',
        'vehicle_types.*.price_multiplier' => 'pengganda harga',
    ],
];
