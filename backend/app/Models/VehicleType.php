<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['code', 'name', 'examples', 'price_multiplier', 'sort_order'])]
class VehicleType extends Model
{
    public const CODES = ['compact', 'medium', 'large', 'luxury'];

    protected function casts(): array
    {
        return [
            'price_multiplier' => 'float',
            'sort_order' => 'integer',
        ];
    }

    /** @return BelongsTo<Tenant, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
