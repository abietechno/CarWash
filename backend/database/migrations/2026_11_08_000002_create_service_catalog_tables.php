<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('code', 20); // compact | medium | large | luxury
            $table->string('name');
            $table->string('examples')->nullable();
            $table->decimal('price_multiplier', 4, 2)->default(1);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['tenant_id', 'code']);
        });

        Schema::create('service_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('category', 20); // wash | salon | coating
            $table->string('tagline')->nullable();
            $table->unsignedInteger('price'); // harga dasar (kendaraan compact), rupiah
            $table->unsignedSmallInteger('duration_minutes');
            $table->text('description')->nullable();
            $table->json('features')->nullable();
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['tenant_id', 'sort_order']);
        });

        Schema::create('service_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('category', 20); // interior | exterior | protection
            $table->unsignedInteger('price');
            $table->unsignedSmallInteger('duration_minutes');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['tenant_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_addons');
        Schema::dropIfExists('service_packages');
        Schema::dropIfExists('vehicle_types');
    }
};
