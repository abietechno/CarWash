<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesTenant;
use App\Http\Controllers\Controller;
use App\Http\Resources\TenantResource;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TenantController extends Controller
{
    use ResolvesTenant;

    public function show(Request $request): TenantResource
    {
        return new TenantResource($this->tenant($request));
    }

    public function update(Request $request): TenantResource
    {
        $tenant = $this->tenant($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'tagline' => ['nullable', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'phone' => ['nullable', 'string', 'max:20'],
            'whatsapp' => ['nullable', 'string', 'regex:/^[0-9+\-\s]{8,20}$/'],
            'email' => ['nullable', 'email', 'max:150'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'maps_url' => ['nullable', 'url', 'max:500'],
            'bay_count' => ['sometimes', 'integer', 'between:1,20'],
            'opening_hours' => ['required', 'array', 'size:7'],
            'opening_hours.*.day' => ['required', 'distinct', Rule::in(Tenant::DAYS)],
            'opening_hours.*.open' => ['required', 'date_format:H:i'],
            'opening_hours.*.close' => ['required', 'date_format:H:i'],
            'opening_hours.*.closed' => ['required', 'boolean'],
        ], [
            'whatsapp.regex' => 'Nomor WhatsApp tidak valid.',
        ]);

        foreach ($data['opening_hours'] as $i => $day) {
            if (! $day['closed'] && $day['close'] <= $day['open']) {
                throw ValidationException::withMessages([
                    "opening_hours.$i.close" => 'Jam tutup harus setelah jam buka.',
                ]);
            }
        }

        // Simpan berurutan Senin..Minggu.
        $data['opening_hours'] = collect($data['opening_hours'])
            ->sortBy(fn ($day) => array_search($day['day'], Tenant::DAYS, true))
            ->map(fn ($day) => [
                'day' => $day['day'],
                'open' => $day['open'],
                'close' => $day['close'],
                'closed' => (bool) $day['closed'],
            ])
            ->values()
            ->all();

        $tenant->update($data);

        return new TenantResource($tenant);
    }

    public function publish(Request $request): TenantResource|JsonResponse
    {
        $tenant = $this->tenant($request);

        abort_if($tenant->status === Tenant::STATUS_SUSPENDED, 403, 'Bisnis ini sedang dinonaktifkan. Hubungi admin.');

        $issues = $tenant->publishIssues();
        if ($issues !== []) {
            return response()->json([
                'message' => 'Lengkapi data berikut sebelum mempublikasikan situs.',
                'issues' => $issues,
            ], 422);
        }

        $tenant->update([
            'status' => Tenant::STATUS_PUBLISHED,
            'published_at' => $tenant->published_at ?? now(),
        ]);

        return new TenantResource($tenant);
    }

    public function unpublish(Request $request): TenantResource
    {
        $tenant = $this->tenant($request);

        abort_if($tenant->status === Tenant::STATUS_SUSPENDED, 403, 'Bisnis ini sedang dinonaktifkan. Hubungi admin.');

        $tenant->update(['status' => Tenant::STATUS_DRAFT]);

        return new TenantResource($tenant);
    }
}
