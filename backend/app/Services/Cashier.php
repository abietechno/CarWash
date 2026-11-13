<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Tenant;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

// Pencatatan buku kas tenant: penjualan kasir, pengeluaran, dan pembatalan.
class Cashier
{
    // Batas kolom unsigned int, dengan sisa ruang.
    private const MAX_AMOUNT = 2_000_000_000;

    public function __construct(private BookingService $bookings) {}

    /**
     * @param  array{booking_id?: ?int, vehicle_type?: ?string, customer_name?: ?string, customer_phone?: ?string, items?: list<array<string, mixed>>, discount?: ?int, payment_method: string, paid_amount?: ?int}  $data
     */
    public function recordSale(Tenant $tenant, User $user, array $data): Transaction
    {
        return DB::transaction(function () use ($tenant, $user, $data) {
            // Kunci baris tenant: nomor transaksi tidak kembar dan satu antrian tidak terbayar dua kali.
            Tenant::whereKey($tenant->id)->lockForUpdate()->first();

            $booking = isset($data['booking_id']) ? $tenant->bookings()->findOrFail($data['booking_id']) : null;
            if ($booking) {
                $this->ensurePayable($booking);
            }

            $lines = $this->lines($tenant, $data, $booking);
            $subtotal = array_sum(array_column($lines, 'subtotal'));
            if ($subtotal > self::MAX_AMOUNT) {
                throw ValidationException::withMessages(['items' => __('Total transaksi terlalu besar.')]);
            }

            $discount = (int) ($data['discount'] ?? 0);

            if ($discount > $subtotal) {
                throw ValidationException::withMessages(['discount' => __('Diskon tidak boleh melebihi subtotal.')]);
            }

            $amount = $subtotal - $discount;
            $paid = $data['payment_method'] === 'cash' ? (int) ($data['paid_amount'] ?? $amount) : null;

            if ($paid !== null && $paid < $amount) {
                throw ValidationException::withMessages(['paid_amount' => __('Uang diterima kurang dari total.')]);
            }

            $date = $this->bookings->today();
            $sequence = $this->nextSequence($tenant, $date);

            $transaction = $tenant->transactions()->create([
                'type' => Transaction::INCOME,
                'business_date' => $date,
                'sequence' => $sequence,
                'number' => $this->number('TRX', $date, $sequence),
                'category' => Transaction::CATEGORY_SALE,
                'description' => $booking ? __('Antrian :ticket', ['ticket' => $booking->ticket()]) : null,
                'booking_id' => $booking?->id,
                'customer_name' => $this->clean($data['customer_name'] ?? null) ?? $booking?->customer_name,
                'customer_phone' => $this->clean($data['customer_phone'] ?? null) ?? $booking?->phone,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'amount' => $amount,
                'payment_method' => $data['payment_method'],
                'paid_amount' => $paid,
                'created_by' => $user->id,
            ]);
            $transaction->items()->createMany($lines);

            return $transaction->load('items');
        });
    }

    /**
     * @param  array{category: string, amount: int, payment_method: string, description?: ?string, business_date?: ?string}  $data
     */
    public function recordExpense(Tenant $tenant, User $user, array $data): Transaction
    {
        return DB::transaction(function () use ($tenant, $user, $data) {
            Tenant::whereKey($tenant->id)->lockForUpdate()->first();

            $date = $data['business_date'] ?? $this->bookings->today();
            $sequence = $this->nextSequence($tenant, $date);

            return $tenant->transactions()->create([
                'type' => Transaction::EXPENSE,
                'business_date' => $date,
                'sequence' => $sequence,
                'number' => $this->number('OUT', $date, $sequence),
                'category' => $data['category'],
                'description' => $this->clean($data['description'] ?? null),
                'subtotal' => $data['amount'],
                'amount' => $data['amount'],
                'payment_method' => $data['payment_method'],
                'created_by' => $user->id,
            ])->load('items');
        });
    }

