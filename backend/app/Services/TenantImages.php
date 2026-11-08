<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

// Foto paket & promo milik tenant, disimpan di disk "public" dan disajikan lewat /api/media/{path}.
class TenantImages
{
    public const RULES = ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'];

    public function store(Tenant $tenant, UploadedFile $file): string
    {
        return $file->store("tenants/{$tenant->id}", 'public');
    }

    public function delete(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}
