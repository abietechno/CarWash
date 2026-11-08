<?php

namespace App\Http\Resources;

use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Transaction */
class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'number' => $this->number,
            'business_date' => $this->business_date,
            'category' => $this->category,
            'description' => $this->description,
            'booking_id' => $this->booking_id,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'subtotal' => $this->subtotal,
            'discount' => $this->discount,
            'amount' => $this->amount,
            'payment_method' => $this->payment_method,
            'paid_amount' => $this->paid_amount,
            'change' => $this->change(),
            'created_at' => $this->created_at?->toIso8601String(),
            'voided_at' => $this->voided_at?->toIso8601String(),
            'void_reason' => $this->void_reason,
            'items' => $this->items->map(fn (TransactionItem $item) => [
                'id' => $item->id,
                'item_type' => $item->item_type,
                'name' => $item->name,
                'qty' => $item->qty,
                'unit_price' => $item->unit_price,
                'subtotal' => $item->subtotal,
            ]),
        ];
    }
}
