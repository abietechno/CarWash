<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    // Bahasa dari prefix URL landing (/ms, /en) atau header X-Locale yang dikirim dash-admin & situs tenant.
    // Accept-Language sengaja tidak dipakai: bahasa browser sering beda dengan bahasa yang dipilih di aplikasi.
    public function handle(Request $request, Closure $next): Response
    {
        $locales = config('saas.locales');
        $locale = $request->route('locale') ?? $request->header('X-Locale');

        // Tanpa pilihan yang valid selalu kembali ke bahasa bawaan, supaya tidak terbawa dari request sebelumnya.
        App::setLocale(in_array($locale, $locales, true) ? $locale : $locales[0]);

        return $next($request);
    }
}
