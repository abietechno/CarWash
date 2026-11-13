<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TenantResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', strtolower(trim($credentials['email'])))->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => __('Email atau password salah.')]);
        }

        $token = $user->createToken('dash-admin')->plainTextToken;

        return response()->json(['token' => $token] + $this->payload($user, $request));
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($this->payload($request->user(), $request));
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => __('Berhasil keluar.')]);
    }

    private function payload(User $user, Request $request): array
    {
        return [
            'user' => $user->only(['id', 'name', 'email', 'role', 'phone']),
            'impersonating' => $user->isImpersonated(),
            'tenant' => $user->tenant ? (new TenantResource($user->tenant))->resolve($request) : null,
        ];
    }
}
