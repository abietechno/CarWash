<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Tenant;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

class QueueBoard
{
    public function __construct(private BookingService $bookings) {}

    /**
     * Papan antrian hari ini: progress yang sedang dikerjakan dan estimasi mulai yang menunggu.
     * Versi publik menyamarkan nama & menyembunyikan nomor HP; versi admin lengkap + riwayat.
     */
    public function build(Tenant $tenant, bool $forAdmin = false, ?CarbonInterface $now = null): array
    {
        $now ??= now();

        $today = $tenant->bookings()
            ->where('queue_date', $this->bookings->today())
            ->orderBy('queue_number')
            ->get();

        $inProgress = $today->where('status', Booking::IN_PROGRESS)->sortBy('started_at')->values();
        $waiting = $today->where('status', Booking::WAITING)->values();
        $ready = $today->where('status', Booking::DONE)->sortByDesc('finished_at')->values();

        // Sisa menit tiap bay yang terpakai, lalu antrian dibagikan ke bay yang paling cepat kosong.
        $computed = [];
        $bayFreeIn = [];
        foreach ($inProgress as $booking) {
            $elapsed = $booking->started_at ? max(0, $booking->started_at->diffInMinutes($now)) : 0;
            $remaining = max(0, $booking->duration_minutes - $elapsed);
            $computed[$booking->id] = [
                'progress' => (int) min(99, floor($elapsed / max(1, $booking->duration_minutes) * 100)),
                'remaining_minutes' => (int) ceil($remaining),
            ];
            $bayFreeIn[] = $remaining;
        }

        $bayFreeIn = array_pad($bayFreeIn, max(1, $tenant->bay_count), 0);
        foreach ($waiting as $booking) {
            sort($bayFreeIn);
            $computed[$booking->id] = [
                'est_wait_minutes' => (int) ceil($bayFreeIn[0]),
                'est_start_at' => $now->copy()->addMinutes((int) ceil($bayFreeIn[0]))->toIso8601String(),
            ];
            $bayFreeIn[0] += $booking->duration_minutes;
        }
        sort($bayFreeIn);

        // Status bayar hanya untuk dashboard, tidak pernah ke papan publik.
        if ($forAdmin) {
            $paid = $tenant->transactions()->active()->whereIn('booking_id', $today->pluck('id'))->pluck('id', 'booking_id');
            foreach ($paid as $bookingId => $transactionId) {
                $computed[$bookingId]['transaction_id'] = $transactionId;
            }
        }

        $present = fn (Collection $list) => $list
            ->map(fn (Booking $b) => $this->present($b, $computed[$b->id] ?? [], $forAdmin))
            ->all();

        $board = [
            'date' => $this->bookings->today(),
            'bay_count' => $tenant->bay_count,
            'stats' => [
                'in_progress' => $inProgress->count(),
                'waiting' => $waiting->count(),
                'finished_today' => $today->whereIn('status', [Booking::DONE, Booking::PICKED_UP])->count(),
                // Perkiraan tunggu kalau mobil baru datang sekarang.
                'next_wait_minutes' => (int) ceil($bayFreeIn[0]),
            ],
            'in_progress' => $present($inProgress),
            'waiting' => $present($waiting),
            'ready' => $present($ready),
        ];

        if ($forAdmin) {
            $board['picked_up'] = $present($today->where('status', Booking::PICKED_UP)->sortByDesc('picked_up_at')->values());
            $board['cancelled'] = $present($today->where('status', Booking::CANCELLED)->values());
        }

        return $board;
    }

    /** Satu booking dalam format papan (dengan estimasi), mis. untuk respon setelah reservasi. */
    public function find(Tenant $tenant, Booking $booking, bool $forAdmin = false): ?array
    {
        $board = $this->build($tenant, $forAdmin);

        foreach (['in_progress', 'waiting', 'ready', 'picked_up', 'cancelled'] as $section) {
            foreach ($board[$section] ?? [] as $i => $item) {
                if ($item['ticket'] === $booking->ticket()) {
                    return $item + ['position' => $section === 'waiting' ? $i + 1 : null, 'date' => $board['date']];
                }
            }
        }

        return null;
    }

    private function present(Booking $b, array $computed, bool $forAdmin): array
    {
        $item = [
            'ticket' => $b->ticket(),
            'name' => $b->publicName(),
            'vehicle_type' => $b->vehicle_type,
            'vehicle_color' => $b->vehicle_color,
            'package_name' => $b->package_name,
            'duration_minutes' => $b->duration_minutes,
            'status' => $b->status,
            'bay' => $b->bay,
            'created_at' => $b->created_at?->toIso8601String(),
            'started_at' => $b->started_at?->toIso8601String(),
            'finished_at' => $b->finished_at?->toIso8601String(),
            'progress' => $computed['progress'] ?? null,
            'remaining_minutes' => $computed['remaining_minutes'] ?? null,
            'est_wait_minutes' => $computed['est_wait_minutes'] ?? null,
            'est_start_at' => $computed['est_start_at'] ?? null,
        ];

        if ($forAdmin) {
            $item += [
                'id' => $b->id,
                'customer_name' => $b->customer_name,
                'phone' => $b->phone,
                'plate' => $b->plate,
                'source' => $b->source,
                'price' => $b->price,
                'service_package_id' => $b->service_package_id,
                'transaction_id' => $computed['transaction_id'] ?? null,
            ];
        }

        return $item;
    }
}
