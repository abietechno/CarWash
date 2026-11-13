<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesTenant;
use App\Http\Controllers\Controller;
use App\Models\Promo;
use App\Models\Tenant;
use App\Services\TenantImages;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PromoController extends Controller
{
    use ResolvesTenant;

    /** @return Collection<int, Promo> */
    public function index(Request $request): Collection
    {
        return $this->tenant($request)->promos()->get();
    }

    public function store(Request $request): JsonResponse
    {
        $tenant = $this->tenant($request);
        $data = $this->validated($request);
        $this->ensureWithinPlan($tenant);

        $promo = $tenant->promos()->create($data);

        return response()->json($promo, 201);
    }

    public function update(Request $request, int $promo): Promo
    {
        $model = $this->tenant($request)->promos()->findOrFail($promo);
        $model->update($this->validated($request));

        return $model;
    }

    public function destroy(Request $request, int $promo, TenantImages $images): Response
    {
        $model = $this->tenant($request)->promos()->findOrFail($promo);
        $images->delete($model->image_path);
        $model->delete();

        return response()->noContent();
    }

    public function uploadImage(Request $request, int $promo, TenantImages $images): Promo
    {
        $tenant = $this->tenant($request);
        $model = $tenant->promos()->findOrFail($promo);
        $request->validate(['image' => TenantImages::RULES]);

        $images->delete($model->image_path);
        $model->image_path = $images->store($tenant, $request->file('image'));
        $model->save();

        return $model;
    }

    public function deleteImage(Request $request, int $promo, TenantImages $images): Promo
    {
        $model = $this->tenant($request)->promos()->findOrFail($promo);
        $images->delete($model->image_path);
        $model->image_path = null;
        $model->save();

        return $model;
    }

    // Gratis 1 foto promo, Pro 25. Promo lama di atas batas (mis. setelah Pro habis) tetap bisa diedit & dihapus.
    private function ensureWithinPlan(Tenant $tenant): void
    {
        $max = $tenant->features()['max_promos'];

        if ($tenant->promos()->count() >= $max) {
            throw ValidationException::withMessages([
                'promo' => $tenant->isPro()
                    ? __('Maksimal :max foto promo. Hapus promo lama untuk menambah yang baru.', ['max' => $max])
                    : __('Paket Gratis maksimal :max foto promo. Upgrade ke Pro untuk sampai :pro foto.', ['max' => $max, 'pro' => Tenant::PRO_MAX_PROMOS]),
            ]);
        }
    }

    private function validated(Request $request): array
    {
        $tenant = $this->tenant($request);

        return $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'subtitle' => ['nullable', 'string', 'max:200'],
            'badge' => ['nullable', 'string', 'max:40'],
            'service_package_id' => ['nullable', 'integer', Rule::exists('service_packages', 'id')->where('tenant_id', $tenant->id)],
            'theme' => ['required', Rule::in(Promo::THEMES)],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:1000'],
        ]);
    }
}
