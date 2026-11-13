<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
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
import { locale, t } from '@/i18n'
import { api, errorMessage } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import PlanBadge from '@/components/super/PlanBadge.vue'
import { rupiah, shortDate, TENANT_STATUS } from '@/lib/format'
import type { QueueBoard, ReportSummary, Tenant } from '@/types'

const auth = useAuthStore()
const tenant = computed(() => auth.tenant)
const busy = ref(false)
const queue = ref<QueueBoard | null>(null)
const today = ref<ReportSummary | null>(null)

const firstName = computed(() => auth.user?.name.split(' ')[0] ?? '')
const isOnline = computed(() => tenant.value?.status === 'published')
const statusLabel = computed(() => TENANT_STATUS[tenant.value?.status ?? 'draft'])

async function load() {
  try {
    const [profile, q, r] = await Promise.all([api.get<Tenant>('/tenant'), api.get<QueueBoard>('/bookings'), api.get<ReportSummary>('/reports/summary')])
    auth.setTenant(profile.data)
    queue.value = q.data
    today.value = r.data
  } catch (e) {
    toast.error(errorMessage(e))
  }
}

onMounted(load)
// Daftar data yang kurang (publish_issues) dikirim server dalam bahasa aktif; muat ulang saat bahasa diganti.
watch(locale, load)

async function setPublished(publish: boolean) {
  busy.value = true
  try {
    const { data } = await api.post<Tenant>(publish ? '/tenant/publish' : '/tenant/unpublish')
    auth.setTenant(data)
    toast.success(publish ? t('dashboard.published') : t('dashboard.hidden'))
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
    toast.success(t('dashboard.copied'))
  } catch {
    toast.error(t('dashboard.copyFailed'))
  }
}
</script>

<template>
  <PageHeader :title="t('dashboard.greeting', { name: firstName })" :description="tenant?.name" />

  <div v-if="tenant" class="space-y-4 p-4 sm:p-6">
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between gap-3">
          <CardTitle class="text-base">{{ t('dashboard.siteStatus') }}</CardTitle>
          <Badge :variant="isOnline ? 'default' : 'secondary'">
            <span :class="['h-1.5 w-1.5 rounded-full', isOnline ? 'bg-emerald-500' : 'bg-muted-foreground']" />
            {{ statusLabel }}
          </Badge>
        </div>
        <CardDescription>
          {{ isOnline ? t('dashboard.onlineText') : t('dashboard.offlineText') }}
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2">
          <span class="min-w-0 flex-1 truncate font-mono text-sm">{{ tenant.url }}</span>
          <Button variant="ghost" size="icon-sm" :aria-label="t('dashboard.copyUrl')" @click="copyUrl"><Copy /></Button>
          <Button v-if="isOnline" variant="ghost" size="icon-sm" as="a" :href="tenant.url" target="_blank" rel="noopener" :aria-label="t('dashboard.openSite')">
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
            <CircleCheck class="h-4 w-4 text-emerald-500" /> {{ t('dashboard.ready') }}
          </p>
          <Button class="w-full sm:w-auto" :disabled="busy || tenant.publish_issues.length > 0" @click="setPublished(true)">
            <LoaderCircle v-if="busy" class="animate-spin" />
            <Rocket v-else />
            {{ t('dashboard.publish') }}
          </Button>
        </div>

        <AlertDialog v-else-if="isOnline">
          <AlertDialogTrigger as-child>
            <Button variant="outline" :disabled="busy">{{ t('dashboard.unpublish') }}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{{ t('dashboard.unpublishTitle') }}</AlertDialogTitle>
              <AlertDialogDescription>
                {{ t('dashboard.unpublishText', { url: tenant.url }) }}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{{ t('common.cancel') }}</AlertDialogCancel>
              <AlertDialogAction variant="destructive" @click="setPublished(false)">{{ t('dashboard.unpublishConfirm') }}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p v-else class="text-sm text-destructive">{{ t('dashboard.suspended') }}</p>
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
        <span class="block font-medium">{{ t('common.planName', { plan: tenant.plan === 'pro' ? 'Pro' : t('common.free') }) }}</span>
        <span class="block truncate text-sm text-muted-foreground">
          {{ tenant.plan === 'pro' ? t('dashboard.activeUntil', { date: shortDate(tenant.pro_until) }) : t('dashboard.upgradeHint') }}
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
        <span class="block font-medium">{{ t('dashboard.queueToday') }}</span>
        <span class="block text-sm text-muted-foreground">
          {{ t('dashboard.queueStats', { progress: queue.stats.in_progress, waiting: queue.stats.waiting, done: queue.stats.finished_today }) }}
        </span>
      </span>
      <ChevronRight class="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </RouterLink>

    <Card v-if="today" size="sm">
      <CardContent class="flex flex-wrap items-center gap-x-8 gap-y-3">
        <div>
          <p class="text-sm text-muted-foreground">{{ t('dashboard.incomeToday') }}</p>
          <p class="mt-1 font-display text-2xl font-bold tabular-nums">{{ rupiah(today.income) }}</p>
        </div>
        <div>
          <p class="text-sm text-muted-foreground">{{ t('dashboard.expenseToday') }}</p>
          <p class="mt-1 font-display text-2xl font-bold tabular-nums">{{ rupiah(today.expense) }}</p>
        </div>
        <div class="flex gap-2 sm:ml-auto">
          <Button as-child><RouterLink to="/kasir">{{ t('dashboard.openPos') }}</RouterLink></Button>
          <Button variant="outline" as-child><RouterLink to="/laporan">{{ t('nav.reports') }}</RouterLink></Button>
        </div>
      </CardContent>
    </Card>

    <div class="grid grid-cols-2 gap-4">
      <Card size="sm">
        <CardContent>
          <p class="text-sm text-muted-foreground">{{ t('dashboard.activePackages') }}</p>
          <p class="mt-1 font-display text-3xl font-bold">{{ tenant.stats.packages }}</p>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardContent>
          <p class="text-sm text-muted-foreground">{{ t('dashboard.activeAddons') }}</p>
          <p class="mt-1 font-display text-3xl font-bold">{{ tenant.stats.addons }}</p>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <RouterLink
        v-for="link in [
          { to: '/profil', icon: Store, title: t('dashboard.profileTitle'), text: t('dashboard.profileText') },
          { to: '/layanan', icon: Tags, title: t('dashboard.servicesTitle'), text: t('dashboard.servicesText') },
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
