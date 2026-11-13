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

    public function test_landing_page_embeds_the_promo_video_without_downloading_it_up_front(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('src="/video/washwuzz-promo.mp4"', false)
            ->assertSee('preload="none"', false);

        $this->assertFileExists(public_path('video/washwuzz-promo.mp4'));
        $this->assertFileExists(public_path('video/washwuzz-promo-poster.jpg'));
    }

    public function test_each_landing_language_has_its_own_link_preview_image(): void
    {
        foreach (['/' => 'id', '/ms' => 'ms', '/en' => 'en'] as $path => $locale) {
            $this->get($path)
                ->assertOk()
                ->assertSee('<meta property="og:image" content="'.url("og/washwuzz-$locale.png").'">', false)
                ->assertSee('<meta name="twitter:card" content="summary_large_image">', false)
                ->assertSee('<title>WashWuzz: ', false);

            $this->assertFileExists(public_path("og/washwuzz-$locale.png"));
        }
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
