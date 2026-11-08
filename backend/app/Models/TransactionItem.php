<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['item_type', 'item_id', 'name', 'qty', 'unit_price', 'subtotal'])]
class TransactionItem extends Model
{
    protected function casts(): array
    {
        return [
            'item_id' => 'integer',
            'qty' => 'integer',
            'unit_price' => 'integer',
            'subtotal' => 'integer',
        ];
    }
}
