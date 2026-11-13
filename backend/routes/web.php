<?php

use App\Services\Subscriptions;
use Illuminate\Support\Facades\Route;

// Landing page SaaS (washwuzz.cloudbizz.my.id). Situs tenant & dash-admin dilayani frontend masing-masing.
// Bahasa Indonesia di "/", Melayu di "/ms", Inggris di "/en" (bahasa diset middleware SetLocale).
Route::get('/{locale?}', function () {
    $demo = config('saas.demo_subdomain');

    return view('landing', [
        'adminUrl' => rtrim(config('saas.admin_url'), '/'),
        'baseDomain' => config('saas.base_domain'),
        'demoUrl' => $demo ? str_replace('{subdomain}', $demo, config('saas.tenant_url')) : null,
        'prices' => app(Subscriptions::class)->prices(),
    ]);
})->where('locale', 'ms|en')->name('landing');
