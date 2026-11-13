<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesPeriod;
use App\Http\Controllers\Api\Concerns\ResolvesTenant;
use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Services\Cashier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class TransactionController extends Controller
{
    use ResolvesPeriod, ResolvesTenant;

    public function index(Request $request): AnonymousResourceCollection
    {
        [$from, $to] = $this->period($request);
        $filters = $request->validate([
            'type' => ['nullable', Rule::in([Transaction::INCOME, Transaction::EXPENSE])],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $search = isset($filters['search']) ? '%'.addcslashes($filters['search'], '%_\\').'%' : null;

        $transactions = $this->tenant($request)->transactions()
            ->with('items')
            ->whereBetween('business_date', [$from, $to])
            ->when($filters['type'] ?? null, fn ($query, $type) => $query->where('type', $type))
            ->when($search, fn ($query) => $query->where(fn ($q) => $q
                ->where('number', 'like', $search)
                ->orWhere('customer_name', 'like', $search)
                ->orWhere('description', 'like', $search)
                ->orWhereHas('items', fn ($item) => $item->where('name', 'like', $search))))
            ->orderByDesc('business_date')
            ->orderByDesc('sequence')
            ->paginate(20);

        return TransactionResource::collection($transactions);
    }

    public function show(Request $request, int $transaction): TransactionResource
    {
        return new TransactionResource($this->tenant($request)->transactions()->with('items')->findOrFail($transaction));
    }

    public function storeExpense(Request $request, Cashier $cashier): JsonResponse
    {
        // Batas "hari ini" menurut zona waktu bisnis; aturan bawaan today memakai UTC.
        $today = now(config('saas.timezone'))->toDateString();

        $data = $request->validate([
            'category' => ['required', Rule::in(Transaction::EXPENSE_CATEGORIES)],
            'amount' => ['required', 'integer', 'min:1', 'max:2000000000'],
            'payment_method' => ['required', Rule::in(Transaction::PAYMENT_METHODS)],
            'description' => ['nullable', 'required_if:category,other', 'string', 'max:255'],
            'business_date' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:'.$today],
        ], [
            'description.required_if' => __('Tulis keterangan untuk pengeluaran lainnya.'),
            'business_date.before_or_equal' => __('Tanggal pengeluaran tidak boleh di masa depan.'),
        ]);

        $transaction = $cashier->recordExpense($this->tenant($request), $request->user(), $data);

        return (new TransactionResource($transaction))->response()->setStatusCode(201);
    }

    // Transaksi tidak dihapus, hanya dibatalkan; pembayaran antrian otomatis kembali "belum bayar".
    public function void(Request $request, int $transaction, Cashier $cashier): TransactionResource
    {
        $model = $this->tenant($request)->transactions()->findOrFail($transaction);
        $data = $request->validate(['reason' => ['required', 'string', 'max:200']]);

        return new TransactionResource($cashier->void($model, $request->user(), $data['reason']));
    }
}
