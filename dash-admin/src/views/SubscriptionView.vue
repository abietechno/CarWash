<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { Check, Crown, LoaderCircle, MessageCircle, RefreshCw, X } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { api, errorMessage } from '@/lib/api'
import { daysUntil, rupiah, shortDate } from '@/lib/format'
import { renewalState, whatsappUrl } from '@/lib/plans'
import { useAuthStore } from '@/stores/auth'
import type { PaymentPeriod, Subscription } from '@/types'

const auth = useAuthStore()
const sub = ref<Subscription | null>(null)
const period = ref<PaymentPeriod>('monthly')
const refreshing = ref(false)

async function load() {
  sub.value = (await api.get<Subscription>('/subscription')).data
}

onMounted(async () => {
  try {
    await load()
  } catch (e) {
    toast.error(errorMessage(e))
  }
})

// Setelah admin mencatat pembayaran: muat ulang status & fitur tanpa perlu login ulang.
async function refresh() {
  refreshing.value = true
  try {
    await Promise.all([load(), auth.fetchMe()])
    toast.success(sub.value?.plan === 'pro' ? `Pro aktif sampai ${shortDate(sub.value.pro_until)}.` : 'Status diperbarui.')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    refreshing.value = false
  }
}

const FEATURES = [
  { label: 'Situs dengan subdomain sendiri', free: true },
  { label: 'Papan antrian realtime & walk-in', free: true },
  { label: 'Paket layanan aktif', free: 'Maks. 3', pro: 'Tanpa batas' },
  { label: 'Foto promo slider di beranda', free: '1 foto', pro: '25 foto' },
  { label: 'Reservasi online dari situs', free: false },
  { label: 'Logo sendiri di header situs', free: false },
  { label: 'Tanpa label "Dibuat dengan CarWash Cloud"', free: false },
]

const left = computed(() => daysUntil(sub.value?.pro_until ?? null))
const renewal = computed(() => (sub.value ? renewalState(sub.value.plan, sub.value.pro_until) : null))

const periods = computed(() => {
  if (!sub.value) return []
  const { monthly, yearly } = sub.value.prices
  const saving = monthly * 12 - yearly
  return [
    { value: 'monthly' as const, label: 'Bulanan', price: monthly, note: '1 bulan' },
    { value: 'yearly' as const, label: 'Tahunan', price: yearly, note: saving > 0 ? `12 bulan · hemat ${rupiah(saving)}` : '12 bulan' },
  ]
})
const selected = computed(() => periods.value.find((p) => p.value === period.value))

const waConfirm = computed(() => {
  if (!sub.value || !selected.value) return null
  const text = [
    `Halo admin CarWash Cloud, saya sudah transfer ${rupiah(selected.value.price)} untuk ${sub.value.plan === 'pro' ? 'perpanjang' : 'berlangganan'} Pro ${selected.value.label}.`,
    `Bisnis: ${auth.tenant?.name}`,
    `Situs: ${auth.tenant?.url}`,
    `Email akun: ${auth.user?.email}`,
    'Bukti transfer saya lampirkan.',
  ].join('\n')
  return whatsappUrl(sub.value.contact_whatsapp, text)
})

const waAsk = computed(() =>
  whatsappUrl(
    sub.value?.contact_whatsapp,
    `Halo admin CarWash Cloud, saya dari ${auth.tenant?.name} (${auth.tenant?.url}). Saya mau tanya soal langganan Pro.`,
  ),
)
</script>

