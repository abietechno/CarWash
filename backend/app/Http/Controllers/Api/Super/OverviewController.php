<?php

namespace App\Http\Controllers\Api\Super;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\SubscriptionPayment;
use App\Models\Tenant;
use App\Services\Subscriptions;
use Illuminate\Http\JsonResponse;

class OverviewController extends Controller
{
    // Ringkasan platform untuk halaman depan super-admin.
    public function __invoke(Subscriptions $subscriptions): JsonResponse
    {
        $now = now();
        $soon = $now->copy()->addDays(7);
        $today = $now->copy()->setTimezone(config('saas.timezone'))->toDateString();

        $brief = fn (Tenant $t) => [
            'id' => $t->id,
            'name' => $t->name,
            'subdomain' => $t->subdomain,
            'status' => $t->status,
            'plan' => $t->plan(),
            'pro_until' => $t->pro_until?->toIso8601String(),
            'created_at' => $t->created_at->toIso8601String(),
        ];

        return response()->json([
            'tenants' => [
                'total' => Tenant::count(),
                'published' => Tenant::where('status', Tenant::STATUS_PUBLISHED)->count(),
                'draft' => Tenant::where('status', Tenant::STATUS_DRAFT)->count(),
                'suspended' => Tenant::where('status', Tenant::STATUS_SUSPENDED)->count(),
                'new_this_week' => Tenant::where('created_at', '>=', $now->copy()->subDays(7))->count(),
            ],
            'plans' => [
                'pro' => Tenant::where('pro_until', '>', $now)->count(),
                'free' => Tenant::where(fn ($q) => $q->whereNull('pro_until')->orWhere('pro_until', '<=', $now))->count(),
                'expiring_soon' => Tenant::whereBetween('pro_until', [$now, $soon])->count(),
            ],
            'revenue' => [
                'this_month' => (int) SubscriptionPayment::where('paid_at', '>=', $now->copy()->setTimezone(config('saas.timezone'))->startOfMonth()->toDateString())->sum('amount'),
                'estimated_mrr' => $subscriptions->estimatedMrr(),
            ],
            'bookings_today' => Booking::where('queue_date', $today)->where('status', '!=', Booking::CANCELLED)->count(),
            'recent_signups' => Tenant::latest()->limit(5)->get()->map($brief),
            'expiring' => Tenant::whereBetween('pro_until', [$now, $soon])->orderBy('pro_until')->limit(5)->get()->map($brief),
        ]);
    }
}
