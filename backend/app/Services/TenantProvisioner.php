<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TenantProvisioner
{
    /**
     * Buat tenant baru (status draft) beserta akun owner dan data awal yang bisa langsung diedit.
     *
     * @param  array{business_name: string, subdomain: string, owner_name: string, email: string, phone: string, password: string}  $data
     * @return array{tenant: Tenant, user: User}
     */
    public function provision(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $tenant = Tenant::create([
                'name' => $data['business_name'],
                'subdomain' => $data['subdomain'],
                'status' => Tenant::STATUS_DRAFT,
                'whatsapp' => $data['phone'],
                'email' => $data['email'],
                'opening_hours' => Tenant::defaultOpeningHours(),
            ]);

            $user = $tenant->users()->create([
                'name' => $data['owner_name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'role' => 'owner',
                'password' => $data['password'],
            ]);

            $tenant->vehicleTypes()->createMany(self::starterVehicleTypes());
            $tenant->packages()->createMany(self::starterPackages());
            $tenant->addons()->createMany(self::starterAddons());

            return ['tenant' => $tenant, 'user' => $user];
        });
    }

    public static function starterVehicleTypes(): array
    {
        return [
            ['code' => 'compact', 'name' => 'Sedan / Hatchback', 'examples' => 'Civic, City, Yaris, Brio', 'price_multiplier' => 1.0, 'sort_order' => 1],
            ['code' => 'medium', 'name' => 'Medium SUV / Crossover', 'examples' => 'HR-V, CR-V, CX-5, Xforce', 'price_multiplier' => 1.2, 'sort_order' => 2],
            ['code' => 'large', 'name' => 'Large SUV / MPV / Van', 'examples' => 'Fortuner, Pajero, Innova, Alphard', 'price_multiplier' => 1.35, 'sort_order' => 3],
            ['code' => 'luxury', 'name' => 'Luxury / Sport', 'examples' => 'Porsche, G-Wagon, Defender, M4', 'price_multiplier' => 1.6, 'sort_order' => 4],
        ];
    }

    public static function starterPackages(): array
    {
        return [
            [
                'name' => 'Cuci Hidrolik Snow Foam',
                'category' => 'wash',
                'tagline' => 'Bersih menyeluruh luar dalam',
                'price' => 65000,
                'duration_minutes' => 45,
                'description' => 'Cuci hidrolik dengan sampo pH-netral snow foam, pembersihan velg & kolong, vacuum kabin, dan semir ban.',
                'features' => ['Cuci kolong hidrolik', 'Snow foam pH-netral', 'Vacuum kabin & bagasi', 'Semir ban'],
                'is_popular' => false,
                'sort_order' => 1,
            ],
            [
                'name' => 'Cuci + Wax & Interior',
                'category' => 'wash',
                'tagline' => 'Kilau & proteksi 30 hari',
                'price' => 165000,
                'duration_minutes' => 75,
                'description' => 'Cuci snow foam plus spray sealant, dressing interior, dan fogging anti-bakteri.',
                'features' => ['Semua fasilitas cuci snow foam', 'Spray sealant efek daun talas', 'Dressing dashboard & plastik', 'Fogging anti-bakteri'],
                'is_popular' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Salon Interior Lengkap',
                'category' => 'salon',
                'tagline' => 'Kabin kembali seperti baru',
                'price' => 450000,
                'duration_minutes' => 150,
                'description' => 'Pembersihan mendalam jok, plafon, dan karpet dengan uap panas, plus perawatan jok kulit.',
                'features' => ['Cuci jok & karpet', 'Steam plafon & doortrim', 'Perawatan jok kulit', 'Ozone penghilang bau'],
                'is_popular' => false,
                'sort_order' => 3,
            ],
        ];
    }

    public static function starterAddons(): array
    {
        return [
            ['name' => 'Detailing Ruang Mesin', 'category' => 'exterior', 'price' => 85000, 'duration_minutes' => 30, 'description' => 'Pembersihan ruang mesin aman tanpa siram air dan semir selang.', 'sort_order' => 1],
            ['name' => 'Rain Repellent Kaca Depan', 'category' => 'protection', 'price' => 95000, 'duration_minutes' => 25, 'description' => 'Lapisan hidrofobik agar air hujan cepat meluncur.', 'sort_order' => 2],
            ['name' => 'Fogging Anti-Bakteri', 'category' => 'interior', 'price' => 45000, 'duration_minutes' => 15, 'description' => 'Sterilisasi kabin dan saluran AC.', 'sort_order' => 3],
        ];
    }
}
