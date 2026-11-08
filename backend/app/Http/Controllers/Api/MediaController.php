<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MediaController extends Controller
{
    // Lewat /api supaya ikut proxy yang sama di semua domain (landing, dash-admin, situs tenant).
    public function __invoke(string $path): StreamedResponse
    {
        abort_unless(Storage::disk('public')->exists($path), 404);

        return Storage::disk('public')->response($path, null, [
            'Cache-Control' => 'public, max-age=604800, immutable',
        ]);
    }
}
