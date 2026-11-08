<?php

namespace App\Http\Controllers\Api\Super;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\SubscriptionPayment;
use App\Models\Tenant;
use App\Services\Subscriptions;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class TenantController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in([Tenant::STATUS_DRAFT, Tenant::STATUS_PUBLISHED, Tenant::STATUS_SUSPENDED])],
            'plan' => ['nullable', Rule::in(['pro', 'free', 'expiring'])],
        ]);
        $now = now();

        $tenants = Tenant::query()
            ->with(['users' => fn ($q) => $q->where('role', 'owner')])
            ->withCount(['packages as active_packages' => fn ($q) => $q->where('is_active', true)])
            ->withCount(['bookings as bookings_this_month' => fn ($q) => $q->where('queue_date', '>=', $this->localDate()->startOfMonth()->toDateString())])
            ->when($filters['search'] ?? null, fn (Builder $q, string $s) => $q->where(fn (Builder $q) => $q
                ->where('name', 'like', "%$s%")
                ->orWhere('subdomain', 'like', "%$s%")
                ->orWhereHas('users', fn (Builder $q) => $q->where('email', 'like', "%$s%"))))
            ->when($filters['status'] ?? null, fn (Builder $q, string $status) => $q->where('status', $status))
            ->when(($filters['plan'] ?? null) === 'pro', fn (Builder $q) => $q->where('pro_until', '>', $now))
            ->when(($filters['plan'] ?? null) === 'free', fn (Builder $q) => $q->where(fn (Builder $q) => $q->whereNull('pro_until')->orWhere('pro_until', '<=', $now)))
            ->when(($filters['plan'] ?? null) === 'expiring', fn (Builder $q) => $q->whereBetween('pro_until', [$now, $now->copy()->addDays(7)]))
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $tenants->getCollection()->map(fn (Tenant $t) => $this->summary($t)),
            'meta' => ['current_page' => $tenants->currentPage(), 'last_page' => $tenants->lastPage(), 'total' => $tenants->total()],
        ]);
    }

    public function show(int $tenant, Subscriptions $subscriptions): JsonResponse
    {
        return response()->json($this->detail(Tenant::findOrFail($tenant), $subscriptions));
    }

    public function suspend(Request $request, int $tenant, Subscriptions $subscriptions): JsonResponse
    {
        $model = Tenant::findOrFail($tenant);
        $data = $request->validate(['reason' => ['nullable', 'string', 'max:255']]);

        $model->update(['status' => Tenant::STATUS_SUSPENDED, 'suspended_at' => now()]);
        ActivityLog::record($request, 'tenant.suspended', $model, ['reason' => $data['reason'] ?? null]);

        return response()->json($this->detail($model, $subscriptions));
    }

    public function activate(Request $request, int $tenant, Subscriptions $subscriptions): JsonResponse
    {
        $model = Tenant::findOrFail($tenant);

        // Kembali online kalau sebelumnya sudah pernah dipublikasikan, selain itu draft.
        $model->update([
            'status' => $model->published_at ? Tenant::STATUS_PUBLISHED : Tenant::STATUS_DRAFT,
            'suspended_at' => null,
        ]);
        ActivityLog::record($request, 'tenant.activated', $model);

        return response()->json($this->detail($model, $subscriptions));
    }

    // Koreksi manual masa aktif Pro (mis. salah catat, kompensasi). null = jadikan Gratis sekarang.
    public function updatePlan(Request $request, int $tenant, Subscriptions $subscriptions): JsonResponse
    {
        $model = Tenant::findOrFail($tenant);
        $data = $request->validate(['pro_until' => ['nullable', 'date'], 'note' => ['nullable', 'string', 'max:255']]);

        $before = $model->pro_until?->toIso8601String();
        // Tanggal dari form = akhir hari itu menurut zona waktu bisnis.
        $model->update(['pro_until' => isset($data['pro_until']) ? Carbon::parse($data['pro_until'], config('saas.timezone'))->endOfDay() : null]);
        ActivityLog::record($request, 'plan.updated', $model, [
            'from' => $before,
            'to' => $model->pro_until?->toIso8601String(),
            'note' => $data['note'] ?? null,
        ]);

        return response()->json($this->detail($model, $subscriptions));
    }

    public function recordPayment(Request $request, int $tenant, Subscriptions $subscriptions): JsonResponse
    {
        $model = Tenant::findOrFail($tenant);
        $data = $request->validate([
            'period' => ['required', Rule::in(array_keys(SubscriptionPayment::PERIODS))],
            'amount' => ['nullable', 'integer', 'min:0', 'max:100000000'],
            'method' => ['required', Rule::in(SubscriptionPayment::METHODS)],
            'reference' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:255'],
            'paid_at' => ['nullable', 'date'],
        ]);

        $payment = $subscriptions->recordPayment($model, $data, $request->user());
        ActivityLog::record($request, 'payment.recorded', $model, [
            'amount' => $payment->amount,
            'period' => $payment->period,
            'until' => $payment->period_end->toIso8601String(),
        ]);

        return response()->json($this->detail($model->fresh(), $subscriptions), 201);
    }

    // Masuk ke dashboard tenant untuk membantu (token sementara 2 jam, tercatat di log).
    public function impersonate(Request $request, int $tenant): JsonResponse
    {
        $model = Tenant::findOrFail($tenant);
        $owner = $model->users()->where('role', 'owner')->firstOrFail();

        $token = $owner->createToken('impersonate:'.$request->user()->id, ['*'], now()->addHours(2))->plainTextToken;
        ActivityLog::record($request, 'tenant.impersonated', $model, ['owner' => $owner->email]);

        return response()->json(['token' => $token]);
    }

    private function localDate(): Carbon
    {
        return now(config('saas.timezone'));
    }

    private function summary(Tenant $t): array
    {
        $owner = $t->users->first();

        return [
            'id' => $t->id,
            'name' => $t->name,
            'subdomain' => $t->subdomain,
            'url' => $t->url(),
            'status' => $t->status,
            'plan' => $t->plan(),
            'pro_until' => $t->pro_until?->toIso8601String(),
            'city' => $t->city,
            'owner' => $owner ? ['name' => $owner->name, 'email' => $owner->email, 'phone' => $owner->phone] : null,
            'active_packages' => $t->active_packages ?? 0,
            'bookings_this_month' => $t->bookings_this_month ?? 0,
            'created_at' => $t->created_at->toIso8601String(),
        ];
    }

    private function detail(Tenant $t, Subscriptions $subscriptions): array
    {
        $t->loadMissing(['users' => fn ($q) => $q->where('role', 'owner')]);
        $t->loadCount([
            'packages as active_packages' => fn ($q) => $q->where('is_active', true),
            'bookings as bookings_this_month' => fn ($q) => $q->where('queue_date', '>=', $this->localDate()->startOfMonth()->toDateString()),
        ]);

        return $this->summary($t) + [
            'whatsapp' => $t->whatsapp,
            'address' => $t->address,
            'published_at' => $t->published_at?->toIso8601String(),
            'suspended_at' => $t->suspended_at?->toIso8601String(),
            'bookings_today' => $t->bookings()->where('queue_date', $this->localDate()->toDateString())->where('status', '!=', Booking::CANCELLED)->count(),
            'features' => $t->features(),
            'prices' => $subscriptions->prices(),
            'payments' => $t->payments()->with('recorder:id,name')->limit(50)->get()->map(fn (SubscriptionPayment $p) => [
                'id' => $p->id,
                'period' => $p->period,
                'amount' => $p->amount,
                'method' => $p->method,
                'reference' => $p->reference,
                'note' => $p->note,
                'paid_at' => $p->paid_at->toDateString(),
                'period_start' => $p->period_start->toIso8601String(),
                'period_end' => $p->period_end->toIso8601String(),
                'recorded_by' => $p->recorder?->name,
            ]),
            'activity' => ActivityLog::where('tenant_id', $t->id)->with('user:id,name')->latest('created_at')->limit(30)->get()->map(fn (ActivityLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'meta' => $log->meta,
                'user' => $log->user?->name,
                'created_at' => $log->created_at->toIso8601String(),
            ]),
        ];
    }
}
