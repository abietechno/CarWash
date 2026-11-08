<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { Check, Crown, MessageCircle, X } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { api, errorMessage } from '@/lib/api'
import { daysUntil, rupiah, shortDate } from '@/lib/format'
import { useAuthStore } from '@/stores/auth'
import type { Subscription } from '@/types'

const auth = useAuthStore()
const sub = ref<Subscription | null>(null)

onMounted(async () => {
  try {
    sub.value = (await api.get<Subscription>('/subscription')).data
  } catch (e) {
    toast.error(errorMessage(e))
  }
})

const FEATURES = [
  { label: 'Situs dengan subdomain sendiri', free: true },
  { label: 'Papan antrian realtime & walk-in', free: true },
  { label: 'Paket layanan aktif', free: 'Maks. 3', pro: 'Tanpa batas' },
  { label: 'Reservasi online dari situs', free: false },
  { label: 'Promo slider di beranda', free: false },
  { label: 'Tanpa label "Dibuat dengan CarWash Cloud"', free: false },
]

const left = computed(() => daysUntil(sub.value?.pro_until ?? null))

const waAdmin = computed(() => {
  const number = sub.value?.contact_whatsapp
  if (!number) return null
  let digits = number.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`
  const text = `Halo admin CarWash Cloud, saya mau ${sub.value?.plan === 'pro' ? 'memperpanjang' : 'berlangganan'} Pro untuk ${auth.tenant?.name} (${auth.tenant?.subdomain}).`
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
})
</script>

<template>
  <PageHeader title="Langganan" :description="auth.tenant?.name" />

  <div v-if="!sub" class="space-y-4 p-4 sm:p-6">
    <Skeleton v-for="i in 3" :key="i" class="h-40 rounded-2xl" />
  </div>

  <div v-else class="space-y-4 p-4 sm:p-6">
    <Card :class="sub.plan === 'pro' ? 'ring-violet-500/40' : ''">
      <CardHeader>
        <div class="flex items-center gap-3">
          <span :class="['flex h-11 w-11 items-center justify-center rounded-xl', sub.plan === 'pro' ? 'bg-violet-500/15 text-violet-400' : 'bg-muted']">
            <Crown class="h-5 w-5" />
          </span>
          <div>
            <CardTitle class="text-lg">Paket {{ sub.plan === 'pro' ? 'Pro' : 'Gratis' }}</CardTitle>
            <CardDescription>
              <template v-if="sub.plan === 'pro'">Aktif sampai {{ shortDate(sub.pro_until) }} · {{ left }} hari lagi</template>
              <template v-else-if="sub.pro_until">Pro berakhir {{ shortDate(sub.pro_until) }}. Perpanjang untuk mengaktifkan lagi fitur Pro.</template>
              <template v-else>Upgrade ke Pro untuk reservasi online & promo slider.</template>
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
        <CardTitle class="text-base">{{ sub.plan === 'pro' ? 'Perpanjang Pro' : 'Upgrade ke Pro' }}</CardTitle>
        <CardDescription>
          {{ rupiah(sub.prices.monthly) }}/bulan atau {{ rupiah(sub.prices.yearly) }}/tahun
          <template v-if="sub.prices.yearly < sub.prices.monthly * 12">
            (hemat {{ rupiah(sub.prices.monthly * 12 - sub.prices.yearly) }})
          </template>
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <p v-if="sub.payment_instructions" class="rounded-xl bg-muted/60 p-4 text-sm whitespace-pre-line">{{ sub.payment_instructions }}</p>
        <p v-else class="text-sm text-muted-foreground">Hubungi admin CarWash Cloud untuk cara pembayaran.</p>
        <p class="text-xs text-muted-foreground">Setelah pembayaran dikonfirmasi admin, Pro langsung aktif.</p>
        <Button v-if="waAdmin" as="a" :href="waAdmin" target="_blank" rel="noopener" class="bg-emerald-500 text-white hover:bg-emerald-600">
          <MessageCircle /> Konfirmasi via WhatsApp
        </Button>
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
</template>
