<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesTenant;
use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentSettingController extends Controller
{
    use ResolvesTenant;

    public function show(Request $request): JsonResponse
    {
        return response()->json(['methods' => $this->tenant($request)->paymentMethods()]);
    }

    public function update(Request $request): JsonResponse
    {
        $tenant = $this->tenant($request);

        $data = $request->validate([
            'methods' => ['required', 'array', 'min:1'],
            'methods.*' => ['distinct', Rule::in(Transaction::PAYMENT_METHODS)],
        ], [
            'methods.required' => 'Pilih minimal satu metode bayar.',
            'methods.min' => 'Pilih minimal satu metode bayar.',
        ]);

        $tenant->update(['payment_settings' => ['methods' => $data['methods']] + ($tenant->payment_settings ?? [])]);

        return response()->json(['methods' => $tenant->paymentMethods()]);
    }
}
