<?php

// Pesan validasi Bahasa Indonesia untuk aturan yang dipakai aplikasi ini.
// Aturan lain jatuh ke bahasa Inggris (fallback_locale).
return [
    'array' => ':attribute harus berupa daftar.',
    'between' => [
        'numeric' => ':attribute harus antara :min dan :max.',
    ],
    'boolean' => ':attribute harus bernilai ya atau tidak.',
    'confirmed' => 'Konfirmasi :attribute tidak cocok.',
    'date_format' => ':attribute harus berformat :format.',
    'distinct' => ':attribute tidak boleh duplikat.',
    'email' => ':attribute harus alamat email yang valid.',
    'in' => ':attribute tidak valid.',
    'integer' => ':attribute harus bilangan bulat.',
    'max' => [
        'array' => ':attribute maksimal :max item.',
        'numeric' => ':attribute maksimal :max.',
        'string' => ':attribute maksimal :max karakter.',
    ],
    'min' => [
        'numeric' => ':attribute minimal :min.',
        'string' => ':attribute minimal :min karakter.',
    ],
    'numeric' => ':attribute harus berupa angka.',
    'regex' => 'Format :attribute tidak valid.',
    'required' => ':attribute wajib diisi.',
    'size' => [
        'array' => ':attribute harus berisi :size item.',
    ],
    'string' => ':attribute harus berupa teks.',
    'unique' => ':attribute sudah dipakai.',
    'url' => ':attribute harus URL yang valid.',

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
