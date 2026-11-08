<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

// Pengaturan platform yang bisa diubah super-admin (harga Pro, info pembayaran, kontak).
#[Fillable(['key', 'value'])]
class PlatformSetting extends Model
{
    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    public const DEFAULTS = [
        'pro_monthly_price' => 99000,
        'pro_yearly_price' => 990000,
        'payment_instructions' => '',
        'contact_whatsapp' => '081233741899',
    ];

    /** @return array<string, mixed> */
    public static function allValues(): array
    {
        $stored = static::query()->pluck('value', 'key')->all();
        $values = [];

        foreach (self::DEFAULTS as $key => $default) {
            $value = $stored[$key] ?? $default;
            $values[$key] = is_int($default) ? (int) $value : (string) $value;
        }

        return $values;
    }

    public static function read(string $key): mixed
    {
        return static::allValues()[$key] ?? null;
    }

    /** @param array<string, mixed> $values */
    public static function write(array $values): void
    {
        foreach ($values as $key => $value) {
            if (array_key_exists($key, self::DEFAULTS)) {
                static::updateOrCreate(['key' => $key], ['value' => (string) ($value ?? '')]);
            }
        }
    }
}
