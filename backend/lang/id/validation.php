<?php

// Pesan validasi Bahasa Indonesia untuk aturan yang dipakai aplikasi ini.
// Aturan lain jatuh ke bahasa Inggris (fallback_locale).
return [
    'array' => ':Attribute harus berupa daftar.',
    'between' => [
        'numeric' => ':Attribute harus antara :min dan :max.',
    ],
    'boolean' => ':Attribute harus bernilai ya atau tidak.',
    'confirmed' => 'Konfirmasi :attribute tidak cocok.',
    'date_format' => ':Attribute harus berformat :format.',
    'distinct' => ':Attribute tidak boleh duplikat.',
    'email' => ':Attribute harus alamat email yang valid.',
    'in' => ':Attribute tidak valid.',
    'integer' => ':Attribute harus bilangan bulat.',
    'max' => [
        'array' => ':Attribute maksimal :max item.',
        'numeric' => ':Attribute maksimal :max.',
        'string' => ':Attribute maksimal :max karakter.',
    ],
    'min' => [
        'numeric' => ':Attribute minimal :min.',
        'string' => ':Attribute minimal :min karakter.',
    ],
    'numeric' => ':Attribute harus berupa angka.',
    'regex' => 'Format :attribute tidak valid.',
    'required' => ':Attribute wajib diisi.',
    'size' => [
        'array' => ':Attribute harus berisi :size item.',
    ],
    'string' => ':Attribute harus berupa teks.',
    'unique' => ':Attribute sudah dipakai.',
    'url' => ':Attribute harus URL yang valid.',

    'attributes' => [
        'business_name' => 'nama bisnis',
        'subdomain' => 'subdomain',
        'owner_name' => 'nama pemilik',
        'email' => 'email',
        'phone' => 'nomor WhatsApp',
        'password' => 'password',
        'name' => 'nama',
        'tagline' => 'tagline',
        'description' => 'deskripsi',
        'whatsapp' => 'nomor WhatsApp',
        'address' => 'alamat',
        'city' => 'kota',
        'maps_url' => 'link Google Maps',
        'category' => 'kategori',
        'price' => 'harga',
        'duration_minutes' => 'durasi',
        'features' => 'fitur',
        'opening_hours' => 'jam buka',
        'vehicle_types.*.price_multiplier' => 'pengali harga',
    ],
];
