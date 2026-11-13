<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\Tenant;
use App\Support\Subdomain;
use Illuminate\Http\Request;

trait ResolvesPublicTenant
{
    // Tenant dari subdomain host (mis. putrajayawash.cloudbizz.my.id); 404 kalau tidak ada / belum dipublikasikan.
    protected function publicTenant(Request $request): Tenant
    {
        $subdomain = Subdomain::fromHost($request->getHost());
        $tenant = $subdomain ? Tenant::where('subdomain', $subdomain)->first() : null;

        abort_unless($tenant?->isPublished(), 404, __('Situs tidak ditemukan atau belum dipublikasikan.'));

        return $tenant;
    }
}