<template>
  <PageHeader title="Langganan" :description="auth.tenant?.name" />

  <div v-if="!sub" class="space-y-4 p-4 sm:p-6">
    <Skeleton v-for="i in 3" :key="i" class="h-40 rounded-2xl" />
  </div>

  <div v-else class="space-y-4 p-4 pb-24 sm:p-6 sm:pb-24">
    <Card :class="sub.plan === 'pro' ? 'ring-violet-500/40' : ''">
      <CardHeader>
        <div class="flex items-center gap-3">
          <span :class="['flex h-11 w-11 items-center justify-center rounded-xl', sub.plan === 'pro' ? 'bg-violet-500/15 text-violet-400' : 'bg-muted']">
            <Crown class="h-5 w-5" />
          </span>
          <div>
            <CardTitle class="text-lg">Paket {{ sub.plan === 'pro' ? 'Pro' : 'Gratis' }}</CardTitle>
            <CardDescription :class="renewal ? (renewal.kind === 'expiring' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400') : ''">
              <template v-if="sub.plan === 'pro'">Aktif sampai {{ shortDate(sub.pro_until) }} · {{ left }} hari lagi</template>
              <template v-else-if="sub.pro_until">Pro berakhir {{ shortDate(sub.pro_until) }}. Perpanjang untuk mengaktifkan lagi fitur Pro.</template>
              <template v-else>Upgrade ke Pro untuk reservasi online, 25 foto promo, dan logo sendiri.</template>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>

    <Card>
      <CardHeader><CardTitle class="text-base">Gratis vs Pro</CardTitle></CardHeader>
      <CardContent>
        <div class="grid grid-cols-[1fr_5rem_6rem] gap-y-3 text-sm">
          <span />
          <span class="text-center text-xs font-semibold text-muted-foreground">Gratis</span>
          <span class="text-center text-xs font-semibold text-violet-400">Pro</span>
          <template v-for="f in FEATURES" :key="f.label">
            <span>{{ f.label }}</span>
            <span class="flex justify-center text-muted-foreground">
              <template v-if="typeof f.free === 'string'">{{ f.free }}</template>
              <Check v-else-if="f.free" class="h-4 w-4 text-emerald-500" />
              <X v-else class="h-4 w-4" />
            </span>
            <span class="flex justify-center">
              <template v-if="f.pro">{{ f.pro }}</template>
              <Check v-else class="h-4 w-4 text-emerald-500" />
            </span>
          </template>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Cara {{ sub.plan === 'pro' ? 'memperpanjang' : 'berlangganan' }} Pro</CardTitle>
        <CardDescription>Pembayaran sementara manual lewat transfer, dikonfirmasi admin.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol class="space-y-6">
          <li class="flex gap-4">
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">1</span>
            <div class="min-w-0 flex-1 space-y-3">
              <p class="font-medium">Pilih periode</p>
              <div role="radiogroup" aria-label="Periode langganan" class="grid gap-2 sm:grid-cols-2">
                <button
                  v-for="p in periods"
                  :key="p.value"
                  type="button"
                  role="radio"
                  :aria-checked="period === p.value"
                  :class="[
                    'rounded-xl border p-3 text-left transition-colors',
                    period === p.value ? 'border-violet-500 bg-violet-500/10' : 'border-border hover:bg-accent',
                  ]"
                  @click="period = p.value"
                >
                  <span class="block text-sm text-muted-foreground">{{ p.label }}</span>
                  <span class="block text-lg font-bold">{{ rupiah(p.price) }}</span>
                  <span class="block text-xs text-muted-foreground">{{ p.note }}</span>
                </button>
              </div>
            </div>
          </li>

          <li class="flex gap-4">
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">2</span>
            <div class="min-w-0 flex-1 space-y-3">
              <p class="font-medium">Transfer {{ selected ? rupiah(selected.price) : '' }}</p>
              <p v-if="sub.payment_instructions" class="rounded-xl bg-muted/60 p-4 text-sm whitespace-pre-line">{{ sub.payment_instructions }}</p>
              <p v-else class="text-sm text-muted-foreground">Nomor rekening dikirim admin lewat WhatsApp. Tanyakan dulu lewat tombol di langkah 3.</p>
              <p class="text-xs text-muted-foreground">Transfer sesuai nominal supaya pembayaranmu mudah dicek.</p>
            </div>
          </li>

          <li class="flex gap-4">
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">3</span>
            <div class="min-w-0 flex-1 space-y-3">
              <p class="font-medium">Kirim bukti transfer</p>
              <p class="text-sm text-muted-foreground">
                Pesan berisi nama bisnis, situs, dan nominal sudah disiapkan. Tinggal lampirkan foto/screenshot bukti transfer.
              </p>
              <Button v-if="waConfirm" as="a" :href="waConfirm" target="_blank" rel="noopener" class="bg-emerald-500 text-white hover:bg-emerald-600">
                <MessageCircle /> Kirim bukti via WhatsApp
              </Button>
              <p v-else class="text-sm text-muted-foreground">Hubungi admin CarWash Cloud untuk konfirmasi.</p>
            </div>
          </li>

          <li class="flex gap-4">
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">4</span>
            <div class="min-w-0 flex-1 space-y-3">
              <p class="font-medium">Pro aktif</p>
              <p class="text-sm text-muted-foreground">
                Admin mengecek pembayaran lalu mengaktifkan Pro di akunmu.
                <template v-if="sub.plan === 'pro'">Masa aktif baru ditambahkan setelah masa aktif sekarang berakhir, jadi tidak ada hari yang hilang.</template>
                <template v-else>Masa aktif dihitung sejak Pro diaktifkan.</template>
              </p>
              <Button type="button" variant="outline" size="sm" :disabled="refreshing" @click="refresh">
                <LoaderCircle v-if="refreshing" class="animate-spin" />
                <RefreshCw v-else />
                Cek status
              </Button>
            </div>
          </li>
        </ol>
      </CardContent>
    </Card>

    <Card v-if="sub.payments.length">
      <CardHeader><CardTitle class="text-base">Riwayat pembayaran</CardTitle></CardHeader>
      <CardContent class="divide-y divide-border/50 text-sm">
        <div v-for="p in sub.payments" :key="p.id" class="flex justify-between gap-2 py-2 first:pt-0 last:pb-0">
          <span>{{ shortDate(p.paid_at) }} · {{ p.period === 'yearly' ? 'Tahunan' : 'Bulanan' }}</span>
          <span class="font-medium">{{ rupiah(p.amount) }}</span>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Tombol WhatsApp melayang; di mobile berada di atas nav bawah -->
  <a
    v-if="waAsk"
    :href="waAsk"
    target="_blank"
    rel="noopener"
    aria-label="Chat admin lewat WhatsApp"
    class="fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-sm font-semibold text-white shadow-lg shadow-black/25 transition-colors hover:bg-[#1ebe5b] sm:px-4 sm:py-3 md:right-6 md:bottom-6"
  >
    <MessageCircle class="h-5 w-5" />
    <span class="hidden sm:inline">Chat admin</span>
  </a>
</template>
