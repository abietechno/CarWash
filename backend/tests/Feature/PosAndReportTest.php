<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Services\BookingService;
use App\Services\TenantProvisioner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PosAndReportTest extends TestCase
{
    use RefreshDatabase;

    private function tenant(string $subdomain = 'putrajayawash', string $email = 'owner@example.com'): array
    {
        return app(TenantProvisioner::class)->provision([
            'business_name' => 'Putra Jaya Wash',
            'subdomain' => $subdomain,
            'owner_name' => 'Owner',
            'email' => $email,
            'phone' => '081234567890',
            'password' => 'password123',
        ]);
    }

    private function booking(Tenant $tenant, array $overrides = [])
    {
        return app(BookingService::class)->create($tenant, $overrides + [
            'customer_name' => 'Budi Santoso',
            'phone' => '081211112222',
            'vehicle_type' => 'large',
            'package_id' => $tenant->packages()->first()->id,
        ], 'walk_in');
    }

    public function test_sale_from_queue_charges_booking_price_and_marks_it_paid(): void
    {
        ['tenant' => $tenant, 'user' => $user] = $this->tenant();
        $booking = $this->booking($tenant);
        $addon = $tenant->addons()->first();
        Sanctum::actingAs($user);

        $this->getJson('/api/pos/catalog')->assertOk()->assertJsonCount(1, 'unpaid')->assertJsonPath('unpaid.0.ticket', 'A-001');

        $total = $booking->price + $addon->price;
        $response = $this->postJson('/api/pos/sales', [
            'booking_id' => $booking->id,
            'items' => [['type' => 'addon', 'id' => $addon->id, 'qty' => 1]],
            'payment_method' => 'cash',
            'paid_amount' => $total + 5000,
        ])->assertCreated();

        $response->assertJsonPath('amount', $total)
            ->assertJsonPath('change', 5000)
            ->assertJsonPath('customer_name', 'Budi Santoso')
            ->assertJsonPath('items.0.unit_price', $booking->price)
            ->assertJsonCount(2, 'items');

        $date = str_replace('-', '', now(config('saas.timezone'))->toDateString());
        $this->assertSame("TRX-$date-001", $response->json('number'));

        $this->getJson('/api/pos/catalog')->assertJsonCount(0, 'unpaid');
        $this->getJson('/api/bookings')->assertJsonPath('waiting.0.transaction_id', $response->json('id'));
    }

    public function test_booking_cannot_be_paid_twice_until_the_sale_is_voided(): void
    {
        ['tenant' => $tenant, 'user' => $user] = $this->tenant();
        $booking = $this->booking($tenant);
        Sanctum::actingAs($user);
        $pay = fn () => $this->postJson('/api/pos/sales', ['booking_id' => $booking->id, 'payment_method' => 'qris']);

        $id = $pay()->assertCreated()->json('id');
        $pay()->assertUnprocessable()->assertJsonValidationErrors('booking_id');

        // Antrian yang sudah dibayar tidak bisa dibatalkan sebelum transaksinya dibatalkan.
        $this->patchJson("/api/bookings/{$booking->id}/status", ['status' => 'cancelled'])
            ->assertUnprocessable()->assertJsonValidationErrors('status');

        $this->postJson("/api/transactions/$id/void", [])->assertUnprocessable()->assertJsonValidationErrors('reason');
        $this->postJson("/api/transactions/$id/void", ['reason' => 'Salah input'])->assertOk()->assertJsonPath('void_reason', 'Salah input');
        $this->postJson("/api/transactions/$id/void", ['reason' => 'Lagi'])->assertUnprocessable();

        $pay()->assertCreated();
    }

    public function test_direct_sale_uses_server_prices_with_vehicle_multiplier_and_discount(): void
    {
        ['tenant' => $tenant, 'user' => $user] = $this->tenant();
        $package = $tenant->packages()->first();
        $multiplier = $tenant->vehicleTypes()->where('code', 'large')->value('price_multiplier');
        $unit = (int) round($package->price * $multiplier);
        Sanctum::actingAs($user);

        $this->postJson('/api/pos/sales', [
            'vehicle_type' => 'large',
            // Harga dari klien untuk paket diabaikan.
            'items' => [
                ['type' => 'package', 'id' => $package->id, 'qty' => 2, 'price' => 1],
                ['type' => 'custom', 'name' => 'Parfum mobil', 'price' => 25000, 'qty' => 1],
            ],
            'discount' => 5000,
            'payment_method' => 'transfer',
        ])->assertCreated()
            ->assertJsonPath('subtotal', $unit * 2 + 25000)
            ->assertJsonPath('amount', $unit * 2 + 25000 - 5000)
            ->assertJsonPath('paid_amount', null)
            ->assertJsonPath('change', 0);
    }

    public function test_invalid_sales_are_rejected(): void
    {
        ['tenant' => $tenant, 'user' => $user] = $this->tenant();
        $package = $tenant->packages()->first();
        Sanctum::actingAs($user);
        $item = ['type' => 'custom', 'name' => 'Parfum', 'price' => 10000, 'qty' => 1];

        $this->postJson('/api/pos/sales', ['payment_method' => 'cash'])->assertUnprocessable()->assertJsonValidationErrors('items');
        $this->postJson('/api/pos/sales', ['items' => [$item], 'payment_method' => 'bitcoin'])->assertUnprocessable()->assertJsonValidationErrors('payment_method');
        $this->postJson('/api/pos/sales', ['items' => [$item], 'payment_method' => 'cash', 'paid_amount' => 5000])->assertUnprocessable()->assertJsonValidationErrors('paid_amount');
        $this->postJson('/api/pos/sales', ['items' => [$item], 'discount' => 20000, 'payment_method' => 'qris'])->assertUnprocessable()->assertJsonValidationErrors('discount');
        $this->postJson('/api/pos/sales', ['items' => [['type' => 'package', 'id' => $package->id, 'qty' => 1]], 'payment_method' => 'qris'])
            ->assertUnprocessable()->assertJsonValidationErrors('vehicle_type');
        $this->postJson('/api/pos/sales', ['items' => [['type' => 'custom', 'qty' => 1]], 'payment_method' => 'qris'])
            ->assertUnprocessable()->assertJsonValidationErrors(['items.0.name', 'items.0.price']);
    }

    public function test_tenants_cannot_touch_each_others_data(): void
    {
        ['tenant' => $mine, 'user' => $me] = $this->tenant();
        ['tenant' => $other, 'user' => $them] = $this->tenant('sinarwash', 'other@example.com');
        $theirBooking = $this->booking($other);

        Sanctum::actingAs($them);
        $theirSale = $this->postJson('/api/pos/sales', ['booking_id' => $theirBooking->id, 'payment_method' => 'qris'])->json('id');

        Sanctum::actingAs($me);
        $this->postJson('/api/pos/sales', ['booking_id' => $theirBooking->id, 'payment_method' => 'qris'])
            ->assertUnprocessable()->assertJsonValidationErrors('booking_id');
        $this->postJson('/api/pos/sales', ['vehicle_type' => 'large', 'items' => [['type' => 'package', 'id' => $other->packages()->first()->id, 'qty' => 1]], 'payment_method' => 'qris'])
            ->assertUnprocessable()->assertJsonValidationErrors('items');
        $this->getJson("/api/transactions/$theirSale")->assertNotFound();
        $this->postJson("/api/transactions/$theirSale/void", ['reason' => 'x'])->assertNotFound();
        $this->getJson('/api/transactions')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/reports/summary')->assertJsonPath('income', 0);
        $this->assertSame(0, $mine->transactions()->count());
    }

    public function test_report_totals_exclude_voided_and_group_by_business_date(): void
    {
        ['tenant' => $tenant, 'user' => $user] = $this->tenant();
        Sanctum::actingAs($user);
        // 18:00 UTC = 01:00 WIB keesokan harinya.
        $this->travelTo('2026-11-08 18:00:00');

        $sale = fn (int $price, string $method) => $this->postJson('/api/pos/sales', [
            'items' => [['type' => 'custom', 'name' => 'Cuci motor', 'price' => $price, 'qty' => 1]],
            'payment_method' => $method,
        ])->assertCreated();

        $sale(100000, 'cash')->assertJsonPath('business_date', '2026-11-09');
        $sale(50000, 'qris');
        $voided = $sale(70000, 'qris')->json('id');
        $this->postJson("/api/transactions/$voided/void", ['reason' => 'Batal'])->assertOk();

        // Hari ini menurut WIB diterima walau di UTC masih kemarin; besok ditolak.
        $this->postJson('/api/transactions/expenses', ['category' => 'supplies', 'amount' => 30000, 'payment_method' => 'cash', 'business_date' => '2026-11-09'])->assertCreated();
        $this->postJson('/api/transactions/expenses', ['category' => 'salary', 'amount' => 20000, 'payment_method' => 'transfer', 'business_date' => '2026-11-07'])->assertCreated();
        $this->postJson('/api/transactions/expenses', ['category' => 'rent', 'amount' => 1, 'payment_method' => 'cash', 'business_date' => '2026-11-10'])
            ->assertUnprocessable()->assertJsonValidationErrors('business_date');
        $this->postJson('/api/transactions/expenses', ['category' => 'other', 'amount' => 1, 'payment_method' => 'cash'])
            ->assertUnprocessable()->assertJsonValidationErrors('description');

        $report = $this->getJson('/api/reports/summary?from=2026-11-07&to=2026-11-09')->assertOk();
        $report->assertJsonPath('income', 150000)
            ->assertJsonPath('expense', 50000)
            ->assertJsonPath('net', 100000)
            ->assertJsonPath('sales_count', 2)
            ->assertJsonPath('average_sale', 75000)
            ->assertJsonPath('voided_count', 1)
            ->assertJsonPath('granularity', 'day')
            ->assertJsonPath('series', [
                ['date' => '2026-11-07', 'income' => 0, 'expense' => 20000],
                ['date' => '2026-11-08', 'income' => 0, 'expense' => 0],
                ['date' => '2026-11-09', 'income' => 150000, 'expense' => 30000],
            ])
            ->assertJsonPath('by_method.0', ['key' => 'cash', 'total' => 100000, 'count' => 1])
            ->assertJsonPath('by_category.0.key', 'supplies')
            ->assertJsonPath('top_items.0', ['name' => 'Cuci motor', 'qty' => 2, 'total' => 150000]);

        $this->getJson('/api/reports/summary?from=2026-01-01&to=2026-11-09')->assertJsonPath('granularity', 'month')->assertJsonCount(11, 'series');
        $this->getJson('/api/reports/summary?from=2026-11-09&to=2026-11-07')->assertUnprocessable();
        $this->getJson('/api/reports/summary?from=2024-01-01&to=2026-11-09')->assertUnprocessable();

        $list = $this->getJson('/api/transactions?from=2026-11-07&to=2026-11-09&type=expense')->assertOk();
        $list->assertJsonCount(2, 'data')->assertJsonPath('data.0.number', 'OUT-20261109-004')->assertJsonPath('meta.total', 2);
        $this->getJson('/api/transactions?from=2026-11-09&to=2026-11-09&search=motor')->assertJsonPath('meta.total', 3);
    }

    public function test_top_items_merge_sales_from_different_queue_tickets(): void
    {
        ['tenant' => $tenant, 'user' => $user] = $this->tenant();
        Sanctum::actingAs($user);

        foreach (['A', 'B'] as $name) {
            $booking = $this->booking($tenant, ['customer_name' => "Pelanggan $name", 'phone' => null]);
            $this->postJson('/api/pos/sales', ['booking_id' => $booking->id, 'payment_method' => 'qris'])
                ->assertCreated()
                ->assertJsonPath('items.0.name', $booking->package_name)
                ->assertJsonPath('description', "Antrian {$booking->ticket()}");
        }

        $this->getJson('/api/reports/summary')
            ->assertJsonCount(1, 'top_items')
            ->assertJsonPath('top_items.0.qty', 2);
    }

    public function test_public_board_never_exposes_payment_data(): void
    {
        ['tenant' => $tenant, 'user' => $user] = $this->tenant();
        $tenant->update([
            'status' => Tenant::STATUS_PUBLISHED, 'pro_until' => now()->addMonth(), 'address' => 'Jl. A', 'city' => 'Surabaya',
        ]);
        $booking = $this->booking($tenant);
        Sanctum::actingAs($user);
        $this->postJson('/api/pos/sales', ['booking_id' => $booking->id, 'payment_method' => 'qris'])->assertCreated();

        $this->getJson('http://putrajayawash.localhost/api/public/queue')
            ->assertOk()
            ->assertJsonMissingPath('waiting.0.transaction_id')
            ->assertJsonMissingPath('waiting.0.price');
    }

    public function test_csv_export_lists_transactions_and_neutralises_formulas(): void
    {
        ['user' => $user] = $this->tenant();
        Sanctum::actingAs($user);

        $this->postJson('/api/pos/sales', [
            'customer_name' => '=HYPERLINK("http://evil")',
            'items' => [['type' => 'custom', 'name' => 'Parfum', 'price' => 10000, 'qty' => 2]],
            'payment_method' => 'cash',
        ])->assertCreated();

        $response = $this->get('/api/reports/export', ['Accept' => 'application/json'])->assertOk();
        $csv = $response->streamedContent();

        $this->assertStringStartsWith("\xEF\xBB\xBFTanggal;Jam;Nomor", $csv);
        $this->assertStringContainsString('2x Parfum', $csv);
        $this->assertStringContainsString("'=HYPERLINK", $csv);
        $this->assertStringContainsString('20000;Sah', str_replace('"', '', $csv));
    }
}
