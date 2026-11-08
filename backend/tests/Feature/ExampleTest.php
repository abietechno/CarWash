<?php

namespace Tests\Feature;

use App\Models\PlatformSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_landing_page_shows_pro_price_from_settings(): void
    {
        PlatformSetting::write(['pro_monthly_price' => 149000, 'pro_yearly_price' => 1490000]);

        $this->get('/')
            ->assertOk()
            ->assertSee('Daftar Gratis')
            ->assertSee('Rp149rb')
            ->assertSee('Rp1.490.000');
    }

    public function test_landing_page_uses_washwuzz_brand_and_whatsapp_button(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('<title>WashWuzz', false)
            ->assertSee('https://wa.me/6281233741899', false)
            ->assertSee('ABIE TECHNOLOGY')
            ->assertDontSee('CarWash Cloud');
    }
}
