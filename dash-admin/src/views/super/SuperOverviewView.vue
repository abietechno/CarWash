<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { ChevronRight } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import PlanBadge from '@/components/super/PlanBadge.vue'
import StatusBadge from '@/components/super/StatusBadge.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { t } from '@/i18n'
import { api, errorMessage } from '@/lib/api'
import { rupiah, shortDate } from '@/lib/format'
import type { SuperOverview } from '@/types'

const data = ref<SuperOverview | null>(null)

onMounted(async () => {
  try {
    data.value = (await api.get<SuperOverview>('/super/overview')).data
  } catch (e) {
    toast.error(errorMessage(e))
  }
})
</script>

<template>
  <PageHeader :title="t('superOverview.title')" :description="t('superOverview.description')" />

  <div v-if="!data" class="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
    <Skeleton v-for="i in 8" :key="i" class="h-24 rounded-2xl" />
  </div>

  <div v-else class="space-y-4 p-4 sm:p-6">
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <RouterLink to="/super/tenants" class="rounded-2xl border border-border/60 bg-card p-4 hover:bg-accent">
        <p class="text-xs text-muted-foreground">{{ t('superOverview.totalTenants') }}</p>
        <p class="mt-1 font-display text-3xl font-bold">{{ data.tenants.total }}</p>
        <p class="text-xs text-muted-foreground">{{ t('superOverview.newThisWeek', { count: data.tenants.new_this_week }) }}</p>
      </RouterLink>
      <RouterLink :to="{ path: '/super/tenants', query: { status: 'published' } }" class="rounded-2xl border border-border/60 bg-card p-4 hover:bg-accent">
        <p class="text-xs text-muted-foreground">{{ t('superOverview.sitesOnline') }}</p>
        <p class="mt-1 font-display text-3xl font-bold text-emerald-500">{{ data.tenants.published }}</p>
        <p class="text-xs text-muted-foreground">{{ t('superOverview.draftSuspended', { draft: data.tenants.draft, suspended: data.tenants.suspended }) }}</p>
      </RouterLink>
      <RouterLink :to="{ path: '/super/tenants', query: { plan: 'pro' } }" class="rounded-2xl border border-border/60 bg-card p-4 hover:bg-accent">
        <p class="text-xs text-muted-foreground">{{ t('superOverview.proSubscribers') }}</p>
        <p class="mt-1 font-display text-3xl font-bold text-violet-400">{{ data.plans.pro }}</p>
        <p class="text-xs text-muted-foreground">{{ t('superOverview.freeCount', { count: data.plans.free }) }}</p>
      </RouterLink>
      <RouterLink :to="{ path: '/super/tenants', query: { plan: 'expiring' } }" class="rounded-2xl border border-border/60 bg-card p-4 hover:bg-accent">
        <p class="text-xs text-muted-foreground">{{ t('superOverview.expiringSoon') }}</p>
        <p class="mt-1 font-display text-3xl font-bold" :class="data.plans.expiring_soon ? 'text-amber-500' : ''">{{ data.plans.expiring_soon }}</p>
        <p class="text-xs text-muted-foreground">{{ t('superOverview.needsReminder') }}</p>
      </RouterLink>
      <div class="rounded-2xl border border-border/60 bg-card p-4">
        <p class="text-xs text-muted-foreground">{{ t('superOverview.paymentsThisMonth') }}</p>
        <p class="mt-1 font-display text-2xl font-bold">{{ rupiah(data.revenue.this_month) }}</p>
      </div>
      <div class="rounded-2xl border border-border/60 bg-card p-4">
        <p class="text-xs text-muted-foreground">{{ t('superOverview.estimatedMrr') }}</p>
        <p class="mt-1 font-display text-2xl font-bold">{{ rupiah(data.revenue.estimated_mrr) }}</p>
        <p class="text-xs text-muted-foreground">{{ t('superOverview.fromActivePro') }}</p>
      </div>
      <div class="col-span-2 rounded-2xl border border-border/60 bg-card p-4">
        <p class="text-xs text-muted-foreground">{{ t('superOverview.bookingsToday') }}</p>
        <p class="mt-1 font-display text-2xl font-bold">{{ data.bookings_today }}</p>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <Card v-for="list in [
        { title: t('superOverview.recentSignups'), items: data.recent_signups, empty: t('superOverview.noTenants'), date: (row: SuperOverview['recent_signups'][number]) => t('superOverview.signedUp', { date: shortDate(row.created_at) }) },
        { title: t('superOverview.expiringList'), items: data.expiring, empty: t('superOverview.noExpiring'), date: (row: SuperOverview['expiring'][number]) => t('superOverview.expires', { date: shortDate(row.pro_until) }) },
      ]" :key="list.title">
        <CardHeader><CardTitle class="text-base">{{ list.title }}</CardTitle></CardHeader>
        <CardContent class="divide-y divide-border/50">
          <p v-if="!list.items.length" class="text-sm text-muted-foreground">{{ list.empty }}</p>
          <RouterLink
            v-for="row in list.items"
            :key="row.id"
            :to="{ name: 'super-tenant', params: { id: row.id } }"
            class="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium">{{ row.name }}</p>
              <p class="truncate text-xs text-muted-foreground">{{ row.subdomain }} · {{ list.date(row) }}</p>
            </div>
            <StatusBadge :status="row.status" />
            <PlanBadge :plan="row.plan" :pro-until="row.pro_until" />
            <ChevronRight class="h-4 w-4 text-muted-foreground" />
          </RouterLink>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
