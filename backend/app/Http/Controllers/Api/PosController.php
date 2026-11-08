<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesTenant;
use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Booking;
use App\Models\ServiceAddon;
use App\Models\ServicePackage;
use App\Models\Transaction;
use App\Services\BookingService;
use App\Services\Cashier;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PosController extends Controller
{
    use ResolvesTenant;

    // Data halaman kasir: item yang bisa dijual dan antrian yang belum dibayar.
    public function catalog(Request $request, BookingService $bookings): JsonResponse
    {
        $tenant = $this->tenant($request);
        // Termasuk kemarin: pelanggan yang selesai lewat tengah malam tetap bisa ditagih.
        $since = CarbonImmutable::parse($bookings->today())->subDay()->toDateString();

        $unpaid = $tenant->bookings()
            ->where('queue_date', '>=', $since)
            ->where('status', '!=', Booking::CANCELLED)
            ->whereDoesntHave('payments', fn ($query) => $query->active())
            ->orderByDesc('queue_date')
            ->orderBy('queue_number')
            ->get();

        return response()->json([
            'packages' => $tenant->packages()->where('is_active', true)->get()
                ->map(fn (ServicePackage $p) => $p->only(['id', 'name', 'category', 'price'])),
            'addons' => $tenant->addons()->where('is_active', true)->get()
                ->map(fn (ServiceAddon $a) => $a->only(['id', 'name', 'category', 'price'])),
            'vehicle_types' => $tenant->vehicleTypes()->get(['code', 'name', 'price_multiplier']),
            'unpaid' => $unpaid->map(fn (Booking $b) => [
                'id' => $b->id,
                'ticket' => $b->ticket(),
                'customer_name' => $b->customer_name,
                'phone' => $b->phone,
                'plate' => $b->plate,
                'vehicle_type' => $b->vehicle_type,
                'vehicle_color' => $b->vehicle_color,
                'package_name' => $b->package_name,
                'price' => $b->price,
                'status' => $b->status,
                'queue_date' => $b->queue_date,
            ]),
        ]);
    }

    public function sale(Request $request, Cashier $cashier): JsonResponse
    {
        $tenant = $this->tenant($request);

        $data = $request->validate([
            'booking_id' => ['nullable', 'integer', Rule::exists('bookings', 'id')->where('tenant_id', $tenant->id)],
            'vehicle_type' => ['nullable', Rule::in($tenant->vehicleTypes()->pluck('code')->all())],
            'customer_name' => ['nullable', 'string', 'max:100'],
            'customer_phone' => ['nullable', 'string', 'regex:/^[0-9+\-\s]{8,20}$/'],
            'items' => ['nullable', 'array', 'max:50'],
            'items.*.type' => ['required', Rule::in(['package', 'addon', 'custom'])],
            'items.*.id' => ['required_unless:items.*.type,custom', 'nullable', 'integer'],
            'items.*.name' => ['required_if:items.*.type,custom', 'nullable', 'string', 'max:100'],
            'items.*.price' => ['required_if:items.*.type,custom', 'nullable', 'integer', 'min:0', 'max:50000000'],
            'items.*.qty' => ['required', 'integer', 'between:1,99'],
            'discount' => ['nullable', 'integer', 'min:0'],
            'payment_method' => ['required', Rule::in(Transaction::PAYMENT_METHODS)],
            'paid_amount' => ['nullable', 'integer', 'min:0', 'max:2000000000'],
        ], [
            'customer_phone.regex' => 'Nomor HP tidak valid.',
            'booking_id.exists' => 'Antrian tidak ditemukan.',
        ]);

        $transaction = $cashier->recordSale($tenant, $request->user(), $data);

        return (new TransactionResource($transaction))->response()->setStatusCode(201);
    }
}
