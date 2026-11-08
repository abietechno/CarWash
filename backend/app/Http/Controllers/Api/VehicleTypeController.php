<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesTenant;
use App\Http\Controllers\Controller;
use App\Models\VehicleType;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VehicleTypeController extends Controller
{
    use ResolvesTenant;

    /** @return Collection<int, VehicleType> */
    public function index(Request $request): Collection
    {
        return $this->tenant($request)->vehicleTypes()->get();
    }

    // Simpan sekaligus nama, contoh, dan pengali harga semua jenis kendaraan.
    /** @return Collection<int, VehicleType> */
    public function update(Request $request): Collection
    {
        $tenant = $this->tenant($request);

        $data = $request->validate([
            'vehicle_types' => ['required', 'array'],
            'vehicle_types.*.code' => ['required', 'distinct', Rule::in(VehicleType::CODES)],
            'vehicle_types.*.name' => ['required', 'string', 'max:100'],
            'vehicle_types.*.examples' => ['nullable', 'string', 'max:255'],
            'vehicle_types.*.price_multiplier' => ['required', 'numeric', 'between:0.5,5'],
        ]);

        foreach ($data['vehicle_types'] as $type) {
            $tenant->vehicleTypes()->where('code', $type['code'])->update([
                'name' => $type['name'],
                'examples' => $type['examples'] ?? null,
                'price_multiplier' => $type['price_multiplier'],
            ]);
        }

        return $tenant->vehicleTypes()->get();
    }
}
