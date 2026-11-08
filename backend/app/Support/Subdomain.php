<?php

namespace App\Support;

class Subdomain
{
    // 3-32 karakter: huruf kecil, angka, tanda hubung; tidak diawali/diakhiri tanda hubung.
    public const PATTERN = '/^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/';

    public static function normalize(?string $value): string
    {
        return strtolower(trim((string) $value));
    }

    public static function isReserved(string $subdomain): bool
    {
        return in_array($subdomain, config('saas.reserved_subdomains'), true);
    }

    /**
     * Ambil subdomain tenant dari host request, mis. "putrajayawash.cloudbizz.my.id" -> "putrajayawash".
     * Null kalau host bukan subdomain tenant (domain induk, subdomain bertingkat, atau nama yang dicadangkan).
     */
    public static function fromHost(string $host): ?string
    {
        $suffix = '.'.config('saas.base_domain');
        $host = strtolower($host);

        if (! str_ends_with($host, $suffix)) {
            return null;
        }

        $subdomain = substr($host, 0, -strlen($suffix));

        if ($subdomain === '' || str_contains($subdomain, '.') || self::isReserved($subdomain)) {
            return null;
        }

        return $subdomain;
    }
}
