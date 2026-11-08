<?php

namespace App\Services;

use App\Models\PlatformSetting;
use App\Models\SubscriptionPayment;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class Subscriptions
{
    /** @return array{monthly: int, yearly: int} */
    public function prices(): array
    {
        $settings = PlatformSetting::allValues();

        return ['monthly' => $settings['pro_monthly_price'], 'yearly' => $settings['pro_yearly_price']];
    }

    /**
     * Catat pembayaran manual dan perpanjang Pro: dimulai dari akhir masa aktif sekarang (atau hari ini kalau sudah habis).
     *
     * @param  array{period: string, amount?: ?int, method: string, reference?: ?string, note?: ?string, paid_at?: ?string}  $data
     */
    public function recordPayment(Tenant $tenant, array $data, User $recorder): SubscriptionPayment
    {
        return DB::transaction(function () use ($tenant, $data, $recorder) {
            $start = $tenant->isPro() ? $tenant->pro_until->copy() : now();
            $end = $start->copy()->addMonthsNoOverflow(SubscriptionPayment::PERIODS[$data['period']]);

            $payment = $tenant->payments()->create([
                'period' => $data['period'],
                'amount' => $data['amount'] ?? $this->prices()[$data['period']],
                'method' => $data['method'],
                'reference' => $data['reference'] ?? null,
                'note' => $data['note'] ?? null,
                'paid_at' => $data['paid_at'] ?? now(config('saas.timezone'))->toDateString(),
                'period_start' => $start,
                'period_end' => $end,
                'recorded_by' => $recorder->id,
            ]);

            $tenant->update(['pro_until' => $end]);

            return $payment;
        });
    }

    // Perkiraan pendapatan bulanan berulang dari tenant Pro aktif (pembayaran terakhir dinormalisasi per bulan).
    public function estimatedMrr(): int
    {
        $total = 0;
        $monthly = $this->prices()['monthly'];
        $tenants = Tenant::where('pro_until', '>', now())->with(['payments' => fn ($q) => $q->limit(1)])->get();

        foreach ($tenants as $tenant) {
            $last = $tenant->payments->first();
            $total += $last ? intdiv($last->amount, SubscriptionPayment::PERIODS[$last->period]) : $monthly;
        }

        return $total;
    }
}
