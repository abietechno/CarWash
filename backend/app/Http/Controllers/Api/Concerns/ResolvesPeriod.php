<?php

namespace App\Http\Controllers\Api\Concerns;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

trait ResolvesPeriod
{
    private const MAX_PERIOD_DAYS = 366;

    /**
     * Periode laporan (Y-m-d, zona waktu bisnis); bawaan hari ini.
     *
     * @return array{0: string, 1: string}
     */
    protected function period(Request $request): array
    {
        $data = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $today = now(config('saas.timezone'))->toDateString();
        $from = $data['from'] ?? $today;
        $to = $data['to'] ?? $today;

        if ($to < $from) {
            throw ValidationException::withMessages(['to' => __('Tanggal akhir harus setelah tanggal awal.')]);
        }

        if (CarbonImmutable::parse($from)->diffInDays($to) > self::MAX_PERIOD_DAYS) {
            throw ValidationException::withMessages(['to' => __('Periode laporan maksimal 1 tahun.')]);
        }

        return [$from, $to];
    }
}
