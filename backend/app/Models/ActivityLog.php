<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Request;

// Jejak aksi super-admin (masuk sebagai tenant, nonaktifkan, catat pembayaran, ubah masa aktif, dll).
#[Fillable(['user_id', 'tenant_id', 'action', 'meta', 'ip'])]
class ActivityLog extends Model
{
    public const UPDATED_AT = null;

    protected function casts(): array
    {
        return ['meta' => 'array', 'created_at' => 'datetime'];
    }

    public static function record(Request $request, string $action, ?Tenant $tenant = null, array $meta = []): self
    {
        return static::create([
            'user_id' => $request->user()?->id,
            'tenant_id' => $tenant?->id,
            'action' => $action,
            'meta' => $meta ?: null,
            'ip' => $request->ip(),
        ]);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Tenant, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
