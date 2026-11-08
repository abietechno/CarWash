<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { ArrowLeft, ExternalLink, LifeBuoy, LoaderCircle, MessageCircle, Power, Receipt } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import PaymentDialog from '@/components/super/PaymentDialog.vue'
import PlanBadge from '@/components/super/PlanBadge.vue'
import PlanDialog from '@/components/super/PlanDialog.vue'
import StatusBadge from '@/components/super/StatusBadge.vue'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { api, errorMessage } from '@/lib/api'
import { daysUntil, PAYMENT_METHODS, rupiah, shortDate } from '@/lib/format'
import { whatsappUrl } from '@/lib/plans'
import { useAuthStore } from '@/stores/auth'
import type { SuperTenantDetail } from '@/types'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const tenant = ref<SuperTenantDetail | null>(null)
const paymentOpen = ref(false)
const planOpen = ref(false)
const confirm = ref<'suspend' | 'activate' | 'impersonate' | null>(null)
const reason = ref('')
const busy = ref(false)

const ACTIONS: Record<string, string> = {
  'payment.recorded': 'Pembayaran dicatat',
  'plan.updated': 'Masa aktif diubah',
  'tenant.suspended': 'Dinonaktifkan',
  'tenant.activated': 'Diaktifkan kembali',
  'tenant.impersonated': 'Super-admin masuk sebagai tenant',
}

function describe(meta: Record<string, unknown> | null): string {
  if (!meta) return ''
  if (meta.amount) return `${rupiah(Number(meta.amount))} · sampai ${shortDate(String(meta.until))}`
  if ('to' in meta) {
    const label = (iso: unknown) => (iso ? shortDate(String(iso)) : 'Gratis')
    return `${label(meta.from)} → ${label(meta.to)}${meta.note ? ` · ${meta.note}` : ''}`
  }
  if (meta.reason) return String(meta.reason)
  if (meta.owner) return String(meta.owner)
  return ''
}

onMounted(async () => {
  try {
    tenant.value = (await api.get<SuperTenantDetail>(`/super/tenants/${route.params.id}`)).data
  } catch (e) {
    toast.error(errorMessage(e))
  }
})

// Aksi diteruskan saat klik, supaya tidak bergantung pada state dialog yang bisa sudah tertutup.
async function runConfirmed(action: 'suspend' | 'activate' | 'impersonate') {
  if (!tenant.value) return
  busy.value = true
  try {
    if (action === 'impersonate') {
      const { data } = await api.post<{ token: string }>(`/super/tenants/${tenant.value.id}/impersonate`)
      await auth.startImpersonation(data.token)
      router.push({ name: 'dashboard' })
      return
    }
    const { data } = await api.post<SuperTenantDetail>(`/super/tenants/${tenant.value.id}/${action}`, { reason: reason.value || null })
    tenant.value = data
    toast.success(action === 'suspend' ? 'Tenant dinonaktifkan, situs offline.' : 'Tenant diaktifkan kembali.')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    busy.value = false
    confirm.value = null
    reason.value = ''
  }
}
</script>

