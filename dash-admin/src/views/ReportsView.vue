<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Download, LoaderCircle, Plus, Search } from '@lucide/vue'
import ChipButton from '@/components/ChipButton.vue'
import PageHeader from '@/components/PageHeader.vue'
import TransactionDialog from '@/components/pos/TransactionDialog.vue'
import CashFlowChart from '@/components/reports/CashFlowChart.vue'
import ExpenseDialog from '@/components/reports/ExpenseDialog.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { api, errorMessage } from '@/lib/api'
import { clock, dateInputValue, EXPENSE_CATEGORIES, rupiah, shortDate, TRANSACTION_METHODS } from '@/lib/format'
import type { Paginated, ReportSummary, Transaction, TransactionType } from '@/types'

type Preset = 'today' | 'week' | 'month' | 'last-month' | 'custom'

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'today', label: 'Hari ini' },
  { key: 'week', label: '7 hari' },
  { key: 'month', label: 'Bulan ini' },
  { key: 'last-month', label: 'Bulan lalu' },
  { key: 'custom', label: 'Pilih tanggal' },
]

const localDate = (date: Date) => dateInputValue(date.toISOString())

function presetRange(preset: Exclude<Preset, 'custom'>): [string, string] {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  switch (preset) {
    case 'today':
      return [localDate(now), localDate(now)]
    case 'week':
      return [localDate(new Date(year, month, now.getDate() - 6)), localDate(now)]
    case 'month':
      return [localDate(new Date(year, month, 1)), localDate(now)]
    case 'last-month':
      return [localDate(new Date(year, month - 1, 1)), localDate(new Date(year, month, 0))]
  }
}

const preset = ref<Preset>('month')
const [initialFrom, initialTo] = presetRange('month')
const from = ref(initialFrom)
const to = ref(initialTo)

const report = ref<ReportSummary | null>(null)
const list = ref<Paginated<Transaction> | null>(null)
const page = ref(1)
const typeFilter = ref<TransactionType | null>(null)
const search = ref('')
const exporting = ref(false)
const expenseOpen = ref(false)
const detail = ref<Transaction | null>(null)
const detailOpen = ref(false)

const period = computed(() => ({ from: from.value, to: to.value }))
const periodValid = computed(() => !!from.value && !!to.value && from.value <= to.value)

async function loadReport() {
  if (!periodValid.value) return
  try {
    report.value = (await api.get<ReportSummary>('/reports/summary', { params: period.value })).data
  } catch (e) {
    toast.error(errorMessage(e, 'Gagal memuat laporan.'))
  }
}

async function loadList() {
  if (!periodValid.value) return
  try {
    const params = { ...period.value, page: page.value, type: typeFilter.value ?? undefined, search: search.value.trim() || undefined }
    list.value = (await api.get<Paginated<Transaction>>('/transactions', { params })).data
  } catch (e) {
    toast.error(errorMessage(e, 'Gagal memuat transaksi.'))
  }
}

function reloadAll() {
  loadReport()
  loadList()
}

onMounted(reloadAll)

function choosePreset(value: Preset) {
  preset.value = value
  if (value === 'custom') return
  ;[from.value, to.value] = presetRange(value)
}

watch(period, () => {
  page.value = 1
  reloadAll()
})
watch(typeFilter, () => {
  page.value = 1
  loadList()
})
watch(page, loadList)

const searchNow = useDebounceFn(() => {
  page.value = 1
  loadList()
}, 300)

function txTitle(tx: Transaction) {
  if (tx.type === 'expense') return tx.description || (EXPENSE_CATEGORIES[tx.category] ?? tx.category)
  return tx.items.map((i) => i.name).join(', ')
}

function txSubtitle(tx: Transaction) {
  const who = tx.type === 'income' ? tx.customer_name : EXPENSE_CATEGORIES[tx.category]
  return [tx.number, `${shortDate(`${tx.business_date}T00:00:00`)} ${clock(tx.created_at)}`, TRANSACTION_METHODS[tx.payment_method], who].filter(Boolean).join(' · ')
}

function open(tx: Transaction) {
  detail.value = tx
  detailOpen.value = true
}

async function exportCsv() {
  exporting.value = true
  try {
    const { data } = await api.get<Blob>('/reports/export', { params: period.value, responseType: 'blob' })
    const url = URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = `laporan-${from.value}-sd-${to.value}.csv`
    link.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    toast.error(errorMessage(e, 'Gagal mengunduh laporan.'))
  } finally {
    exporting.value = false
  }
}

