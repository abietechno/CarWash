<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { CarFront, ChevronRight, Crown, CircleAlert, CircleCheck, Copy, ExternalLink, LoaderCircle, Rocket, Store, Tags } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api, errorMessage } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import PlanBadge from '@/components/super/PlanBadge.vue'
import { shortDate } from '@/lib/format'
import type { QueueBoard, Tenant } from '@/types'

const auth = useAuthStore()
const tenant = computed(() => auth.tenant)
const busy = ref(false)
const queue = ref<QueueBoard | null>(null)

const firstName = computed(() => auth.user?.name.split(' ')[0] ?? '')
const isOnline = computed(() => tenant.value?.status === 'published')
const statusLabel = computed(
  () => ({ published: 'Online', draft: 'Draft', suspended: 'Dinonaktifkan' })[tenant.value?.status ?? 'draft'],
)

onMounted(async () => {
  try {
    const [t, q] = await Promise.all([api.get<Tenant>('/tenant'), api.get<QueueBoard>('/bookings')])
    auth.setTenant(t.data)
    queue.value = q.data
  } catch (e) {
    toast.error(errorMessage(e))
  }
})

async function setPublished(publish: boolean) {
  busy.value = true
  try {
    const { data } = await api.post<Tenant>(publish ? '/tenant/publish' : '/tenant/unpublish')
    auth.setTenant(data)
    toast.success(publish ? 'Situs sudah online!' : 'Situs disembunyikan dari publik.')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    busy.value = false
  }
}

async function copyUrl() {
  if (!tenant.value) return
  try {
    await navigator.clipboard.writeText(tenant.value.url)
    toast.success('Alamat situs disalin.')
  } catch {
    toast.error('Gagal menyalin. Salin manual dari kolom alamat.')
  }
}
</script>

<template>
  <PageHeader :title="`Halo, ${firstName}`" :description="tenant?.name" />

  <div v-if="tenant" class="space-y-4 p-4 sm:p-6">
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between gap-3">
          <CardTitle class="text-base">Status situs</CardTitle>
          <Badge :variant="isOnline ? 'default' : 'secondary'">
            <span :class="['h-1.5 w-1.5 rounded-full', isOnline ? 'bg-emerald-500' : 'bg-muted-foreground']" />
            {{ statusLabel }}
          </Badge>
        </div>
        <CardDescription>
          {{ isOnline ? 'Situsmu bisa dibuka siapa saja.' : 'Situs belum tampil ke publik sampai kamu publikasikan.' }}
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2">
          <span class="min-w-0 flex-1 truncate font-mono text-sm">{{ tenant.url }}</span>
          <Button variant="ghost" size="icon-sm" aria-label="Salin alamat" @click="copyUrl"><Copy /></Button>
          <Button v-if="isOnline" variant="ghost" size="icon-sm" as="a" :href="tenant.url" target="_blank" rel="noopener" aria-label="Buka situs">
            <ExternalLink />
          </Button>
        </div>

        <div v-if="!isOnline && tenant.status !== 'suspended'" class="space-y-3">
          <ul v-if="tenant.publish_issues.length" class="space-y-2">
            <li v-for="issue in tenant.publish_issues" :key="issue" class="flex items-center gap-2 text-sm text-muted-foreground">
              <CircleAlert class="h-4 w-4 shrink-0 text-amber-500" />
              {{ issue }}
            </li>
          </ul>
          <p v-else class="flex items-center gap-2 text-sm">
            <CircleCheck class="h-4 w-4 text-emerald-500" /> Data sudah lengkap, siap dipublikasikan.
          </p>
          <Button class="w-full sm:w-auto" :disabled="busy || tenant.publish_issues.length > 0" @click="setPublished(true)">
            <LoaderCircle v-if="busy" class="animate-spin" />
            <Rocket v-else />
            Publikasikan situs
          </Button>
        </div>

        <AlertDialog v-else-if="isOnline">
          <AlertDialogTrigger as-child>
            <Button variant="outline" :disabled="busy">Sembunyikan situs</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sembunyikan situs?</AlertDialogTitle>
              <AlertDialogDescription>
                Pelanggan tidak bisa membuka {{ tenant.url }} sampai kamu publikasikan lagi. Data tidak hilang.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction variant="destructive" @click="setPublished(false)">Sembunyikan</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p v-else class="text-sm text-destructive">Bisnis ini sedang dinonaktifkan. Hubungi admin CarWash Cloud.</p>
      </CardContent>
    </Card>

    <RouterLink
      to="/langganan"
      class="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:bg-accent"
    >
      <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
        <Crown class="h-5 w-5" :stroke-width="1.75" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block font-medium">Paket {{ tenant.plan === 'pro' ? 'Pro' : 'Gratis' }}</span>
        <span class="block truncate text-sm text-muted-foreground">
          {{ tenant.plan === 'pro' ? `Aktif sampai ${shortDate(tenant.pro_until)}` : 'Upgrade untuk reservasi online, 25 foto promo & logo sendiri' }}
        </span>
      </span>
      <PlanBadge :plan="tenant.plan" :pro-until="tenant.pro_until" />
      <ChevronRight class="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </RouterLink>

    <RouterLink
      v-if="queue"
      to="/antrian"
      class="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:bg-accent"
    >
      <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
        <CarFront class="h-5 w-5" :stroke-width="1.75" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block font-medium">Antrian hari ini</span>
        <span class="block text-sm text-muted-foreground">
          {{ queue.stats.in_progress }} dikerjakan · {{ queue.stats.waiting }} menunggu · {{ queue.stats.finished_today }} selesai
        </span>
      </span>
      <ChevronRight class="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </RouterLink>

    <div class="grid grid-cols-2 gap-4">
      <Card size="sm">
        <CardContent>
          <p class="text-sm text-muted-foreground">Paket aktif</p>
          <p class="mt-1 font-display text-3xl font-bold">{{ tenant.stats.packages }}</p>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardContent>
          <p class="text-sm text-muted-foreground">Add-on aktif</p>
          <p class="mt-1 font-display text-3xl font-bold">{{ tenant.stats.addons }}</p>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <RouterLink
        v-for="link in [
          { to: '/profil', icon: Store, title: 'Profil bisnis', text: 'Alamat, WhatsApp, deskripsi, jam buka' },
          { to: '/layanan', icon: Tags, title: 'Layanan & harga', text: 'Paket, add-on, harga per kendaraan' },
        ]"
        :key="link.to"
        :to="link.to"
        class="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:bg-accent"
      >
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
          <component :is="link.icon" class="h-5 w-5" :stroke-width="1.75" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block font-medium">{{ link.title }}</span>
          <span class="block truncate text-sm text-muted-foreground">{{ link.text }}</span>
        </span>
        <ChevronRight class="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </RouterLink>
    </div>
  </div>
</template>
