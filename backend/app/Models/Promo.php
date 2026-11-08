<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['title', 'subtitle', 'badge', 'service_package_id', 'theme', 'is_active', 'sort_order'])]
class Promo extends Model
{
    public const THEMES = ['blue', 'cyan', 'violet', 'amber', 'rose', 'slate'];

    protected $appends = ['image_url'];

    protected $hidden = ['image_path'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'service_package_id' => 'integer',
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
