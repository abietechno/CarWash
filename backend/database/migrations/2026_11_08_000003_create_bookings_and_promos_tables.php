<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->unsignedTinyInteger('bay_count')->default(2)->after('opening_hours'); // tempat cuci yang bisa jalan bersamaan
        });

        Schema::table('service_packages', function (Blueprint $table) {
            $table->string('image_path')->nullable()->after('features');
        });

        Schema::create('promos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('title', 100);
            $table->string('subtitle', 200)->nullable();
            $table->string('badge', 40)->nullable();
            $table->foreignId('service_package_id')->nullable()->constrained()->nullOnDelete();
            $table->string('image_path')->nullable();
            $table->string('theme', 20)->default('blue');
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['tenant_id', 'sort_order']);
        });

        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->date('queue_date');
            $table->unsignedSmallInteger('queue_number'); // tampil sebagai A-001, reset tiap hari
            $table->string('source', 10)->default('online'); // online | walk_in
            $table->string('customer_name', 100);
            $table->string('phone', 30)->nullable();
            $table->string('vehicle_type', 20);
            $table->string('vehicle_color', 20)->default('white');
            $table->string('plate', 20)->nullable();
            $table->foreignId('service_package_id')->nullable()->constrained()->nullOnDelete();
            // Snapshot saat booking, supaya riwayat tidak berubah kalau paket diedit/dihapus.
            $table->string('package_name');
            $table->unsignedInteger('price');
            $table->unsignedSmallInteger('duration_minutes');
            $table->string('status', 20)->default('waiting'); // waiting | in_progress | done | picked_up | cancelled
            $table->unsignedTinyInteger('bay')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'queue_date', 'queue_number']);
            $table->index(['tenant_id', 'queue_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('promos');

        Schema::table('service_packages', function (Blueprint $table) {
            $table->dropColumn('image_path');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn('bay_count');
        });
    }
};
