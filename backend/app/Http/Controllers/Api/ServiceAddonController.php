<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesTenant;
use App\Http\Controllers\Controller;
use App\Models\ServiceAddon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ServiceAddonController extends Controller
{
    use ResolvesTenant;

    /** @return Collection<int, ServiceAddon> */
    public function index(Request $request): Collection
    {
        return $this->tenant($request)->addons()->get();
    }

    public function store(Request $request): JsonResponse
    {
        $addon = $this->tenant($request)->addons()->create($this->validated($request));

        return response()->json($addon, 201);
    }

    public function update(Request $request, int $addon): ServiceAddon
    {
        $model = $this->tenant($request)->addons()->findOrFail($addon);
        $model->update($this->validated($request));

        return $model;
    }

    public function destroy(Request $request, int $addon): Response
    {
        $this->tenant($request)->addons()->findOrFail($addon)->delete();

        return response()->noContent();
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'category' => ['required', Rule::in(ServiceAddon::CATEGORIES)],
            'price' => ['required', 'integer', 'min:0', 'max:100000000'],
            'duration_minutes' => ['required', 'integer', 'min:5', 'max:1440'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:1000'],
        ]);
    }
}
