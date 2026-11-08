<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const TYPES = [
        ['code' => 'motor_matic', 'name' => 'Motor Matic', 'examples' => 'Beat, Vario, Scoopy, NMAX', 'price_multiplier' => 0.3, 'sort_order' => 5],
        ['code' => 'motor_listrik', 'name' => 'Electric Vehicle (Molis)', 'examples' => 'Gesits, Alva One, Polytron Fox', 'price_multiplier' => 0.3, 'sort_order' => 6],
        ['code' => 'motor_manual', 'name' => 'Motor Manual', 'examples' => 'Supra, Vixion, CB150R, Ninja', 'price_multiplier' => 0.3, 'sort_order' => 7],
    ];

    // Tenant yang sudah terdaftar ikut mendapat jenis motor; tenant baru dari TenantProvisioner.
    public function up(): void
    {
        $now = now();

        foreach (DB::table('tenants')->pluck('id') as $tenantId) {
            foreach (self::TYPES as $type) {
                DB::table('vehicle_types')->insertOrIgnore([...$type, 'tenant_id' => $tenantId, 'created_at' => $now, 'updated_at' => $now]);
            }
        }
    }

    public function down(): void
    {
        DB::table('vehicle_types')->whereIn('code', array_column(self::TYPES, 'code'))->delete();
    }
};
