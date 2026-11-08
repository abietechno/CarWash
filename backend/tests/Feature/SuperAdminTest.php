<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Tenant;
use App\Models\User;
use App\Services\TenantProvisioner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SuperAdminTest extends TestCase
{
    use RefreshDatabase;

    private function superadmin(): User
    {
        return User::create(['name' => 'Super', 'email' => 'super@example.com', 'role' => 'superadmin', 'password' => 'password123']);
    }

    private function tenant(string $subdomain = 'putrajayawash', string $email = 'owner@example.com'): array
    {
        $result = app(TenantProvisioner::class)->provision([
            'business_name' => ucfirst($subdomain),
            'subdomain' => $subdomain,
            'owner_name' => 'Owner',
            'email' => $email,
            'phone' => '081234567890',
            'password' => 'password123',
        ]);
        $result['tenant']->update([
            'address' => 'Jl. Contoh 1',
            'city' => 'Surabaya',
            'status' => Tenant::STATUS_PUBLISHED,
            'published_at' => now(),
            'opening_hours' => array_map(fn ($day) => ['day' => $day, 'open' => '00:00', 'close' => '23:59', 'closed' => false], Tenant::DAYS),
        ]);

        return $result;
    }

    public function test_only_superadmin_can_access_super_endpoints(): void
    {
        ['user' => $owner] = $this->tenant();

        $this->getJson('/api/super/overview')->assertUnauthorized();
        Sanctum::actingAs($owner);
        $this->getJson('/api/super/overview')->assertForbidden();
        $this->getJson('/api/super/tenants')->assertForbidden();

        Sanctum::actingAs($this->superadmin());
        $this->getJson('/api/super/overview')->assertOk()->assertJsonPath('tenants.total', 1)->assertJsonPath('plans.free', 1);
        // Super-admin tidak punya tenant sendiri.
        $this->getJson('/api/tenant')->assertForbidden();
    }

    public function test_free_plan_limits_are_enforced(): void
    {
        ['tenant' => $tenant, 'user' => $owner] = $this->tenant();
        Sanctum::actingAs($owner);

        // 3 paket aktif dari provisioning = batas Gratis.
        $this->postJson('/api/packages', ['name' => 'Ke-4', 'category' => 'wash', 'price' => 50000, 'duration_minutes' => 30])
            ->assertUnprocessable()->assertJsonValidationErrors('is_active');
        $this->postJson('/api/packages', ['name' => 'Draft', 'category' => 'wash', 'price' => 50000, 'duration_minutes' => 30, 'is_active' => false])
            ->assertCreated();
        // Promo slider Gratis: 1 foto.
        $this->postJson('/api/promos', ['title' => 'Promo', 'theme' => 'blue'])->assertCreated();
        $this->postJson('/api/promos', ['title' => 'Promo 2', 'theme' => 'rose'])
            ->assertUnprocessable()->assertJsonValidationErrors('promo');

        $this->getJson('http://putrajayawash.localhost/api/public/site')
            ->assertOk()
            ->assertJsonPath('features', ['online_booking' => false, 'branding' => true])
            ->assertJsonCount(1, 'promos');

        $this->postJson('http://putrajayawash.localhost/api/public/bookings', [
            'customer_name' => 'Budi', 'phone' => '081211112222', 'vehicle_type' => 'compact', 'package_id' => $tenant->packages()->first()->id,
        ])->assertForbidden();
    }

    public function test_recording_payment_upgrades_to_pro_and_stacks_periods(): void
    {
        ['tenant' => $tenant] = $this->tenant();
        Sanctum::actingAs($this->superadmin());

        $this->postJson("/api/super/tenants/{$tenant->id}/payments", ['period' => 'monthly', 'method' => 'transfer'])
            ->assertCreated()
            ->assertJsonPath('plan', 'pro')
            ->assertJsonPath('payments.0.amount', 99000);
        $firstEnd = $tenant->fresh()->pro_until;
        $this->assertTrue($firstEnd->between(now()->addMonth()->subMinute(), now()->addMonth()->addMinute()));

        // Bayar lagi sebelum habis: diperpanjang dari akhir masa aktif, bukan dari hari ini.
        $this->postJson("/api/super/tenants/{$tenant->id}/payments", ['period' => 'yearly', 'method' => 'qris', 'amount' => 900000])->assertCreated();
        $this->assertSame($firstEnd->copy()->addMonthsNoOverflow(12)->toDateString(), $tenant->fresh()->pro_until->toDateString());

        $this->getJson('/api/super/overview')
            ->assertJsonPath('plans.pro', 1)
            ->assertJsonPath('revenue.this_month', 999000)
            ->assertJsonPath('revenue.estimated_mrr', 75000);

        $this->getJson('http://putrajayawash.localhost/api/public/site')->assertJsonPath('features.online_booking', true);
        $this->assertSame(2, ActivityLog::where('action', 'payment.recorded')->count());
    }

    public function test_plan_can_be_corrected_and_expired_pro_falls_back_to_free(): void
    {
        ['tenant' => $tenant] = $this->tenant();
        Sanctum::actingAs($this->superadmin());

        $this->putJson("/api/super/tenants/{$tenant->id}/plan", ['pro_until' => now()->addDays(3)->toDateString()])
            ->assertOk()->assertJsonPath('plan', 'pro');
        $this->getJson('/api/super/tenants?plan=expiring')->assertJsonCount(1, 'data');

        $this->putJson("/api/super/tenants/{$tenant->id}/plan", ['pro_until' => null, 'note' => 'salah catat'])
            ->assertOk()->assertJsonPath('plan', 'free');

        $tenant->update(['pro_until' => now()->subMinute()]);
        $this->assertSame('free', $tenant->fresh()->plan());
    }

    public function test_suspend_takes_site_offline_and_activate_restores_it(): void
    {
        ['tenant' => $tenant, 'user' => $owner] = $this->tenant();
        $super = $this->superadmin();

        Sanctum::actingAs($super);
        $this->postJson("/api/super/tenants/{$tenant->id}/suspend", ['reason' => 'Konten tidak pantas'])->assertOk()->assertJsonPath('status', 'suspended');
        $this->getJson('http://putrajayawash.localhost/api/public/site')->assertNotFound();

        Sanctum::actingAs($owner);
        $this->postJson('/api/tenant/publish')->assertForbidden();

        Sanctum::actingAs($super);
        $this->postJson("/api/super/tenants/{$tenant->id}/activate")->assertOk()->assertJsonPath('status', 'published');
        $this->getJson('http://putrajayawash.localhost/api/public/site')->assertOk();
        $this->getJson("/api/super/tenants/{$tenant->id}")->assertJsonPath('activity.0.action', 'tenant.activated');
    }

    public function test_impersonation_gives_temporary_owner_session_and_is_logged(): void
    {
        ['tenant' => $tenant] = $this->tenant();
        Sanctum::actingAs($this->superadmin());

        $token = $this->postJson("/api/super/tenants/{$tenant->id}/impersonate")->assertOk()->json('token');
        $this->assertSame(1, ActivityLog::where('action', 'tenant.impersonated')->where('tenant_id', $tenant->id)->count());

        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('tenant.subdomain', 'putrajayawash')
            ->assertJsonPath('impersonating', true);
    }

    public function test_tenant_list_search_and_settings(): void
    {
        $this->tenant('putrajayawash', 'a@example.com');
        $this->tenant('sinarwash', 'b@example.com');
        Sanctum::actingAs($this->superadmin());

        $this->getJson('/api/super/tenants?search=sinar')->assertJsonCount(1, 'data')->assertJsonPath('data.0.subdomain', 'sinarwash');
        $this->getJson('/api/super/tenants?search=a@example')->assertJsonPath('data.0.subdomain', 'putrajayawash');

        $this->putJson('/api/super/settings', [
            'pro_monthly_price' => 149000, 'pro_yearly_price' => 1490000,
            'payment_instructions' => 'BCA 123', 'contact_whatsapp' => '081200000000',
        ])->assertOk()->assertJsonPath('pro_monthly_price', 149000);

        Sanctum::actingAs(User::where('email', 'b@example.com')->first());
        $this->getJson('/api/subscription')
            ->assertOk()
            ->assertJsonPath('plan', 'free')
            ->assertJsonPath('prices.monthly', 149000)
            ->assertJsonPath('payment_instructions', 'BCA 123');
    }
}
