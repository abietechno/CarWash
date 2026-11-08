<?php

namespace App\Http\Controllers\Api\Super;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\PlatformSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(PlatformSetting::allValues());
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'pro_monthly_price' => ['required', 'integer', 'min:0', 'max:100000000'],
            'pro_yearly_price' => ['required', 'integer', 'min:0', 'max:100000000'],
            'payment_instructions' => ['nullable', 'string', 'max:2000'],
            'contact_whatsapp' => ['nullable', 'string', 'regex:/^[0-9+\-\s]{8,20}$/'],
        ]);

        PlatformSetting::write($data);
        ActivityLog::record($request, 'settings.updated', null, ['keys' => array_keys($data)]);

        return response()->json(PlatformSetting::allValues());
    }
}
