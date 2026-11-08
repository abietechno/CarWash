<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesPublicTenant;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicSiteController extends Controller
{
    use ResolvesPublicTenant;

    // Data situs publik tenant, dikenali dari subdomain host (mis. putrajayawash.cloudbizz.my.id).
    public function __invoke(Request $request): JsonResponse
    {
        $tenant = $this->publicTenant($request);

        return response()->json([
            'tenant' => $tenant->only([
                'name', 'subdomain', 'tagline', 'description', 'phone', 'whatsapp', 'email',
                'address', 'city', 'maps_url', 'opening_hours',
            ]) + [
                'open_now' => $tenant->isOpenAt(now()),
                // Logo hanya tampil selama Pro; setelah Pro habis header kembali ke inisial nama.
                'logo_url' => $tenant->features()['custom_logo'] ? $tenant->logoUrl() : null,
            ],
            'features' => [
                'online_booking' => $tenant->features()['online_booking'],
                'branding' => $tenant->features()['branding'],
            ],
            'vehicle_types' => $tenant->vehicleTypes()->get(['code', 'name', 'examples', 'price_multiplier']),
            'packages' => $tenant->packages()->where('is_active', true)->get([
                'id', 'name', 'category', 'tagline', 'price', 'duration_minutes', 'description', 'features',
                'is_popular', 'image_path',
            ]),
            'addons' => $tenant->addons()->where('is_active', true)->get([
                'id', 'name', 'category', 'price', 'duration_minutes', 'description',
            ]),
            // Gratis 1 slide, Pro sampai 25; kelebihan (mis. setelah Pro habis) tidak ditampilkan.
            'promos' => $tenant->promos()
                ->where('is_active', true)
                ->limit($tenant->features()['max_promos'])
                ->get(['id', 'title', 'subtitle', 'badge', 'service_package_id', 'theme', 'image_path']),
        ]);
    }
}
