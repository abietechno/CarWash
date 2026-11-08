<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Paket yang sudah ada dibuat untuk mobil, jadi tenant yang sudah live tidak otomatis menawarkan motor.
    public function up(): void
    {
        Schema::table('service_packages', function (Blueprint $table) {
            $table->string('vehicle_scope', 10)->default('car')->after('category'); // car | motor | all
        });
    }

    public function down(): void
    {
        Schema::table('service_packages', function (Blueprint $table) {
            $table->dropColumn('vehicle_scope');
        });
    }
};
