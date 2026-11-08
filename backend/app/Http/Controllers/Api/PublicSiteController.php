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
            ]) + ['open_now' => $tenant->isOpenAt(now())],
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
            // Promo slider hanya tampil untuk tenant Pro.
            'promos' => $tenant->isPro()
                ? $tenant->promos()->where('is_active', true)->get(['id', 'title', 'subtitle', 'badge', 'service_package_id', 'theme', 'image_path'])
                : [],
        ]);
    }
}
