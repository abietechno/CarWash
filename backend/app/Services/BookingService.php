<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BookingService
{
    // Tanggal antrian hari ini menurut zona waktu bisnis.
    public function today(): string
    {
        return now(config('saas.timezone'))->toDateString();
    }

    public function rules(Tenant $tenant, bool $phoneRequired): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:100'],
            'phone' => [$phoneRequired ? 'required' : 'nullable', 'string', 'regex:/^[0-9+\-\s]{8,20}$/'],
            'vehicle_type' => ['required', Rule::in($tenant->vehicleTypes()->pluck('code')->all())],
            'vehicle_color' => ['nullable', Rule::in(Booking::COLORS)],
            'plate' => ['nullable', 'string', 'max:20'],
            'package_id' => [
                'required', 'integer',
                Rule::exists('service_packages', 'id')->where('tenant_id', $tenant->id)->where('is_active', true),
            ],
        ];
    }

    /**
     * @param  array{customer_name: string, phone?: ?string, vehicle_type: string, vehicle_color?: ?string, plate?: ?string, package_id: int}  $data
     */
    public function create(Tenant $tenant, array $data, string $source): Booking
    {
        $package = $tenant->packages()->findOrFail($data['package_id']);
        $vehicle = $tenant->vehicleTypes()->where('code', $data['vehicle_type'])->firstOrFail();

        if (! $package->fits($vehicle)) {
            throw ValidationException::withMessages(['package_id' => "Paket {$package->name} tidak tersedia untuk {$vehicle->name}."]);
        }

        return DB::transaction(function () use ($tenant, $data, $source, $package, $vehicle) {
            $date = $this->today();

            // Kunci baris tenant supaya dua booking yang masuk bersamaan tidak dapat nomor antrian sama.
            Tenant::whereKey($tenant->id)->lockForUpdate()->first();
            $number = (int) $tenant->bookings()->where('queue_date', $date)->max('queue_number') + 1;

            return $tenant->bookings()->create([
                'queue_date' => $date,
                'queue_number' => $number,
                'source' => $source,
                'customer_name' => trim($data['customer_name']),
                'phone' => isset($data['phone']) ? trim($data['phone']) : null,
                'vehicle_type' => $vehicle->code,
                'vehicle_color' => $data['vehicle_color'] ?? 'white',
                'plate' => isset($data['plate']) ? strtoupper(trim($data['plate'])) : null,
                'service_package_id' => $package->id,
                'package_name' => $package->name,
                'price' => $package->priceFor($vehicle),
                'duration_minutes' => $package->duration_minutes,
                'status' => Booking::WAITING,
            ]);
        });
    }

    public function transition(Booking $booking, string $status, ?int $bay = null): Booking
    {
        if (! in_array($status, Booking::TRANSITIONS[$booking->status] ?? [], true)) {
            throw ValidationException::withMessages([
                'status' => "Status {$booking->ticket()} tidak bisa diubah dari {$booking->status} ke {$status}.",
            ]);
        }

        if ($status === Booking::CANCELLED && $booking->payments()->active()->exists()) {
            throw ValidationException::withMessages([
                'status' => "Antrian {$booking->ticket()} sudah dibayar. Batalkan dulu transaksinya di Laporan.",
            ]);
        }

        $from = $booking->status;
        $changes = ['status' => $status];

        switch ($status) {
            case Booking::IN_PROGRESS:
                // Mundur dari "selesai" (koreksi) tetap memakai jam mulai & bay sebelumnya.
                $changes['started_at'] = $from === Booking::DONE ? $booking->started_at : now();
                $changes['finished_at'] = null;
                $changes['bay'] = $bay ?? ($from === Booking::DONE ? $booking->bay : $this->freeBay($booking));
                break;
            case Booking::WAITING:
                $changes += ['started_at' => null, 'finished_at' => null, 'bay' => null];
                break;
            case Booking::DONE:
                $changes['finished_at'] = $from === Booking::PICKED_UP ? $booking->finished_at : now();
                $changes['picked_up_at'] = null;
                break;
            case Booking::PICKED_UP:
                $changes['picked_up_at'] = now();
                break;
            case Booking::CANCELLED:
                $changes['bay'] = null;
                break;
        }

        $booking->update($changes);

        return $booking;
    }

    // Nomor bay terkecil yang sedang kosong hari itu.
    private function freeBay(Booking $booking): int
    {
        $taken = Booking::where('tenant_id', $booking->tenant_id)
            ->where('queue_date', $booking->queue_date)
            ->where('status', Booking::IN_PROGRESS)
            ->pluck('bay')
            ->filter()
            ->all();

        $bay = 1;
        while (in_array($bay, $taken, true)) {
            $bay++;
        }

        return $bay;
    }
}
