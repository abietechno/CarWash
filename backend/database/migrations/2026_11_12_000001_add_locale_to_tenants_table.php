<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Bahasa bawaan situs publik tenant (id|ms|en); pengunjung tetap bisa menggantinya.
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('locale', 5)->default('id')->after('city');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn('locale');
        });
    }
};
