<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesPeriod;
use App\Http\Controllers\Api\Concerns\ResolvesTenant;
use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Services\FinanceReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    use ResolvesPeriod, ResolvesTenant;

    // Label diterjemahkan saat ekspor (lang/*.json); kuncinya teks Indonesia.
    private const CATEGORY_LABELS = [
        Transaction::CATEGORY_SALE => 'Penjualan',
        'supplies' => 'Bahan & perlengkapan',
        'salary' => 'Gaji karyawan',
        'utilities' => 'Listrik & air',
        'rent' => 'Sewa tempat',
        'equipment' => 'Peralatan',
        'other' => 'Lainnya',
    ];

    private const METHOD_LABELS = [
        'cash' => 'Tunai',
        'qris' => 'QRIS',
        'transfer' => 'Transfer',
        'debit' => 'Debit',
        'other' => 'Lainnya',
    ];

    private const HEADERS = ['Tanggal', 'Jam', 'Nomor', 'Jenis', 'Kategori', 'Keterangan', 'Pelanggan', 'Metode', 'Subtotal', 'Diskon', 'Total', 'Status', 'Alasan batal'];

    public function summary(Request $request, FinanceReport $report): JsonResponse
    {
        [$from, $to] = $this->period($request);

        return response()->json($report->summary($this->tenant($request), $from, $to));
    }

    // CSV + BOM. Excel berbahasa Indonesia memisah kolom dengan titik koma, Excel Inggris/Malaysia dengan koma.
    public function export(Request $request): StreamedResponse
    {
        [$from, $to] = $this->period($request);
        $separator = app()->getLocale() === 'id' ? ';' : ',';

        $transactions = $this->tenant($request)->transactions()
            ->with('items')
            ->whereBetween('business_date', [$from, $to])
            ->orderBy('business_date')
            ->orderBy('sequence');

        return response()->streamDownload(function () use ($transactions, $separator) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, array_map(fn (string $header) => __($header), self::HEADERS), $separator);

            foreach ($transactions->lazy(200) as $t) {
                fputcsv($out, [
                    $t->business_date,
                    $t->created_at?->setTimezone(config('saas.timezone'))->format('H:i'),
                    $t->number,
                    $t->type === Transaction::INCOME ? __('Masuk') : __('Keluar'),
                    isset(self::CATEGORY_LABELS[$t->category]) ? __(self::CATEGORY_LABELS[$t->category]) : $t->category,
                    $this->safeCell($this->describe($t)),
                    $this->safeCell((string) $t->customer_name),
                    isset(self::METHOD_LABELS[$t->payment_method]) ? __(self::METHOD_LABELS[$t->payment_method]) : $t->payment_method,
                    $t->subtotal,
                    $t->discount,
                    $t->amount,
                    $t->isVoided() ? __('Dibatalkan') : __('Sah'),
                    $this->safeCell((string) $t->void_reason),
                ], $separator);
            }

            fclose($out);
        }, __('laporan-:from-sd-:to', ['from' => $from, 'to' => $to]).'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function describe(Transaction $t): string
    {
        if ($t->items->isEmpty()) {
            return (string) $t->description;
        }

        return $t->items->map(fn (TransactionItem $i) => "{$i->qty}x {$i->name}")->implode(', ');
    }

    // Nama dari reservasi online bisa berisi apa saja; cegah dieksekusi sebagai rumus saat dibuka di Excel.
    private function safeCell(string $value): string
    {
        return preg_match('/^[=+\-@\t\r]/', $value) ? "'".$value : $value;
    }
}
