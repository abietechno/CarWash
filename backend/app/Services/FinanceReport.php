<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Relations\HasMany;

// Laporan uang masuk & keluar per periode. Transaksi yang dibatalkan tidak dihitung.
class FinanceReport
{
    // Lebih dari ini grafik dikelompokkan per bulan supaya batangnya tetap terbaca.
    private const MAX_DAILY_POINTS = 35;

    public function summary(Tenant $tenant, string $from, string $to): array
    {
        $base = fn (): HasMany => $tenant->transactions()->active()->whereBetween('business_date', [$from, $to]);

        $totals = $base()
            ->selectRaw('type, COUNT(*) as count, SUM(amount) as total, SUM(discount) as discount')
            ->groupBy('type')
            ->get()
            ->keyBy('type');

        $income = (int) ($totals[Transaction::INCOME]->total ?? 0);
        $expense = (int) ($totals[Transaction::EXPENSE]->total ?? 0);
        $sales = (int) ($totals[Transaction::INCOME]->count ?? 0);

        return [
            'from' => $from,
            'to' => $to,
            'income' => $income,
            'expense' => $expense,
            'net' => $income - $expense,
            'sales_count' => $sales,
            'expense_count' => (int) ($totals[Transaction::EXPENSE]->count ?? 0),
            'average_sale' => $sales > 0 ? (int) round($income / $sales) : 0,
            'discount' => (int) ($totals[Transaction::INCOME]->discount ?? 0),
            'voided_count' => $tenant->transactions()->whereNotNull('voided_at')->whereBetween('business_date', [$from, $to])->count(),
            ...$this->series($base, $from, $to),
            'by_method' => $this->breakdown($base, Transaction::INCOME, 'payment_method'),
            'by_category' => $this->breakdown($base, Transaction::EXPENSE, 'category'),
            'top_items' => $this->topItems($base),
        ];
    }

    /** @return array{granularity: string, series: list<array{date: string, income: int, expense: int}>} */
    private function series(callable $base, string $from, string $to): array
    {
        $start = CarbonImmutable::parse($from);
        $end = CarbonImmutable::parse($to);
        $monthly = $start->diffInDays($end) + 1 > self::MAX_DAILY_POINTS;

        $buckets = [];
        $cursor = $monthly ? $start->startOfMonth() : $start;
        while ($cursor <= $end) {
            $key = $cursor->format($monthly ? 'Y-m' : 'Y-m-d');
            $buckets[$key] = ['date' => $key, 'income' => 0, 'expense' => 0];
            $cursor = $monthly ? $cursor->addMonth() : $cursor->addDay();
        }

        $rows = $base()->selectRaw('business_date, type, SUM(amount) as total')->groupBy('business_date', 'type')->get();

        foreach ($rows as $row) {
            $key = substr((string) $row->business_date, 0, $monthly ? 7 : 10);
            if (isset($buckets[$key])) {
                $buckets[$key][$row->type] += (int) $row->total;
            }
        }

        return ['granularity' => $monthly ? 'month' : 'day', 'series' => array_values($buckets)];
    }

    /** @return list<array{key: string, total: int, count: int}> */
    private function breakdown(callable $base, string $type, string $column): array
    {
        return $base()
            ->where('type', $type)
            ->selectRaw("$column as group_key, SUM(amount) as total, COUNT(*) as count")
            ->groupBy($column)
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => ['key' => $row->group_key, 'total' => (int) $row->total, 'count' => (int) $row->count])
            ->all();
    }

    /** @return list<array{name: string, qty: int, total: int}> */
    private function topItems(callable $base): array
    {
        return TransactionItem::query()
            ->whereIn('transaction_id', $base()->where('type', Transaction::INCOME)->select('id'))
            ->selectRaw('name, SUM(qty) as qty, SUM(subtotal) as total')
            ->groupBy('name')
            ->orderByDesc('total')
            ->limit(8)
            ->get()
            ->map(fn ($row) => ['name' => $row->name, 'qty' => (int) $row->qty, 'total' => (int) $row->total])
            ->all();
    }
}
