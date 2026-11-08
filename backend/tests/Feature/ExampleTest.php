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
}
