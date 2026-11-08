<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['period', 'amount', 'method', 'reference', 'note', 'paid_at', 'period_start', 'period_end', 'recorded_by'])]
class SubscriptionPayment extends Model
{
    public const PERIODS = ['monthly' => 1, 'yearly' => 12]; // durasi dalam bulan

    public const METHODS = ['transfer', 'qris', 'cash', 'other'];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'paid_at' => 'date:Y-m-d',
            'period_start' => 'datetime',
            'period_end' => 'datetime',
        ];
    }

    /** @return BelongsTo<Tenant, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /** @return BelongsTo<User, $this> */
    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
