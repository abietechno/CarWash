<?php

namespace App\Http\Resources;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Tenant */
class TenantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'subdomain' => $this->subdomain,
            'url' => $this->url(),
            'status' => $this->status,
            'tagline' => $this->tagline,
            'description' => $this->description,
            'phone' => $this->phone,
            'whatsapp' => $this->whatsapp,
            'email' => $this->email,
            'address' => $this->address,
            'city' => $this->city,
            'maps_url' => $this->maps_url,
            'opening_hours' => $this->opening_hours ?? Tenant::defaultOpeningHours(),
            'bay_count' => $this->bay_count,
            'published_at' => $this->published_at?->toIso8601String(),
            'publish_issues' => $this->publishIssues(),
            'plan' => $this->plan(),
            'pro_until' => $this->pro_until?->toIso8601String(),
            'features' => $this->features(),
            'stats' => [
                'packages' => $this->packages()->where('is_active', true)->count(),
                'addons' => $this->addons()->where('is_active', true)->count(),
            ],
        ];
    }
}
