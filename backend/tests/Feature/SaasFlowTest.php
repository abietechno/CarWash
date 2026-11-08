<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Services\TenantProvisioner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SaasFlowTest extends TestCase
{
    use RefreshDatabase;

    private function provision(string $subdomain, string $email): array
    {
        return app(TenantProvisioner::class)->provision([
            'business_name' => ucfirst($subdomain),
            'subdomain' => $subdomain,
            'owner_name' => 'Owner',
            'email' => $email,
            'phone' => '081234567890',
            'password' => 'password123',
        ]);
    }

    private function completeProfile(Tenant $tenant): void
    {
        $tenant->update(['address' => 'Jl. Contoh 1', 'city' => 'Surabaya']);
    }

    public function test_subdomain_check_reports_availability(): void
    {
        $this->provision('putrajayawash', 'a@example.com');

        $this->getJson('/api/subdomains/check?name=NewWash')->assertJson(['subdomain' => 'newwash', 'available' => true]);
        $this->getJson('/api/subdomains/check?name=putrajayawash')->assertJson(['available' => false]);
        $this->getJson('/api/subdomains/check?name=dash-admin')->assertJson(['available' => false]);
        $this->getJson('/api/subdomains/check?name=ab')->assertJson(['available' => false]);
        $this->getJson('/api/subdomains/check?name=-bad-')->assertJson(['available' => false]);
    }

    public function test_register_creates_draft_tenant_with_owner_and_starter_data(): void
    {
        $response = $this->postJson('/api/register', [
            'business_name' => 'Putra Jaya Wash',
            'subdomain' => 'PutraJayaWash',
            'owner_name' => 'Putra',
            'email' => 'Owner@Example.com',
            'phone' => '0812 3456 7890',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('tenant.subdomain', 'putrajayawash')
            ->assertJsonPath('tenant.url', 'http://putrajayawash.localhost:3000');
        $this->assertStringContainsString('email=owner%40example.com', $response->json('login_url'));

        $tenant = Tenant::where('subdomain', 'putrajayawash')->firstOrFail();
        $this->assertSame(Tenant::STATUS_DRAFT, $tenant->status);
        $this->assertSame('owner@example.com', $tenant->users()->first()->email);
        $this->assertSame(3, $tenant->packages()->count());
        $this->assertSame(3, $tenant->addons()->count());
        $this->assertSame(7, $tenant->vehicleTypes()->count());
    }

    public function test_register_rejects_reserved_taken_and_invalid_input(): void
    {
        $this->provision('putrajayawash', 'taken@example.com');

        $base = [
            'business_name' => 'X', 'owner_name' => 'Y', 'phone' => '081234567890',
            'password' => 'password123', 'password_confirmation' => 'password123',
        ];

        $this->postJson('/api/register', $base + ['subdomain' => 'carwash', 'email' => 'n1@example.com'])
            ->assertUnprocessable()->assertJsonValidationErrors('subdomain');
        $this->postJson('/api/register', $base + ['subdomain' => 'putrajayawash', 'email' => 'n2@example.com'])
            ->assertUnprocessable()->assertJsonValidationErrors('subdomain');
        $this->postJson('/api/register', $base + ['subdomain' => 'freshwash', 'email' => 'taken@example.com'])
            ->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->postJson('/api/register', ['subdomain' => 'freshwash', 'email' => 'n3@example.com', 'password_confirmation' => 'x'] + $base)
            ->assertUnprocessable()->assertJsonValidationErrors('password');
    }

    public function test_login_returns_token_and_me_returns_tenant(): void
    {
        $this->provision('putrajayawash', 'owner@example.com');

        $this->postJson('/api/auth/login', ['email' => 'owner@example.com', 'password' => 'wrong'])
            ->assertUnprocessable()->assertJsonValidationErrors('email');

        $token = $this->postJson('/api/auth/login', ['email' => 'OWNER@example.com', 'password' => 'password123'])
            ->assertOk()->json('token');

        $this->withToken($token)->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.email', 'owner@example.com')
            ->assertJsonPath('tenant.subdomain', 'putrajayawash')
            ->assertJsonPath('tenant.status', 'draft');
    }

    public function test_publish_requires_complete_profile_then_goes_online(): void
    {
        ['user' => $user] = $this->provision('putrajayawash', 'owner@example.com');
        Sanctum::actingAs($user);

        $this->postJson('/api/tenant/publish')
            ->assertUnprocessable()
            ->assertJsonFragment(['issues' => ['Alamat belum diisi', 'Kota belum diisi']]);

        $this->putJson('/api/tenant', [
            'name' => 'Putra Jaya Wash',
            'whatsapp' => '081234567890',
            'address' => 'Jl. Raya Darmo 88',
            'city' => 'Surabaya',
            'opening_hours' => Tenant::defaultOpeningHours(),
        ])->assertOk()->assertJsonPath('publish_issues', []);

        $this->postJson('/api/tenant/publish')->assertOk()->assertJsonPath('status', 'published');
        $this->postJson('/api/tenant/unpublish')->assertOk()->assertJsonPath('status', 'draft');
    }

    public function test_opening_hours_close_must_be_after_open(): void
    {
        ['user' => $user] = $this->provision('putrajayawash', 'owner@example.com');
        Sanctum::actingAs($user);

        $hours = Tenant::defaultOpeningHours();
        $hours[0]['close'] = '07:00';

        $this->putJson('/api/tenant', ['name' => 'X', 'opening_hours' => $hours])
            ->assertUnprocessable()->assertJsonValidationErrors('opening_hours.0.close');
    }

    public function test_public_site_is_resolved_from_host_and_only_when_published(): void
    {
        ['tenant' => $tenant] = $this->provision('putrajayawash', 'owner@example.com');
        $this->completeProfile($tenant);

        $this->getJson('http://putrajayawash.localhost/api/public/site')->assertNotFound();

        $tenant->update(['status' => Tenant::STATUS_PUBLISHED]);
        $tenant->packages()->first()->update(['is_active' => false]);

        $this->getJson('http://putrajayawash.localhost/api/public/site')
            ->assertOk()
            ->assertJsonPath('tenant.name', 'Putrajayawash')
            ->assertJsonCount(2, 'packages')
            ->assertJsonCount(7, 'vehicle_types')
            ->assertJsonMissingPath('tenant.status');

        $this->getJson('http://unknown.localhost/api/public/site')->assertNotFound();
        $this->getJson('http://carwash.localhost/api/public/site')->assertNotFound();
        $this->getJson('http://a.putrajayawash.localhost/api/public/site')->assertNotFound();
    }

    public function test_tenant_cannot_touch_another_tenants_data(): void
    {
        ['user' => $userA] = $this->provision('wash-a', 'a@example.com');
        ['tenant' => $tenantB] = $this->provision('wash-b', 'b@example.com');
        $packageB = $tenantB->packages()->first();
        $addonB = $tenantB->addons()->first();

        Sanctum::actingAs($userA);

        $this->putJson("/api/packages/{$packageB->id}", [
            'name' => 'Hacked', 'category' => 'wash', 'price' => 1, 'duration_minutes' => 10,
        ])->assertNotFound();
        $this->deleteJson("/api/packages/{$packageB->id}")->assertNotFound();
        $this->deleteJson("/api/addons/{$addonB->id}")->assertNotFound();

        $this->assertSame($packageB->name, $packageB->fresh()->name);
        $this->assertNotNull($addonB->fresh());

        $ids = collect($this->getJson('/api/packages')->assertOk()->json())->pluck('id');
        $this->assertFalse($ids->contains($packageB->id));
    }

    public function test_package_crud_and_vehicle_multipliers(): void
    {
        ['tenant' => $tenant, 'user' => $user] = $this->provision('putrajayawash', 'owner@example.com');
        $tenant->update(['pro_until' => now()->addMonth()]); // paket ke-4 butuh Pro
        Sanctum::actingAs($user);

        $id = $this->postJson('/api/packages', [
            'name' => 'Coating 9H', 'category' => 'coating', 'price' => 2500000, 'duration_minutes' => 360,
            'features' => ['3 lapis', 'Garansi 2 tahun'], 'is_popular' => true, 'is_active' => true,
        ])->assertCreated()->json('id');

        $this->putJson("/api/packages/$id", [
            'name' => 'Coating 9H Plus', 'category' => 'coating', 'price' => 2750000, 'duration_minutes' => 360,
        ])->assertOk()->assertJsonPath('price', 2750000);

        $this->deleteJson("/api/packages/$id")->assertNoContent();

        $this->putJson('/api/vehicle-types', ['vehicle_types' => [
            ['code' => 'medium', 'name' => 'SUV Sedang', 'examples' => 'HR-V', 'price_multiplier' => 1.25],
        ]])->assertOk()->assertJsonFragment(['code' => 'medium', 'name' => 'SUV Sedang', 'price_multiplier' => 1.25]);
    }

    public function test_motorcycle_multiplier_can_go_below_half_but_not_below_the_minimum(): void
    {
        ['user' => $user] = $this->provision('putrajayawash', 'owner@example.com');
        Sanctum::actingAs($user);

        $this->putJson('/api/vehicle-types', ['vehicle_types' => [
            ['code' => 'motor_listrik', 'name' => 'Molis', 'examples' => null, 'price_multiplier' => 0.25],
        ]])->assertOk()->assertJsonFragment(['code' => 'motor_listrik', 'name' => 'Molis', 'price_multiplier' => 0.25]);

        $this->putJson('/api/vehicle-types', ['vehicle_types' => [
            ['code' => 'motor_listrik', 'name' => 'Molis', 'examples' => null, 'price_multiplier' => 0.05],
        ]])->assertUnprocessable()->assertJsonValidationErrors('vehicle_types.0.price_multiplier');
    }

    public function test_motorcycle_migration_backfills_existing_tenants_without_touching_their_edits(): void
    {
        ['tenant' => $tenant] = $this->provision('putrajayawash', 'owner@example.com');
        $tenant->vehicleTypes()->whereIn('code', ['motor_listrik', 'motor_manual'])->delete();
        $tenant->vehicleTypes()->where('code', 'motor_matic')->update(['name' => 'Skutik', 'price_multiplier' => 0.4]);

        $migration = require database_path('migrations/2026_11_10_000002_add_motorcycle_vehicle_types.php');
        $migration->up();
        $migration->up();

        $this->assertSame(7, $tenant->vehicleTypes()->count());
        $this->assertSame('Skutik', $tenant->vehicleTypes()->where('code', 'motor_matic')->value('name'));
        $this->assertSame('Electric Vehicle (Molis)', $tenant->vehicleTypes()->where('code', 'motor_listrik')->value('name'));
    }

    public function test_subdomain_checks_do_not_use_up_the_registration_limit(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->getJson("/api/subdomains/check?name=wash$i")->assertOk();
        }

        $this->postJson('/api/register', [
            'business_name' => 'Wash', 'subdomain' => 'wash-ok', 'owner_name' => 'Y', 'email' => 'ok@example.com',
            'phone' => '081234567890', 'password' => 'password123', 'password_confirmation' => 'password123',
        ])->assertCreated();
    }

    public function test_dashboard_endpoints_require_login(): void
    {
        $this->getJson('/api/tenant')->assertUnauthorized();
        $this->getJson('/api/packages')->assertUnauthorized();
    }
}