<template>
  <PageHeader :title="tenant?.name ?? 'Tenant'" :description="tenant?.subdomain">
    <template #actions>
      <Button variant="ghost" size="icon" aria-label="Kembali" @click="router.push({ name: 'super-tenants' })"><ArrowLeft /></Button>
    </template>
  </PageHeader>

  <div v-if="!tenant" class="space-y-4 p-4 sm:p-6">
    <Skeleton v-for="i in 3" :key="i" class="h-40 rounded-2xl" />
  </div>

  <div v-else class="space-y-4 p-4 sm:p-6">
    <div class="flex flex-wrap items-center gap-2">
      <StatusBadge :status="tenant.status" />
      <PlanBadge :plan="tenant.plan" :pro-until="tenant.pro_until" />
      <a :href="tenant.url" target="_blank" rel="noopener" class="ml-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        {{ tenant.url }} <ExternalLink class="h-3.5 w-3.5" />
      </a>
    </div>

    <div class="grid grid-cols-3 gap-3">
      <div class="rounded-2xl border border-border/60 bg-card p-3">
        <p class="font-display text-2xl font-bold">{{ tenant.bookings_today }}</p>
        <p class="text-xs text-muted-foreground">Antrian hari ini</p>
      </div>
      <div class="rounded-2xl border border-border/60 bg-card p-3">
        <p class="font-display text-2xl font-bold">{{ tenant.bookings_this_month }}</p>
        <p class="text-xs text-muted-foreground">Antrian bulan ini</p>
      </div>
      <div class="rounded-2xl border border-border/60 bg-card p-3">
        <p class="font-display text-2xl font-bold">{{ tenant.active_packages }}</p>
        <p class="text-xs text-muted-foreground">Paket aktif</p>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Langganan</CardTitle>
          <CardDescription>
            <template v-if="tenant.plan === 'pro'">
              Pro sampai {{ shortDate(tenant.pro_until) }} ({{ daysUntil(tenant.pro_until) }} hari lagi)
            </template>
            <template v-else-if="tenant.pro_until">Gratis · Pro terakhir habis {{ shortDate(tenant.pro_until) }}</template>
            <template v-else>Gratis, belum pernah berlangganan</template>
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-wrap gap-2">
          <Button @click="paymentOpen = true"><Receipt /> Catat pembayaran</Button>
          <Button variant="outline" @click="planOpen = true">Ubah masa aktif</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">Pemilik</CardTitle>
          <CardDescription>Daftar {{ shortDate(tenant.created_at) }}<template v-if="tenant.published_at"> · online sejak {{ shortDate(tenant.published_at) }}</template></CardDescription>
        </CardHeader>
        <CardContent class="space-y-1 text-sm">
          <p class="font-medium">{{ tenant.owner?.name }}</p>
          <p class="text-muted-foreground">{{ tenant.owner?.email }}</p>
          <p class="text-muted-foreground">{{ [tenant.address, tenant.city].filter(Boolean).join(', ') || 'Alamat belum diisi' }}</p>
          <a
            v-if="whatsappUrl(tenant.whatsapp ?? tenant.owner?.phone)"
            :href="whatsappUrl(tenant.whatsapp ?? tenant.owner?.phone)!"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-1 pt-1 text-emerald-500 hover:underline"
          >
            <MessageCircle class="h-4 w-4" /> {{ tenant.whatsapp ?? tenant.owner?.phone }}
          </a>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader><CardTitle class="text-base">Aksi</CardTitle></CardHeader>
      <CardContent class="flex flex-wrap gap-2">
        <Button variant="outline" @click="confirm = 'impersonate'"><LifeBuoy /> Masuk sebagai tenant</Button>
        <Button v-if="tenant.status !== 'suspended'" variant="outline" class="text-destructive" @click="confirm = 'suspend'">
          <Power /> Nonaktifkan
        </Button>
        <Button v-else variant="outline" @click="confirm = 'activate'"><Power /> Aktifkan kembali</Button>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle class="text-base">Riwayat pembayaran</CardTitle></CardHeader>
      <CardContent>
        <p v-if="!tenant.payments.length" class="text-sm text-muted-foreground">Belum ada pembayaran.</p>
        <div v-else class="divide-y divide-border/50 text-sm">
          <div v-for="p in tenant.payments" :key="p.id" class="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0">
            <div>
              <p class="font-medium">{{ rupiah(p.amount) }} · {{ p.period === 'yearly' ? 'Tahunan' : 'Bulanan' }}</p>
              <p class="text-xs text-muted-foreground">
                {{ shortDate(p.paid_at) }} · {{ PAYMENT_METHODS[p.method] ?? p.method }}<template v-if="p.reference"> · {{ p.reference }}</template>
                <template v-if="p.recorded_by"> · dicatat {{ p.recorded_by }}</template>
              </p>
            </div>
            <p class="text-xs text-muted-foreground">{{ shortDate(p.period_start) }} – {{ shortDate(p.period_end) }}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle class="text-base">Log aktivitas</CardTitle></CardHeader>
      <CardContent>
        <p v-if="!tenant.activity.length" class="text-sm text-muted-foreground">Belum ada aktivitas super-admin.</p>
        <ul v-else class="space-y-2 text-sm">
          <li v-for="log in tenant.activity" :key="log.id" class="flex flex-wrap justify-between gap-2">
            <span>
              <span class="font-medium">{{ ACTIONS[log.action] ?? log.action }}</span>
              <span v-if="describe(log.meta)" class="text-muted-foreground"> · {{ describe(log.meta) }}</span>
            </span>
            <span class="text-xs text-muted-foreground">{{ log.user }} · {{ new Date(log.created_at).toLocaleString('id-ID') }}</span>
          </li>
        </ul>
      </CardContent>
    </Card>

    <PaymentDialog v-model:open="paymentOpen" :tenant="tenant" @saved="(t) => (tenant = t)" />
    <PlanDialog v-model:open="planOpen" :tenant="tenant" @saved="(t) => (tenant = t)" />

    <AlertDialog :open="confirm !== null" @update:open="(v: boolean) => !v && (confirm = null)">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {{ confirm === 'suspend' ? 'Nonaktifkan tenant?' : confirm === 'activate' ? 'Aktifkan kembali?' : `Masuk sebagai ${tenant.name}?` }}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <template v-if="confirm === 'suspend'">Situs {{ tenant.url }} langsung offline dan pemilik tidak bisa mempublikasikan ulang.</template>
            <template v-else-if="confirm === 'activate'">Situs kembali seperti sebelum dinonaktifkan.</template>
            <template v-else>Kamu akan membuka dashboard tenant ini selama maks. 2 jam untuk membantu. Akses ini tercatat di log.</template>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input v-if="confirm === 'suspend'" v-model="reason" placeholder="Alasan (opsional, tercatat di log)" maxlength="255" />
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <Button :variant="confirm === 'suspend' ? 'destructive' : 'default'" :disabled="busy" @click="confirm && runConfirmed(confirm)">
            <LoaderCircle v-if="busy" class="animate-spin" />
            {{ confirm === 'suspend' ? 'Nonaktifkan' : confirm === 'activate' ? 'Aktifkan' : 'Masuk' }}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
