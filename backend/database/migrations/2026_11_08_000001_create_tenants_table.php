<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('subdomain', 40)->unique();
            $table->string('status', 20)->default('draft'); // draft | published | suspended
            $table->string('tagline')->nullable();
            $table->text('description')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('whatsapp', 30)->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('maps_url', 500)->nullable();
            $table->json('opening_hours')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('tenant_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->string('role', 20)->default('owner')->after('email');
            $table->string('phone', 30)->nullable()->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('tenant_id');
            $table->dropColumn(['role', 'phone']);
        });

        Schema::dropIfExists('tenants');
    }
};
