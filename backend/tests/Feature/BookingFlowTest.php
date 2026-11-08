<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Services\TenantProvisioner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingFlowTest extends TestCase
{
    use RefreshDatabase;

    private const SITE = 'http://putrajayawash.localhost';

    private function publishedTenant(string $subdomain = 'putrajayawash', string $email = 'owner@example.com'): array
    {
        $result = app(TenantProvisioner::class)->provision([
            'business_name' => 'Putra Jaya Wash',
            'subdomain' => $subdomain,
            'owner_name' => 'Owner',
            'email' => $email,
            'phone' => '081234567890',
            'password' => 'password123',
        ]);

        // Reservasi online & promo khusus Pro.
        $result['tenant']->update([
            'address' => 'Jl. Contoh 1',
            'city' => 'Surabaya',
            'status' => Tenant::STATUS_PUBLISHED,
            'pro_until' => now()->addMonth(),
            'opening_hours' => array_map(fn ($day) => ['day' => $day, 'open' => '00:00', 'close' => '23:59', 'closed' => false], Tenant::DAYS),
        ]);

        return $result;
    }

    private function book(int $packageId, array $overrides = [])
    {
        return $this->postJson(self::SITE.'/api/public/bookings', $overrides + [
            'customer_name' => 'Budi Santoso',
            'phone' => '081211112222',
            'vehicle_type' => 'large',
            'vehicle_color' => 'red',
            'package_id' => $packageId,
        ]);
    }

    public function test_online_booking_joins_todays_queue_with_ticket_and_vehicle_price(): void
    {
        ['tenant' => $tenant] = $this->publishedTenant();
        $package = $tenant->packages()->first(); // 65.000, large = x1.35

        $this->book($package->id)
            ->assertCreated()
            ->assertJsonPath('booking.ticket', 'A-001')
            ->assertJsonPath('booking.name', 'Budi S.')
            ->assertJsonPath('booking.status', 'waiting')
            ->assertJsonPath('booking.position', 1)
            ->assertJsonPath('booking.est_wait_minutes', 0)
            ->assertJsonMissingPath('booking.phone');

        $this->book($package->id, ['phone' => '081233334444'])->assertJsonPath('booking.ticket', 'A-002');

        $this->assertSame(87750, $tenant->bookings()->first()->price);
    }

    public function test_booking_is_rejected_when_closed_or_phone_has_too_many_active(): void
    {
        ['tenant' => $tenant] = $this->publishedTenant();
        $package = $tenant->packages()->first();

        $this->book($package->id)->assertCreated();
        $this->book($package->id)->assertCreated();
        $this->book($package->id)->assertUnprocessable()->assertJsonValidationErrors('phone');

        $tenant->update(['opening_hours' => array_map(fn ($day) => ['day' => $day, 'open' => '08:00', 'close' => '17:00', 'closed' => true], Tenant::DAYS)]);
        $this->book($package->id, ['phone' => '081299990000'])->assertUnprocessable()->assertJsonPath('message', fn ($m) => str_contains($m, 'tutup'));
    }

    public function test_booking_validates_vehicle_and_package_of_this_tenant(): void
    {
        ['tenant' => $tenant] = $this->publishedTenant();
        ['tenant' => $other] = $this->publishedTenant('lainwash', 'other@example.com');

        $this->book($other->packages()->first()->id)->assertUnprocessable()->assertJsonValidationErrors('package_id');
        $this->book($tenant->packages()->first()->id, ['vehicle_type' => 'truk'])->assertUnprocessable()->assertJsonValidationErrors('vehicle_type');
    }

    public function test_admin_moves_status_and_public_board_follows(): void
    {
        ['tenant' => $tenant, 'user' => $user] = $this->publishedTenant();
        $package = $tenant->packages()->first();
        $this->book($package->id);
        $this->book($package->id, ['phone' => '081233334444', 'customer_name' => 'Siska']);

        Sanctum::actingAs($user);
        $board = $this->getJson('/api/bookings')->assertOk()->json();
        $this->assertSame('081211112222', $board['waiting'][0]['phone']);
        [$first, $second] = array_column($board['waiting'], 'id');

        $this->patchJson("/api/bookings/$first/status", ['status' => 'in_progress'])->assertOk()->assertJsonPath('in_progress.0.bay', 1);
        $this->patchJson("/api/bookings/$second/status", ['status' => 'in_progress'])->assertOk()->assertJsonPath('in_progress.1.bay', 2);
        $this->patchJson("/api/bookings/$first/status", ['status' => 'picked_up'])->assertUnprocessable();
        $this->patchJson("/api/bookings/$first/status", ['status' => 'done'])->assertOk();

        $this->getJson(self::SITE.'/api/public/queue')
            ->assertOk()
            ->assertJsonPath('stats.in_progress', 1)
            ->assertJsonPath('stats.waiting', 0)
            ->assertJsonPath('stats.finished_today', 1)
            ->assertJsonPath('ready.0.ticket', 'A-001')
            ->assertJsonPath('in_progress.0.name', 'Siska')
            ->assertJsonMissingPath('in_progress.0.phone');

        $this->patchJson("/api/bookings/$first/status", ['status' => 'picked_up'])->assertOk();
        $this->getJson(self::SITE.'/api/public/queue')->assertJsonCount(0, 'ready');
    }

    public function test_walk_in_without_phone_and_isolation_between_tenants(): void
    {
        ['tenant' => $tenant, 'user' => $user] = $this->publishedTenant();
        ['tenant' => $other] = $this->publishedTenant('lainwash', 'other@example.com');
        $otherBooking = $other->bookings()->create([
            'queue_date' => now(config('saas.timezone'))->toDateString(), 'queue_number' => 1, 'customer_name' => 'X',
            'vehicle_type' => 'compact', 'package_name' => 'Cuci', 'price' => 1, 'duration_minutes' => 30,
        ]);

        Sanctum::actingAs($user);
        $this->postJson('/api/bookings', [
            'customer_name' => 'Pak Joko', 'vehicle_type' => 'medium', 'package_id' => $tenant->packages()->first()->id,
        ])->assertCreated()->assertJsonPath('waiting.0.source', 'walk_in');

        $this->patchJson("/api/bookings/{$otherBooking->id}/status", ['status' => 'in_progress'])->assertNotFound();
        $this->assertSame('waiting', $otherBooking->fresh()->status);
    }

    public function test_package_image_upload_and_promos_on_public_site(): void
    {
        Storage::fake('public');
        ['tenant' => $tenant, 'user' => $user] = $this->publishedTenant();
        $package = $tenant->packages()->first();

        Sanctum::actingAs($user);
        $url = $this->post("/api/packages/{$package->id}/image", ['image' => UploadedFile::fake()->image('cuci.jpg', 800, 600)], ['Accept' => 'application/json'])
            ->assertOk()->json('image_url');
        $this->assertStringStartsWith("/api/media/tenants/{$tenant->id}/", $url);
        $this->get($url)->assertOk();

        $this->post("/api/packages/{$package->id}/image", ['image' => UploadedFile::fake()->create('x.pdf', 10, 'application/pdf')], ['Accept' => 'application/json'])
            ->assertUnprocessable();

        $this->postJson('/api/promos', ['title' => 'Promo A', 'theme' => 'blue', 'service_package_id' => $package->id])->assertCreated();
        $this->postJson('/api/promos', ['title' => 'Promo B', 'theme' => 'rose', 'is_active' => false])->assertCreated();

        $this->getJson(self::SITE.'/api/public/site')
            ->assertOk()
            ->assertJsonCount(1, 'promos')
            ->assertJsonPath('promos.0.title', 'Promo A')
            ->assertJsonPath('packages.0.image_url', $url)
            ->assertJsonMissingPath('packages.0.image_path');
    }
}
