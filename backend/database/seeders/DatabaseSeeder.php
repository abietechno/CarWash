<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Tenant;
use App\Models\User;
use App\Services\BookingService;
use App\Services\Subscriptions;
use App\Services\TenantProvisioner;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Super-admin platform: super@carwash.test / password (di server pakai: php artisan saas:superadmin)
        $super = User::create([
            'name' => 'Super Admin',
            'email' => 'super@carwash.test',
            'role' => 'superadmin',
            'password' => 'password',
        ]);

        // Tenant demo Gratis: http://sinarwash.localhost:3000 (login sinar@carwash.test / password)
        ['tenant' => $free] = app(TenantProvisioner::class)->provision([
            'business_name' => 'Sinar Wash',
            'subdomain' => 'sinarwash',
            'owner_name' => 'Sinar',
            'email' => 'sinar@carwash.test',
            'phone' => '081298765432',
            'password' => 'password',
        ]);
        $free->update([
            'address' => 'Jl. Kenjeran 21',
            'city' => 'Surabaya',
            'status' => Tenant::STATUS_PUBLISHED,
            'published_at' => now()->subDays(3),
        ]);

        // Tenant demo Pro yang sudah online: http://putrajayawash.localhost:3000
        // Login dash-admin: demo@carwash.test / password
        ['tenant' => $tenant] = app(TenantProvisioner::class)->provision([
            'business_name' => 'Putra Jaya Wash',
            'subdomain' => 'putrajayawash',
            'owner_name' => 'Putra Jaya',
            'email' => 'demo@carwash.test',
            'phone' => '081234567890',
            'password' => 'password',
        ]);

        $tenant->update([
            'tagline' => 'Cuci & salon mobil premium di Surabaya',
            'description' => 'Cuci hidrolik, salon interior, dan coating dengan teknisi berpengalaman. Reservasi online, pantau antrian dari HP.',
            'phone' => '0311234567',
            'address' => 'Jl. Raya Darmo No. 88',
            'city' => 'Surabaya',
            // Buka 24 jam supaya reservasi demo bisa dicoba kapan saja saat development.
            'opening_hours' => array_map(fn ($day) => ['day' => $day, 'open' => '00:00', 'close' => '23:59', 'closed' => false], Tenant::DAYS),
            'bay_count' => 2,
            'status' => Tenant::STATUS_PUBLISHED,
            'published_at' => now(),
        ]);

        app(Subscriptions::class)->recordPayment($tenant, ['period' => 'monthly', 'method' => 'transfer', 'reference' => 'TRF-DEMO-001'], $super);

        [$wash, $waxPackage, $salon] = $tenant->packages()->get()->all();

        $tenant->promos()->createMany([
            ['title' => 'Cuci + Wax cuma 150rb', 'subtitle' => 'Kilau daun talas untuk semua jenis mobil, khusus minggu ini.', 'badge' => 'Hemat 15rb', 'service_package_id' => $waxPackage->id, 'theme' => 'blue', 'sort_order' => 1],
            ['title' => 'Salon interior, kabin wangi lagi', 'subtitle' => 'Jok, plafon, karpet dibersihkan uap panas.', 'badge' => 'Baru', 'service_package_id' => $salon->id, 'theme' => 'violet', 'sort_order' => 2],
        ]);

        // Antrian contoh supaya papan status langsung terisi.
        $bookings = app(BookingService::class);
        $make = fn (string $name, string $type, string $color, $package) => $bookings->create($tenant, [
            'customer_name' => $name, 'phone' => '0812'.random_int(10000000, 99999999),
            'vehicle_type' => $type, 'vehicle_color' => $color, 'package_id' => $package->id,
        ], 'walk_in');

        $done = $make('Rina Wulandari', 'compact', 'white', $wash);
        $bookings->transition($done, Booking::IN_PROGRESS);
        $bookings->transition($done, Booking::DONE);

        foreach ([['Agus Pratama', 'large', 'black', $waxPackage, 50], ['Dewi Lestari', 'medium', 'blue', $wash, 15]] as [$name, $type, $color, $package, $minutesAgo]) {
            $booking = $make($name, $type, $color, $package);
            $bookings->transition($booking, Booking::IN_PROGRESS);
            $booking->update(['started_at' => now()->subMinutes($minutesAgo)]);
        }

        $make('Budi Santoso', 'compact', 'red', $wash);
        $make('Siska Amelia', 'luxury', 'yellow', $waxPackage);
        $make('Hendra Wijaya', 'medium', 'silver', $salon);
    }
}
