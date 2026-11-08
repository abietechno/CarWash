<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'type', 'business_date', 'sequence', 'number', 'category', 'description', 'booking_id',
    'customer_name', 'customer_phone', 'subtotal', 'discount', 'amount', 'payment_method', 'paid_amount',
    'created_by', 'voided_at', 'void_reason', 'voided_by',
])]
class Transaction extends Model
{
    public const INCOME = 'income';

    public const EXPENSE = 'expense';

    public const CATEGORY_SALE = 'sale';

    public const PAYMENT_METHODS = ['cash', 'qris', 'transfer', 'debit', 'other'];

    public const EXPENSE_CATEGORIES = ['supplies', 'salary', 'utilities', 'rent', 'equipment', 'other'];

    protected function casts(): array
    {
        // business_date sengaja tidak di-cast 'date', sama seperti bookings.queue_date.
        return [
            'sequence' => 'integer',
            'subtotal' => 'integer',
            'discount' => 'integer',
            'amount' => 'integer',
            'paid_amount' => 'integer',
            'voided_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Booking, $this> */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /** @return HasMany<TransactionItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class)->orderBy('id');
    }

    /** @param Builder<Transaction> $query */
    public function scopeActive(Builder $query): void
    {
        $query->whereNull('voided_at');
    }

    public function isVoided(): bool
    {
        return $this->voided_at !== null;
    }

    public function change(): int
    {
        return $this->paid_amount === null ? 0 : max(0, $this->paid_amount - $this->amount);
    }
}
