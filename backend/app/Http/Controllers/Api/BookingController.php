<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesTenant;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\BookingService;
use App\Services\QueueBoard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    use ResolvesTenant;

    // Papan antrian hari ini versi admin (nama lengkap, HP, riwayat).
    public function index(Request $request, QueueBoard $board): JsonResponse
    {
        return response()->json($board->build($this->tenant($request), forAdmin: true));
    }

    // Pelanggan datang langsung (walk-in), dicatat dari dashboard.
    public function store(Request $request, BookingService $bookings, QueueBoard $board): JsonResponse
    {
        $tenant = $this->tenant($request);
        $data = $request->validate($bookings->rules($tenant, phoneRequired: false), [
            'phone.regex' => __('Nomor HP tidak valid.'),
            'package_id.exists' => __('Paket tidak tersedia.'),
        ]);

        $bookings->create($tenant, $data, 'walk_in');

        return response()->json($board->build($tenant, forAdmin: true), 201);
    }

    public function updateStatus(Request $request, int $booking, BookingService $bookings, QueueBoard $board): JsonResponse
    {
        $tenant = $this->tenant($request);
        $model = $tenant->bookings()->findOrFail($booking);

        $data = $request->validate([
            'status' => ['required', Rule::in(Booking::STATUSES)],
            'bay' => ['nullable', 'integer', 'between:1,50'],
        ]);

        $bookings->transition($model, $data['status'], $data['bay'] ?? null);

        return response()->json($board->build($tenant, forAdmin: true));
    }
}
