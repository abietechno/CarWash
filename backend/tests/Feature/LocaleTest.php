<?php

namespace Tests\Feature;

use App\Models\PlatformSetting;
use App\Models\Tenant;
use App\Services\TenantProvisioner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LocaleTest extends TestCase
{
    use RefreshDatabase;

    private function provision(string $subdomain = 'putrajayawash'): array
    {
        return app(TenantProvisioner::class)->provision([
            'business_name' => 'Putra Jaya Wash',
            'subdomain' => $subdomain,
            'owner_name' => 'Owner',
            'email' => "{$subdomain}@example.com",
            'phone' => '081234567890',
            'password' => 'password123',
        ]);
    }

    public function test_landing_page_is_served_in_three_languages(): void
    {
        PlatformSetting::write(['pro_monthly_price' => 149000, 'pro_yearly_price' => 1490000]);

        $this->get('/')->assertOk()
            ->assertSee('<html lang="id">', false)
            ->assertSee('Daftar Gratis')
            ->assertSee('Rp1.490.000')
            ->assertSee('hreflang="ms"', false)
            ->assertSee('/login?lang=id', false);

        $this->get('/ms')->assertOk()
            ->assertSee('<html lang="ms">', false)
            ->assertSee('Daftar Percuma')
            ->assertSee('Rp149k')
            ->assertSee('Rp1,490,000')
            ->assertSee('/login?lang=ms', false)
            ->assertDontSee('Daftar Gratis');

        $this->get('/en')->assertOk()
            ->assertSee('<html lang="en">', false)
            ->assertSee('Sign Up Free')
            ->assertSee('"locale":"en"', false)
            ->assertDontSee('Daftar Gratis');

        $this->get('/fr')->assertNotFound();
    }

    public function test_api_messages_follow_the_x_locale_header(): void
    {
        $this->provision();
        $login = ['email' => 'putrajayawash@example.com', 'password' => 'wrong-password'];

        $this->postJson('/api/auth/login', $login)->assertJsonPath('errors.email.0', 'Email atau password salah.');
        $this->postJson('/api/auth/login', $login, ['X-Locale' => 'en'])->assertJsonPath('errors.email.0', 'Incorrect email or password.');
        $this->postJson('/api/auth/login', $login, ['X-Locale' => 'ms'])->assertJsonPath('errors.email.0', 'E-mel atau kata laluan salah.');
        // Bahasa tidak dikenal jatuh ke bahasa bawaan dan tidak terbawa dari request sebelumnya.
        $this->postJson('/api/auth/login', $login, ['X-Locale' => 'fr'])->assertJsonPath('errors.email.0', 'Email atau password salah.');

        $this->postJson('/api/register', [], ['X-Locale' => 'ms'])
            ->assertJsonPath('errors.business_name.0', 'Nama perniagaan wajib diisi.');
        $this->postJson('/api/register', [], ['X-Locale' => 'en'])
            ->assertJsonPath('errors.business_name.0', 'The business name field is required.');
    }

    public function test_registration_language_sets_starter_data_and_site_language(): void
    {
        ['tenant' => $default] = $this->provision();
        $this->assertSame('id', $default->locale);
        $this->assertSame('Cuci Hidrolik Snow Foam', $default->packages()->first()->name);

        $response = $this->postJson('/api/register', [
            'business_name' => 'Kilat Wash',
            'subdomain' => 'kilatwash',
            'owner_name' => 'Aminah',
            'email' => 'aminah@example.com',
            'phone' => '0123456789',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ], ['X-Locale' => 'ms'])->assertCreated();

        $this->assertStringContainsString('lang=ms', $response->json('login_url'));

        $tenant = Tenant::where('subdomain', 'kilatwash')->firstOrFail();
        $this->assertSame('ms', $tenant->locale);
        $this->assertSame('Cucian Hidraulik Snow Foam', $tenant->packages()->first()->name);
        $this->assertSame('Skuter Automatik', $tenant->vehicleTypes()->where('code', 'motor_matic')->value('name'));
    }

    public function test_owner_sets_the_default_language_of_the_public_site(): void
    {
        ['tenant' => $tenant, 'user' => $user] = $this->provision();
        $tenant->update(['address' => 'Jl. Contoh 1', 'city' => 'Surabaya', 'status' => Tenant::STATUS_PUBLISHED]);
        Sanctum::actingAs($user);

        $profile = $this->getJson('/api/tenant')->assertJsonPath('locale', 'id')->json();
        $this->putJson('/api/tenant', ['locale' => 'en'] + $profile)->assertOk()->assertJsonPath('locale', 'en');
        $this->putJson('/api/tenant', ['locale' => 'fr'] + $profile)->assertJsonValidationErrors('locale');

        $this->getJson('http://putrajayawash.localhost/api/public/site')->assertJsonPath('tenant.locale', 'en');
    }

    public function test_publish_issues_and_csv_export_are_translated(): void
    {
        ['tenant' => $tenant, 'user' => $user] = $this->provision();
        $tenant->update(['address' => null]);
        Sanctum::actingAs($user);

        $this->getJson('/api/tenant', ['X-Locale' => 'en'])->assertJsonFragment(['Address is missing']);

        $this->postJson('/api/pos/sales', [
            'items' => [['type' => 'custom', 'name' => 'Parfum', 'price' => 10000, 'qty' => 1]],
            'payment_method' => 'cash',
        ])->assertCreated();

        $csv = $this->get('/api/reports/export', ['Accept' => 'application/json', 'X-Locale' => 'en'])->streamedContent();
        $this->assertStringStartsWith("\xEF\xBB\xBFDate,Time,Number,Type", $csv);
        $this->assertStringContainsString('Income,Sale', $csv);
    }
}
