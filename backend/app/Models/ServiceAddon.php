<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['name', 'category', 'price', 'duration_minutes', 'description', 'is_active', 'sort_order'])]
class ServiceAddon extends Model
{
    public const CATEGORIES = ['interior', 'exterior', 'protection'];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'duration_minutes' => 'integer',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /** @return BelongsTo<Tenant, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
