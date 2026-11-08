<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesTenant;
use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use App\Models\SubscriptionPayment;
use App\Services\Subscriptions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    use ResolvesTenant;

    // Halaman "Langganan" milik pemilik tenant: paket aktif, harga, cara bayar, riwayat.
    public function __invoke(Request $request, Subscriptions $subscriptions): JsonResponse
    {
        $tenant = $this->tenant($request);
        $settings = PlatformSetting::allValues();

        return response()->json([
            'plan' => $tenant->plan(),
            'pro_until' => $tenant->pro_until?->toIso8601String(),
            'features' => $tenant->features(),
            'prices' => $subscriptions->prices(),
            'payment_instructions' => $settings['payment_instructions'],
            'contact_whatsapp' => $settings['contact_whatsapp'],
            'payments' => $tenant->payments()->limit(24)->get()->map(fn (SubscriptionPayment $p) => [
                'id' => $p->id,
                'period' => $p->period,
                'amount' => $p->amount,
                'paid_at' => $p->paid_at->toDateString(),
                'period_end' => $p->period_end->toIso8601String(),
            ]),
        ]);
    }
}
