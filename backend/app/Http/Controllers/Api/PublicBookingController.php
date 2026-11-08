<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesPublicTenant;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\BookingService;
use App\Services\QueueBoard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicBookingController extends Controller
{
    use ResolvesPublicTenant;

    // Maksimal antrian aktif (menunggu/dikerjakan) per nomor HP per hari, mencegah spam.
    private const MAX_ACTIVE_PER_PHONE = 2;

    // Papan antrian publik (dipoll situs tenant).
    public function board(Request $request, QueueBoard $board): JsonResponse
    {
        return response()->json($board->build($this->publicTenant($request)));
    }

    // Reservasi online dari situs tenant: langsung masuk antrian hari ini.
    public function store(Request $request, BookingService $bookings, QueueBoard $board): JsonResponse
    {
        $tenant = $this->publicTenant($request);

        abort_unless($tenant->features()['online_booking'], 403, 'Reservasi online belum tersedia di bisnis ini. Silakan datang langsung atau hubungi via WhatsApp.');

        if (! $tenant->isOpenAt(now())) {
            return response()->json([
                'message' => 'Maaf, kami sedang tutup. Reservasi online bisa dilakukan saat jam buka.',
            ], 422);
        }

        $data = $request->validate($bookings->rules($tenant, phoneRequired: true), [
            'phone.regex' => 'Nomor HP tidak valid.',
            'package_id.exists' => 'Paket tidak tersedia.',
        ]);

        $active = $tenant->bookings()
            ->where('queue_date', $bookings->today())
            ->where('phone', trim($data['phone']))
            ->whereIn('status', [Booking::WAITING, Booking::IN_PROGRESS])
            ->count();

        if ($active >= self::MAX_ACTIVE_PER_PHONE) {
            return response()->json([
                'message' => 'Nomor HP ini sudah punya antrian aktif hari ini.',
                'errors' => ['phone' => ['Nomor HP ini sudah punya antrian aktif hari ini.']],
            ], 422);
        }

        $booking = $bookings->create($tenant, $data, 'online');

        return response()->json(['booking' => $board->find($tenant, $booking)], 201);
    }
}
