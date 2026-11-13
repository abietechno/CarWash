<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\Tenant;
use Illuminate\Http\Request;

trait ResolvesTenant
{
    // Tenant milik user yang login; semua data dashboard dibatasi ke tenant ini.
    protected function tenant(Request $request): Tenant
    {
        return $request->user()->tenant ?? abort(403, __('Akun ini tidak terhubung ke bisnis mana pun.'));
    }
}
