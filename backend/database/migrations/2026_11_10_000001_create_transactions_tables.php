<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Buku kas tenant: penjualan dari kasir (masuk) dan pengeluaran (keluar).
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('type', 10); // income | expense
            $table->date('business_date'); // tanggal menurut zona waktu bisnis, dasar semua laporan
            $table->unsignedSmallInteger('sequence'); // urutan harian per tenant, bagian dari nomor transaksi
            $table->string('number', 30);
            $table->string('category', 30); // sale, atau kategori pengeluaran
            $table->string('description', 255)->nullable();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name', 100)->nullable();
            $table->string('customer_phone', 30)->nullable();
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('discount')->default(0);
            $table->unsignedInteger('amount');
            $table->string('payment_method', 20);
            $table->unsignedInteger('paid_amount')->nullable(); // uang diterima, hanya untuk tunai
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            // Transaksi tidak pernah dihapus: dibatalkan dengan alasan supaya pembukuan bisa ditelusuri.
            $table->timestamp('voided_at')->nullable();
            $table->string('void_reason', 200)->nullable();
            $table->foreignId('voided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['tenant_id', 'business_date', 'sequence']);
            $table->index(['tenant_id', 'business_date', 'type']);
            $table->index(['tenant_id', 'booking_id']);
        });

        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
            $table->string('item_type', 10); // booking | package | addon | custom
            $table->unsignedBigInteger('item_id')->nullable();
            // Snapshot saat transaksi, supaya riwayat tidak berubah kalau paket diedit/dihapus.
            $table->string('name');
            $table->unsignedSmallInteger('qty');
            $table->unsignedInteger('unit_price');
            $table->unsignedInteger('subtotal');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_items');
        Schema::dropIfExists('transactions');
    }
};
