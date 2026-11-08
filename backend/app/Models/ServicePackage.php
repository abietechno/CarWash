<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'name', 'category', 'vehicle_scope', 'tagline', 'price', 'duration_minutes', 'description', 'features',
    'is_popular', 'is_active', 'sort_order',
])]
class ServicePackage extends Model
{
    public const CATEGORIES = ['wash', 'salon', 'coating'];

    public const SCOPE_CAR = 'car';

    public const SCOPE_MOTOR = 'motor';

    public const SCOPE_ALL = 'all';

    public const SCOPES = [self::SCOPE_CAR, self::SCOPE_MOTOR, self::SCOPE_ALL];

    protected $attributes = ['vehicle_scope' => self::SCOPE_CAR];

    protected $appends = ['image_url'];

    protected $hidden = ['image_path'];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'duration_minutes' => 'integer',
            'features' => 'array',
            'is_popular' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /** @return BelongsTo<Tenant, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function fits(VehicleType $vehicle): bool
    {
        return $this->vehicle_scope === self::SCOPE_ALL
            || $this->vehicle_scope === ($vehicle->isMotor() ? self::SCOPE_MOTOR : self::SCOPE_CAR);
    }

    // Paket khusus motor memakai harganya sendiri; selain itu harga dasar × pengali jenis kendaraan.
    public function priceFor(VehicleType $vehicle): int
    {
        return $this->vehicle_scope === self::SCOPE_MOTOR
            ? $this->price
            : (int) round($this->price * $vehicle->price_multiplier);
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? '/api/media/'.$this->image_path : null;
    }
}
