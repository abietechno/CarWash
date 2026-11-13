<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TenantProvisioner
{
    /**
     * Buat tenant baru (status draft) beserta akun owner dan data awal yang bisa langsung diedit.
     * Data awal dan bahasa bawaan situs mengikuti bahasa yang dipakai saat mendaftar.
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
                'locale' => app()->getLocale(),
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

    // Nama & contoh kendaraan dari lang/{locale}/starter.php.
    public static function starterVehicleTypes(): array
    {
        $text = trans('starter.vehicle_types');
        $type = fn (string $code, float $multiplier, int $order) => [
            'code' => $code,
            'name' => $text[$code]['name'],
            'examples' => $text[$code]['examples'],
            'price_multiplier' => $multiplier,
            'sort_order' => $order,
        ];

        return [
            $type('compact', 1.0, 1),
            $type('medium', 1.2, 2),
            $type('large', 1.35, 3),
            $type('luxury', 1.6, 4),
            $type('motor_matic', 0.3, 5),
            $type('motor_listrik', 0.3, 6),
            $type('motor_manual', 0.3, 7),
        ];
    }

    public static function starterPackages(): array
    {
        [$wash, $wax, $interior] = trans('starter.packages');

        return [
            $wash + [
                'category' => 'wash',
                'vehicle_scope' => 'all',
                'price' => 65000,
                'duration_minutes' => 45,
                'is_popular' => false,
                'sort_order' => 1,
            ],
            $wax + [
                'category' => 'wash',
                'price' => 165000,
                'duration_minutes' => 75,
                'is_popular' => true,
                'sort_order' => 2,
            ],
            $interior + [
                'category' => 'salon',
                'price' => 450000,
                'duration_minutes' => 150,
                'is_popular' => false,
                'sort_order' => 3,
            ],
        ];
    }

    public static function starterAddons(): array
    {
        [$engine, $rain, $fogging] = trans('starter.addons');

        return [
            $engine + ['category' => 'exterior', 'price' => 85000, 'duration_minutes' => 30, 'sort_order' => 1],
            $rain + ['category' => 'protection', 'price' => 95000, 'duration_minutes' => 25, 'sort_order' => 2],
            $fogging + ['category' => 'interior', 'price' => 45000, 'duration_minutes' => 15, 'sort_order' => 3],
        ];
    }
}
