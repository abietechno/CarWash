<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'name', 'category', 'tagline', 'price', 'duration_minutes', 'description', 'features',
    'is_popular', 'is_active', 'sort_order',
])]
class ServicePackage extends Model
{
    public const CATEGORIES = ['wash', 'salon', 'coating'];

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

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? '/api/media/'.$this->image_path : null;
    }
}
