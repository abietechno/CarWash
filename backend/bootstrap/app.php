<?php

use App\Http\Middleware\EnsureSuperadmin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Production di belakang Cloudflare + nginx: pakai IP & host asli dari header X-Forwarded-*
        // (dibutuhkan untuk rate limit per pengunjung). Aman karena PHP hanya bisa diakses lewat nginx.
        $middleware->trustProxies(at: '*');

        $middleware->alias(['superadmin' => EnsureSuperadmin::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
