<script setup lang="ts">
import { computed, ref } from 'vue'
import { intlLocale, t } from '@/i18n'
import { compactRupiah, rupiah } from '@/lib/format'
import type { ReportPoint } from '@/types'

// Batang uang masuk vs keluar per hari/bulan. Warna tervalidasi kontras & buta warna untuk kedua tema.
const props = defineProps<{ series: ReportPoint[]; granularity: 'day' | 'month' }>()

const MAX_X_LABELS = 7

const active = ref<number | null>(null)

// Kelipatan 1-2-5 supaya garis bantu jatuh di angka bulat.
const scale = computed(() => {
  const peak = Math.max(0, ...props.series.flatMap((p) => [p.income, p.expense]))
  if (peak === 0) return { top: 1, ticks: [0] }
  const rough = peak / 4
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const normalized = rough / magnitude
  const step = (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude
  const top = Math.ceil(peak / step) * step
  const ticks: number[] = []
  for (let v = 0; v <= top; v += step) ticks.push(v)
  return { top, ticks }
})

const stride = computed(() => Math.max(1, Math.ceil(props.series.length / MAX_X_LABELS)))

function parseDate(key: string) {
  return new Date(props.granularity === 'month' ? `${key}-01T00:00:00` : `${key}T00:00:00`)
}

function axisLabel(key: string) {
  const date = parseDate(key)
  return props.granularity === 'month'
    ? date.toLocaleDateString(intlLocale(), { month: 'short' })
    : date.toLocaleDateString(intlLocale(), { day: 'numeric', month: 'short' })
}

function fullLabel(key: string) {
  const date = parseDate(key)
  return props.granularity === 'month'
    ? date.toLocaleDateString(intlLocale(), { month: 'long', year: 'numeric' })
    : date.toLocaleDateString(intlLocale(), { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
}

const barHeight = (value: number) => (value > 0 ? `max(2px, ${(value / scale.value.top) * 100}%)` : '0')

const activePoint = computed(() => (active.value === null ? null : (props.series[active.value] ?? null)))
const tooltipStyle = computed(() => {
  if (active.value === null) return {}
  const center = ((active.value + 0.5) / props.series.length) * 100
  // Di paruh kanan tooltip menempel ke kiri titik, supaya tidak keluar dari kartu.
  return center > 50 ? { right: `${100 - center}%`, marginRight: '8px' } : { left: `${center}%`, marginLeft: '8px' }
})
const summary = computed(() => {
  const income = props.series.reduce((sum, p) => sum + p.income, 0)
  const expense = props.series.reduce((sum, p) => sum + p.expense, 0)
  return t('chart.summary', { income: rupiah(income), expense: rupiah(expense) })
})
</script>

<template>
  <div class="[--series-in:#2a78d6] [--series-out:#eb6834] dark:[--series-in:#3987e5] dark:[--series-out:#d95926]">
    <div class="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
      <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-[3px] bg-(--series-in)" /> {{ t('chart.income') }}</span>
      <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-[3px] bg-(--series-out)" /> {{ t('chart.expense') }}</span>
    </div>

    <div class="flex" role="img" :aria-label="summary">
      <div class="relative h-52 w-11 shrink-0 text-right text-[11px] text-muted-foreground">
        <span
          v-for="tick in scale.ticks"
          :key="tick"
          class="absolute right-2 -translate-y-1/2 tabular-nums"
          :style="{ top: `${100 - (tick / scale.top) * 100}%` }"
        >{{ compactRupiah(tick) }}</span>
      </div>

      <div class="min-w-0 flex-1">
        <div class="relative h-52" @pointerleave="active = null">
          <div
            v-for="tick in scale.ticks"
            :key="tick"
            :class="['absolute inset-x-0 border-t', tick === 0 ? 'border-border' : 'border-border/40']"
            :style="{ top: `${100 - (tick / scale.top) * 100}%` }"
          />

          <div class="absolute inset-0 flex">
            <div
              v-for="(point, i) in series"
              :key="point.date"
              :class="['flex h-full min-w-0 flex-1 items-end justify-center gap-[2px] rounded-t-md', active === i && 'bg-muted/50']"
              @pointerenter="active = i"
              @pointerdown="active = i"
            >
              <span class="min-h-0 w-full max-w-3 rounded-t-[4px] bg-(--series-in)" :style="{ height: barHeight(point.income) }" />
              <span class="min-h-0 w-full max-w-3 rounded-t-[4px] bg-(--series-out)" :style="{ height: barHeight(point.expense) }" />
            </div>
          </div>

          <div
            v-if="activePoint"
            class="pointer-events-none absolute top-1 z-10 w-44 rounded-xl border border-border bg-popover p-2.5 text-xs shadow-lg"
            :style="tooltipStyle"
          >
            <p class="mb-1.5 text-muted-foreground">{{ fullLabel(activePoint.date) }}</p>
            <p class="flex items-center gap-2"><span class="h-0.5 w-3 bg-(--series-in)" /> <span class="font-semibold tabular-nums">{{ rupiah(activePoint.income) }}</span> <span class="ml-auto text-muted-foreground">{{ t('chart.in') }}</span></p>
            <p class="mt-0.5 flex items-center gap-2"><span class="h-0.5 w-3 bg-(--series-out)" /> <span class="font-semibold tabular-nums">{{ rupiah(activePoint.expense) }}</span> <span class="ml-auto text-muted-foreground">{{ t('chart.out') }}</span></p>
          </div>
        </div>

        <div class="mt-1.5 flex h-4 text-[11px] text-muted-foreground">
          <div v-for="(point, i) in series" :key="point.date" class="relative min-w-0 flex-1">
            <span v-if="i % stride === 0" class="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">{{ axisLabel(point.date) }}</span>
          </div>
        </div>
      </div>
    </div>

    <details class="mt-4 text-sm">
      <summary class="cursor-pointer text-xs text-muted-foreground hover:text-foreground">{{ t('chart.table') }}</summary>
      <div class="mt-2 max-h-64 overflow-y-auto">
        <table class="w-full tabular-nums">
          <thead class="text-left text-xs text-muted-foreground">
            <tr><th class="py-1 font-medium">{{ granularity === 'month' ? t('chart.month') : t('chart.date') }}</th><th class="py-1 text-right font-medium">{{ t('chart.in') }}</th><th class="py-1 text-right font-medium">{{ t('chart.out') }}</th></tr>
          </thead>
          <tbody class="divide-y divide-border/40">
            <tr v-for="point in series" :key="point.date">
              <td class="py-1">{{ fullLabel(point.date) }}</td>
              <td class="py-1 text-right">{{ rupiah(point.income) }}</td>
              <td class="py-1 text-right">{{ rupiah(point.expense) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </div>
</template>
