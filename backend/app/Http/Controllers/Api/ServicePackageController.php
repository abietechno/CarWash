<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesTenant;
use App\Http\Controllers\Controller;
use App\Models\ServicePackage;
use App\Models\Tenant;
use App\Services\TenantImages;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ServicePackageController extends Controller
{
    use ResolvesTenant;

    /** @return Collection<int, ServicePackage> */
    public function index(Request $request): Collection
    {
        return $this->tenant($request)->packages()->get();
    }

    public function store(Request $request): JsonResponse
    {
        $tenant = $this->tenant($request);
        $data = $this->validated($request);
        $this->ensureWithinPlan($tenant, $data, null);

        return response()->json($tenant->packages()->create($data), 201);
    }

    public function update(Request $request, int $package): ServicePackage
    {
        $tenant = $this->tenant($request);
        $model = $tenant->packages()->findOrFail($package);
        $data = $this->validated($request);
        $this->ensureWithinPlan($tenant, $data, $model);
        $model->update($data);

        return $model;
    }

    // Paket Gratis dibatasi jumlah paket aktif; Pro tanpa batas.
    private function ensureWithinPlan(Tenant $tenant, array $data, ?ServicePackage $current): void
    {
        $max = $tenant->features()['max_packages'];
        $willBeActive = $data['is_active'] ?? $current?->is_active ?? true;

        if ($max === null || ! $willBeActive || $current?->is_active) {
            return;
        }

        if ($tenant->packages()->where('is_active', true)->count() >= $max) {
            throw ValidationException::withMessages([
                'is_active' => "Paket Gratis maksimal {$max} paket aktif. Nonaktifkan paket lain atau upgrade ke Pro.",
            ]);
        }
    }

    public function destroy(Request $request, int $package, TenantImages $images): Response
    {
        $model = $this->tenant($request)->packages()->findOrFail($package);
        $images->delete($model->image_path);
        $model->delete();

        return response()->noContent();
    }

    public function uploadImage(Request $request, int $package, TenantImages $images): ServicePackage
    {
        $tenant = $this->tenant($request);
        $model = $tenant->packages()->findOrFail($package);
        $request->validate(['image' => TenantImages::RULES]);

        $images->delete($model->image_path);
        $model->image_path = $images->store($tenant, $request->file('image'));
        $model->save();

        return $model;
    }

    public function deleteImage(Request $request, int $package, TenantImages $images): ServicePackage
    {
        $model = $this->tenant($request)->packages()->findOrFail($package);
        $images->delete($model->image_path);
        $model->image_path = null;
        $model->save();

        return $model;
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'category' => ['required', Rule::in(ServicePackage::CATEGORIES)],
            'tagline' => ['nullable', 'string', 'max:150'],
            'price' => ['required', 'integer', 'min:0', 'max:100000000'],
            'duration_minutes' => ['required', 'integer', 'min:5', 'max:1440'],
            'description' => ['nullable', 'string', 'max:2000'],
            'features' => ['nullable', 'array', 'max:12'],
            'features.*' => ['string', 'max:150'],
            'is_popular' => ['boolean'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:1000'],
        ]);
    }
}