    public function void(Transaction $transaction, User $user, string $reason): Transaction
    {
        if ($transaction->isVoided()) {
            throw ValidationException::withMessages(['reason' => __('Transaksi ini sudah dibatalkan.')]);
        }

        $transaction->update([
            'voided_at' => now(),
            'void_reason' => trim($reason),
            'voided_by' => $user->id,
        ]);

        return $transaction->load('items');
    }

    private function ensurePayable(Booking $booking): void
    {
        if ($booking->status === Booking::CANCELLED) {
            throw ValidationException::withMessages(['booking_id' => __('Antrian :ticket sudah dibatalkan.', ['ticket' => $booking->ticket()])]);
        }

        if ($booking->payments()->active()->exists()) {
            throw ValidationException::withMessages(['booking_id' => __('Antrian :ticket sudah dibayar.', ['ticket' => $booking->ticket()])]);
        }
    }

    /**
     * Baris penjualan. Harga paket & add-on selalu dari server; hanya item bebas yang harganya dari kasir.
     *
     * @return list<array{item_type: string, item_id: ?int, name: string, qty: int, unit_price: int, subtotal: int}>
     */
    private function lines(Tenant $tenant, array $data, ?Booking $booking): array
    {
        $lines = [];

        if ($booking) {
            $lines[] = $this->line('booking', $booking->id, $booking->package_name, 1, $booking->price);
        }

        $vehicleCode = $booking?->vehicle_type ?? ($data['vehicle_type'] ?? null);
        $vehicle = $vehicleCode ? $tenant->vehicleTypes()->where('code', $vehicleCode)->first() : null;

        foreach ($data['items'] ?? [] as $item) {
            $qty = (int) $item['qty'];

            switch ($item['type']) {
                case 'package':
                    if ($vehicle === null) {
                        throw ValidationException::withMessages(['vehicle_type' => __('Pilih jenis kendaraan untuk paket ini.')]);
                    }
                    $package = $tenant->packages()->where('is_active', true)->find($item['id']) ?? $this->unavailable();
                    if (! $package->fits($vehicle)) {
                        throw ValidationException::withMessages(['items' => __('Paket :package tidak tersedia untuk :vehicle.', ['package' => $package->name, 'vehicle' => $vehicle->name])]);
                    }
                    $lines[] = $this->line('package', $package->id, $package->name, $qty, $package->priceFor($vehicle));
                    break;
                case 'addon':
                    $addon = $tenant->addons()->where('is_active', true)->find($item['id']) ?? $this->unavailable();
                    $lines[] = $this->line('addon', $addon->id, $addon->name, $qty, $addon->price);
                    break;
                default:
                    $lines[] = $this->line('custom', null, trim($item['name']), $qty, (int) $item['price']);
            }
        }

        if ($lines === []) {
            throw ValidationException::withMessages(['items' => __('Keranjang masih kosong.')]);
        }

        return $lines;
    }

    private function unavailable(): never
    {
        throw ValidationException::withMessages(['items' => __('Ada item yang tidak tersedia. Muat ulang halaman kasir.')]);
    }

    private function line(string $type, ?int $id, string $name, int $qty, int $unitPrice): array
    {
        return [
            'item_type' => $type,
            'item_id' => $id,
            'name' => $name,
            'qty' => $qty,
            'unit_price' => $unitPrice,
            'subtotal' => $qty * $unitPrice,
        ];
    }

    private function nextSequence(Tenant $tenant, string $date): int
    {
        return (int) $tenant->transactions()->where('business_date', $date)->max('sequence') + 1;
    }

    // Mis. TRX-20261108-003.
    private function number(string $prefix, string $date, int $sequence): string
    {
        return $prefix.'-'.str_replace('-', '', $date).'-'.str_pad((string) $sequence, 3, '0', STR_PAD_LEFT);
    }

    private function clean(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
