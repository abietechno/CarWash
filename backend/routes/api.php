<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\PosController;
use App\Http\Controllers\Api\PromoController;
use App\Http\Controllers\Api\PublicBookingController;
use App\Http\Controllers\Api\PublicSiteController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ServiceAddonController;
use App\Http\Controllers\Api\ServicePackageController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\Super\OverviewController;
use App\Http\Controllers\Api\Super\SettingsController;
use App\Http\Controllers\Api\Super\TenantController as SuperTenantController;
use App\Http\Controllers\Api\TenantController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\VehicleTypeController;
use App\Http\Controllers\HealthController;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class);

// Foto paket & promo tenant.
Route::get('/media/{path}', MediaController::class)->where('path', 'tenants/[0-9]+/[A-Za-z0-9._-]+');

// Landing page: daftar bisnis baru.
// Parameter ke-3 throttle = prefix kunci; tanpa itu semua throttle per IP berbagi satu penghitung,
// sehingga cek subdomain (dipanggil tiap ketikan) ikut menghabiskan jatah pendaftaran.
Route::get('/subdomains/check', [RegistrationController::class, 'check'])->middleware('throttle:60,1,subdomain-check');
Route::post('/register', [RegistrationController::class, 'store'])->middleware('throttle:5,1,register');

// Dash-admin.
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1,login');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/tenant', [TenantController::class, 'show']);
    Route::put('/tenant', [TenantController::class, 'update']);
    Route::post('/tenant/logo', [TenantController::class, 'uploadLogo']);
    Route::delete('/tenant/logo', [TenantController::class, 'deleteLogo']);
    Route::post('/tenant/publish', [TenantController::class, 'publish']);
    Route::post('/tenant/unpublish', [TenantController::class, 'unpublish']);

    Route::apiResource('packages', ServicePackageController::class)->except('show');
    Route::post('/packages/{package}/image', [ServicePackageController::class, 'uploadImage']);
    Route::delete('/packages/{package}/image', [ServicePackageController::class, 'deleteImage']);

    Route::apiResource('addons', ServiceAddonController::class)->except('show');

    Route::apiResource('promos', PromoController::class)->except('show');
    Route::post('/promos/{promo}/image', [PromoController::class, 'uploadImage']);
    Route::delete('/promos/{promo}/image', [PromoController::class, 'deleteImage']);

    Route::get('/vehicle-types', [VehicleTypeController::class, 'index']);
    Route::put('/vehicle-types', [VehicleTypeController::class, 'update']);

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::patch('/bookings/{booking}/status', [BookingController::class, 'updateStatus']);

    Route::get('/pos/catalog', [PosController::class, 'catalog']);
    Route::post('/pos/sales', [PosController::class, 'sale']);

    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions/expenses', [TransactionController::class, 'storeExpense']);
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
    Route::post('/transactions/{transaction}/void', [TransactionController::class, 'void']);

    Route::get('/reports/summary', [ReportController::class, 'summary']);
    Route::get('/reports/export', [ReportController::class, 'export']);

    Route::get('/subscription', SubscriptionController::class);
});

// Super-admin platform.
Route::middleware(['auth:sanctum', 'superadmin'])->prefix('super')->group(function () {
    Route::get('/overview', OverviewController::class);
    Route::get('/tenants', [SuperTenantController::class, 'index']);
    Route::get('/tenants/{tenant}', [SuperTenantController::class, 'show']);
    Route::post('/tenants/{tenant}/suspend', [SuperTenantController::class, 'suspend']);
    Route::post('/tenants/{tenant}/activate', [SuperTenantController::class, 'activate']);
    Route::put('/tenants/{tenant}/plan', [SuperTenantController::class, 'updatePlan']);
    Route::post('/tenants/{tenant}/payments', [SuperTenantController::class, 'recordPayment']);
    Route::post('/tenants/{tenant}/impersonate', [SuperTenantController::class, 'impersonate']);
    Route::get('/settings', [SettingsController::class, 'show']);
    Route::put('/settings', [SettingsController::class, 'update']);
});

// Situs publik tenant ({subdomain}.domain).
Route::get('/public/site', PublicSiteController::class);
Route::get('/public/queue', [PublicBookingController::class, 'board'])->middleware('throttle:120,1,queue');
Route::post('/public/bookings', [PublicBookingController::class, 'store'])->middleware('throttle:10,1,booking');