const share = (value: number, total: number) => `${total > 0 ? Math.round((value / total) * 100) : 0}%`
</script>

<template>
  <PageHeader title="Laporan" description="Uang masuk dan keluar">
    <template #actions>
      <Button variant="ghost" size="icon" :disabled="exporting || !periodValid" aria-label="Unduh CSV" @click="exportCsv">
        <LoaderCircle v-if="exporting" class="animate-spin" />
        <Download v-else />
      </Button>
      <Button @click="expenseOpen = true"><Plus /> Pengeluaran</Button>
    </template>
  </PageHeader>

  <div class="space-y-4 p-4 sm:p-6">
    <div class="flex flex-wrap items-center gap-2">
      <ChipButton v-for="p in PRESETS" :key="p.key" :active="preset === p.key" @click="choosePreset(p.key)">{{ p.label }}</ChipButton>
    </div>
    <div v-if="preset === 'custom'" class="flex flex-wrap items-center gap-2">
      <Input v-model="from" type="date" class="w-auto" aria-label="Dari tanggal" :max="to" />
      <span class="text-sm text-muted-foreground">sampai</span>
      <Input v-model="to" type="date" class="w-auto" aria-label="Sampai tanggal" :min="from" />
    </div>

    <div v-if="!report" class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Skeleton v-for="i in 4" :key="i" class="h-24 rounded-2xl" />
    </div>

    <template v-else>
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4 [--series-in:#2a78d6] [--series-out:#eb6834] dark:[--series-in:#3987e5] dark:[--series-out:#d95926]">
        <Card size="sm">
          <CardContent>
            <p class="flex items-center gap-1.5 text-sm text-muted-foreground"><ArrowDownLeft class="h-3.5 w-3.5 text-(--series-in)" /> Uang masuk</p>
            <p class="mt-1 truncate font-display text-xl font-bold tabular-nums sm:text-2xl">{{ rupiah(report.income) }}</p>
            <p class="text-xs text-muted-foreground">{{ report.sales_count }} penjualan</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent>
            <p class="flex items-center gap-1.5 text-sm text-muted-foreground"><ArrowUpRight class="h-3.5 w-3.5 text-(--series-out)" /> Uang keluar</p>
            <p class="mt-1 truncate font-display text-xl font-bold tabular-nums sm:text-2xl">{{ rupiah(report.expense) }}</p>
            <p class="text-xs text-muted-foreground">{{ report.expense_count }} pengeluaran</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent>
            <p class="text-sm text-muted-foreground">Bersih</p>
            <p class="mt-1 truncate font-display text-xl font-bold tabular-nums sm:text-2xl">{{ report.net < 0 ? '−' : '' }}{{ rupiah(Math.abs(report.net)) }}</p>
            <p class="text-xs text-muted-foreground">{{ report.net < 0 ? 'Pengeluaran lebih besar' : 'Masuk dikurangi keluar' }}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent>
            <p class="text-sm text-muted-foreground">Rata-rata penjualan</p>
            <p class="mt-1 truncate font-display text-xl font-bold tabular-nums sm:text-2xl">{{ rupiah(report.average_sale) }}</p>
            <p class="text-xs text-muted-foreground">Total diskon {{ rupiah(report.discount) }}</p>
          </CardContent>
        </Card>
      </div>

      <Card v-if="report.income || report.expense">
        <CardHeader><CardTitle class="text-base">Arus kas</CardTitle></CardHeader>
        <CardContent><CashFlowChart :series="report.series" :granularity="report.granularity" /></CardContent>
      </Card>

      <div v-if="report.income || report.expense" class="grid gap-4 lg:grid-cols-3 [--series-in:#2a78d6] [--series-out:#eb6834] dark:[--series-in:#3987e5] dark:[--series-out:#d95926]">
        <Card size="sm">
          <CardHeader><CardTitle class="text-base">Metode pembayaran</CardTitle></CardHeader>
          <CardContent class="space-y-3 text-sm">
            <p v-if="!report.by_method.length" class="text-muted-foreground">Belum ada penjualan.</p>
            <div v-for="row in report.by_method" :key="row.key">
              <p class="flex justify-between gap-2"><span>{{ TRANSACTION_METHODS[row.key] ?? row.key }}</span> <span class="tabular-nums">{{ rupiah(row.total) }}</span></p>
              <div class="mt-1 h-1.5 rounded-full bg-muted"><div class="h-full rounded-full bg-(--series-in)" :style="{ width: share(row.total, report.income) }" /></div>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader><CardTitle class="text-base">Pengeluaran per kategori</CardTitle></CardHeader>
          <CardContent class="space-y-3 text-sm">
            <p v-if="!report.by_category.length" class="text-muted-foreground">Belum ada pengeluaran.</p>
            <div v-for="row in report.by_category" :key="row.key">
              <p class="flex justify-between gap-2"><span>{{ EXPENSE_CATEGORIES[row.key] ?? row.key }}</span> <span class="tabular-nums">{{ rupiah(row.total) }}</span></p>
              <div class="mt-1 h-1.5 rounded-full bg-muted"><div class="h-full rounded-full bg-(--series-out)" :style="{ width: share(row.total, report.expense) }" /></div>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader><CardTitle class="text-base">Layanan terlaris</CardTitle></CardHeader>
          <CardContent class="space-y-2 text-sm">
            <p v-if="!report.top_items.length" class="text-muted-foreground">Belum ada penjualan.</p>
            <p v-for="item in report.top_items" :key="item.name" class="flex justify-between gap-2">
              <span class="min-w-0 truncate">{{ item.name }} <span class="text-muted-foreground">×{{ item.qty }}</span></span>
              <span class="shrink-0 tabular-nums">{{ rupiah(item.total) }}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </template>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Transaksi</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <ChipButton :active="typeFilter === null" @click="typeFilter = null">Semua</ChipButton>
          <ChipButton :active="typeFilter === 'income'" @click="typeFilter = 'income'">Masuk</ChipButton>
          <ChipButton :active="typeFilter === 'expense'" @click="typeFilter = 'expense'">Keluar</ChipButton>
          <div class="relative min-w-40 flex-1">
            <Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input v-model="search" class="pl-9" placeholder="Cari nomor, pelanggan, item" aria-label="Cari transaksi" @input="searchNow" />
          </div>
        </div>

        <Skeleton v-if="!list" class="h-40 rounded-xl" />
        <p v-else-if="!list.data.length" class="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Belum ada transaksi di periode ini. Penjualan dari
          <RouterLink to="/kasir" class="font-medium text-foreground underline underline-offset-2">Kasir</RouterLink>
          dan pengeluaran yang dicatat akan muncul di sini.
        </p>

        <ul v-else class="divide-y divide-border/50">
          <li v-for="tx in list.data" :key="tx.id">
            <button type="button" class="flex w-full items-center gap-3 py-2.5 text-left transition-opacity hover:opacity-70" @click="open(tx)">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                <ArrowDownLeft v-if="tx.type === 'income'" class="h-4 w-4" />
                <ArrowUpRight v-else class="h-4 w-4" />
              </span>
              <span class="min-w-0 flex-1">
                <span :class="['block truncate text-sm font-medium', tx.voided_at && 'text-muted-foreground line-through']">{{ txTitle(tx) }}</span>
                <span class="block truncate text-xs text-muted-foreground">{{ txSubtitle(tx) }}</span>
              </span>
              <Badge v-if="tx.voided_at" variant="outline">Dibatalkan</Badge>
              <span :class="['shrink-0 text-sm font-semibold tabular-nums', tx.voided_at && 'text-muted-foreground line-through']">
                {{ tx.type === 'income' ? '+' : '−' }}{{ rupiah(tx.amount) }}
              </span>
            </button>
          </li>
        </ul>

        <div v-if="list && list.meta.last_page > 1" class="flex items-center justify-between pt-1">
          <Button variant="outline" size="sm" :disabled="page <= 1" @click="page--"><ChevronLeft /> Sebelumnya</Button>
          <span class="text-xs text-muted-foreground">Halaman {{ list.meta.current_page }} dari {{ list.meta.last_page }}</span>
          <Button variant="outline" size="sm" :disabled="page >= list.meta.last_page" @click="page++">Berikutnya <ChevronRight /></Button>
        </div>
      </CardContent>
    </Card>
  </div>

  <ExpenseDialog v-model:open="expenseOpen" @saved="reloadAll" />
  <TransactionDialog v-model:open="detailOpen" :transaction="detail" @voided="reloadAll" />
</template>
