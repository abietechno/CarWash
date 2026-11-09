<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'queue_date', 'queue_number', 'source', 'customer_name', 'phone', 'vehicle_type', 'vehicle_color', 'vehicle_brand', 'plate',
    'service_package_id', 'package_name', 'price', 'duration_minutes', 'status', 'bay',
    'started_at', 'finished_at', 'picked_up_at',
])]
class Booking extends Model
{
    public const WAITING = 'waiting';

    public const IN_PROGRESS = 'in_progress';

    public const DONE = 'done';

    public const PICKED_UP = 'picked_up';

    public const CANCELLED = 'cancelled';

    public const STATUSES = [self::WAITING, self::IN_PROGRESS, self::DONE, self::PICKED_UP, self::CANCELLED];

    // Status yang boleh dituju dari status sekarang (termasuk mundur satu langkah untuk koreksi salah klik).
    public const TRANSITIONS = [
        self::WAITING => [self::IN_PROGRESS, self::CANCELLED],
        self::IN_PROGRESS => [self::DONE, self::WAITING, self::CANCELLED],
        self::DONE => [self::PICKED_UP, self::IN_PROGRESS],
        self::PICKED_UP => [self::DONE],
        self::CANCELLED => [self::WAITING],
    ];

    public const COLORS = ['white', 'black', 'silver', 'gray', 'red', 'blue', 'green', 'yellow', 'orange', 'brown'];

    protected function casts(): array
    {
        // queue_date sengaja tidak di-cast 'date': disimpan & dibandingkan sebagai string Y-m-d di semua driver DB.
        return [
            'queue_number' => 'integer',
            'price' => 'integer',
            'duration_minutes' => 'integer',
            'bay' => 'integer',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
            'picked_up_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Tenant, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /** @return HasMany<Transaction, $this> */
    public function payments(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function ticket(): string
    {
        return 'A-'.str_pad((string) $this->queue_number, 3, '0', STR_PAD_LEFT);
    }

    // Nama untuk papan publik: "Budi Santoso" -> "Budi S."
    public function publicName(): string
    {
        $parts = preg_split('/\s+/', trim($this->customer_name)) ?: [];
        $first = $parts[0] ?? 'Pelanggan';

        return isset($parts[1]) ? $first.' '.mb_strtoupper(mb_substr($parts[1], 0, 1)).'.' : $first;
    }
}
