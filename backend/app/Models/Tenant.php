<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name', 'subdomain', 'status', 'tagline', 'description', 'phone', 'whatsapp', 'email',
    'address', 'city', 'maps_url', 'opening_hours', 'bay_count', 'published_at', 'pro_until', 'suspended_at',
])]
class Tenant extends Model
{
    public const STATUS_DRAFT = 'draft';

    public const STATUS_PUBLISHED = 'published';

    public const STATUS_SUSPENDED = 'suspended';

    public const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    // Batas paket Gratis; Pro tanpa batas.
    public const FREE_MAX_PACKAGES = 3;

    // Jumlah foto promo slider (1 promo = 1 slide).
    public const FREE_MAX_PROMOS = 1;

    public const PRO_MAX_PROMOS = 25;

    protected function casts(): array
    {
        return [
            'opening_hours' => 'array',
            'bay_count' => 'integer',
            'published_at' => 'datetime',
            'pro_until' => 'datetime',
            'suspended_at' => 'datetime',
        ];
    }

    /** @return HasMany<SubscriptionPayment, $this> */
    public function payments(): HasMany
    {
        return $this->hasMany(SubscriptionPayment::class)->latest('paid_at')->latest('id');
    }

    public function isPro(): bool
    {
        return $this->pro_until !== null && $this->pro_until->isFuture();
    }

    public function plan(): string
    {
        return $this->isPro() ? 'pro' : 'free';
    }

    /**
     * Fitur yang aktif sesuai paket langganan.
     *
     * @return array{max_packages: ?int, max_promos: int, online_booking: bool, custom_logo: bool, branding: bool}
     */
    public function features(): array
    {
        $pro = $this->isPro();

        return [
            'max_packages' => $pro ? null : self::FREE_MAX_PACKAGES,
            'max_promos' => $pro ? self::PRO_MAX_PROMOS : self::FREE_MAX_PROMOS,
            'online_booking' => $pro,
            'custom_logo' => $pro, // logo sendiri di header situs
            'branding' => ! $pro, // label "Dibuat dengan CarWash Cloud"
        ];
    }

    /** @return HasMany<User, $this> */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /** @return HasMany<ServicePackage, $this> */
    public function packages(): HasMany
    {
        return $this->hasMany(ServicePackage::class)->orderBy('sort_order')->orderBy('id');
    }

    /** @return HasMany<ServiceAddon, $this> */
    public function addons(): HasMany
    {
        return $this->hasMany(ServiceAddon::class)->orderBy('sort_order')->orderBy('id');
    }

    /** @return HasMany<VehicleType, $this> */
    public function vehicleTypes(): HasMany
    {
        return $this->hasMany(VehicleType::class)->orderBy('sort_order');
    }

    /** @return HasMany<Promo, $this> */
    public function promos(): HasMany
    {
        return $this->hasMany(Promo::class)->orderBy('sort_order')->orderBy('id');
    }

    /** @return HasMany<Booking, $this> */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Apakah sedang jam buka (zona waktu bisnis, config saas.timezone).
     */
    public function isOpenAt(CarbonInterface $moment): bool
    {
        $local = $moment->copy()->setTimezone(config('saas.timezone'));
        $day = collect($this->opening_hours ?? [])->firstWhere('day', self::DAYS[$local->dayOfWeekIso - 1]);

        if (! $day || $day['closed']) {
            return false;
        }

        $time = $local->format('H:i');

        return $time >= $day['open'] && $time < $day['close'];
    }

    public function logoUrl(): ?string
    {
        return $this->logo_path ? '/api/media/'.$this->logo_path : null;
    }

    public function url(): string
    {
        return str_replace('{subdomain}', $this->subdomain, config('saas.tenant_url'));
    }

    public function isPublished(): bool
    {
        return $this->status === self::STATUS_PUBLISHED;
    }

    /**
     * Data yang masih kurang sebelum situs boleh dipublikasikan.
     *
     * @return list<string>
     */
    public function publishIssues(): array
    {
        $issues = [];

        foreach (['name' => 'Nama bisnis', 'whatsapp' => 'Nomor WhatsApp', 'address' => 'Alamat', 'city' => 'Kota'] as $field => $label) {
            if (blank($this->{$field})) {
                $issues[] = "$label belum diisi";
            }
        }

        $hours = collect($this->opening_hours ?? []);
        if ($hours->isEmpty() || $hours->every(fn ($day) => $day['closed'] ?? true)) {
            $issues[] = 'Jam buka belum diatur';
        }

        if (! $this->packages()->where('is_active', true)->exists()) {
            $issues[] = 'Belum ada paket layanan aktif';
        }

        return $issues;
    }

    /** @return list<array{day: string, open: string, close: string, closed: bool}> */
    public static function defaultOpeningHours(): array
    {
        return array_map(fn (string $day) => [
            'day' => $day,
            'open' => '08:00',
            'close' => '17:00',
            'closed' => false,
        ], self::DAYS);
    }
}
