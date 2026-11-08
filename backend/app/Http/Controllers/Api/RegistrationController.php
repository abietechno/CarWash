<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Services\TenantProvisioner;
use App\Support\Subdomain;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegistrationController extends Controller
{
    // Cek ketersediaan subdomain secara live dari form pendaftaran.
    public function check(Request $request): JsonResponse
    {
        $subdomain = Subdomain::normalize($request->query('name'));

        return response()->json(['subdomain' => $subdomain] + $this->availability($subdomain));
    }

    public function store(Request $request, TenantProvisioner $provisioner): JsonResponse
    {
        $request->merge([
            'subdomain' => Subdomain::normalize($request->input('subdomain')),
            'email' => strtolower(trim((string) $request->input('email'))),
        ]);

        $data = $request->validate([
            'business_name' => ['required', 'string', 'max:100'],
            'subdomain' => [
                'required', 'string', 'regex:'.Subdomain::PATTERN, 'unique:tenants,subdomain',
                function (string $attribute, string $value, Closure $fail) {
                    if (Subdomain::isReserved($value)) {
                        $fail('Subdomain ini dicadangkan sistem, pilih nama lain.');
                    }
                },
            ],
            'owner_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'phone' => ['required', 'string', 'regex:/^[0-9+\-\s]{8,20}$/'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'subdomain.regex' => 'Subdomain 3–32 karakter: huruf kecil, angka, atau tanda hubung (-).',
            'subdomain.unique' => 'Subdomain sudah dipakai bisnis lain.',
            'email.unique' => 'Email sudah terdaftar, silakan login.',
            'phone.regex' => 'Nomor WhatsApp tidak valid.',
        ]);

        ['tenant' => $tenant] = $provisioner->provision($data);

        return response()->json([
            'message' => 'Pendaftaran berhasil.',
            'tenant' => [
                'name' => $tenant->name,
                'subdomain' => $tenant->subdomain,
                'url' => $tenant->url(),
            ],
            'login_url' => rtrim(config('saas.admin_url'), '/').'/login?email='.urlencode($data['email']),
        ], 201);
    }

    /** @return array{available: bool, reason: ?string} */
    private function availability(string $subdomain): array
    {
        if (! preg_match(Subdomain::PATTERN, $subdomain)) {
            return ['available' => false, 'reason' => '3–32 karakter: huruf kecil, angka, atau tanda hubung (-).'];
        }

        if (Subdomain::isReserved($subdomain)) {
            return ['available' => false, 'reason' => 'Nama ini dicadangkan sistem.'];
        }

        if (Tenant::where('subdomain', $subdomain)->exists()) {
            return ['available' => false, 'reason' => 'Sudah dipakai bisnis lain.'];
        }

        return ['available' => true, 'reason' => null];
    }
}
