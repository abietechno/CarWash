<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            // Pro aktif selama pro_until di masa depan; lewat dari itu otomatis kembali Gratis.
            $table->timestamp('pro_until')->nullable()->after('status');
            $table->timestamp('suspended_at')->nullable()->after('published_at');
        });

        Schema::create('subscription_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('period', 10); // monthly | yearly
            $table->unsignedInteger('amount');
            $table->string('method', 20); // transfer | qris | cash | other
            $table->string('reference', 100)->nullable();
            $table->string('note', 255)->nullable();
            $table->date('paid_at');
            $table->timestamp('period_start');
            $table->timestamp('period_end');
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['tenant_id', 'paid_at']);
        });

        Schema::create('platform_settings', function (Blueprint $table) {
            $table->string('key', 50)->primary();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('tenant_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 50);
            $table->json('meta')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['tenant_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('platform_settings');
        Schema::dropIfExists('subscription_payments');

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['pro_until', 'suspended_at']);
        });
    }
};
