<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { ChevronRight } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import PlanBadge from '@/components/super/PlanBadge.vue'
import StatusBadge from '@/components/super/StatusBadge.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
  <PageHeader title="Ringkasan Platform" description="CarWash Cloud · semua tenant" />

  <div v-if="!data" class="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
    <Skeleton v-for="i in 8" :key="i" class="h-24 rounded-2xl" />
  </div>

  <div v-else class="space-y-4 p-4 sm:p-6">
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <RouterLink to="/super/tenants" class="rounded-2xl border border-border/60 bg-card p-4 hover:bg-accent">
        <p class="text-xs text-muted-foreground">Total tenant</p>
        <p class="mt-1 font-display text-3xl font-bold">{{ data.tenants.total }}</p>
        <p class="text-xs text-muted-foreground">+{{ data.tenants.new_this_week }} minggu ini</p>
      </RouterLink>
      <RouterLink :to="{ path: '/super/tenants', query: { status: 'published' } }" class="rounded-2xl border border-border/60 bg-card p-4 hover:bg-accent">
        <p class="text-xs text-muted-foreground">Situs online</p>
        <p class="mt-1 font-display text-3xl font-bold text-emerald-500">{{ data.tenants.published }}</p>
        <p class="text-xs text-muted-foreground">{{ data.tenants.draft }} draft · {{ data.tenants.suspended }} nonaktif</p>
      </RouterLink>
      <RouterLink :to="{ path: '/super/tenants', query: { plan: 'pro' } }" class="rounded-2xl border border-border/60 bg-card p-4 hover:bg-accent">
        <p class="text-xs text-muted-foreground">Berlangganan Pro</p>
        <p class="mt-1 font-display text-3xl font-bold text-violet-400">{{ data.plans.pro }}</p>
        <p class="text-xs text-muted-foreground">{{ data.plans.free }} gratis</p>
      </RouterLink>
      <RouterLink :to="{ path: '/super/tenants', query: { plan: 'expiring' } }" class="rounded-2xl border border-border/60 bg-card p-4 hover:bg-accent">
        <p class="text-xs text-muted-foreground">Habis ≤ 7 hari</p>
        <p class="mt-1 font-display text-3xl font-bold" :class="data.plans.expiring_soon ? 'text-amber-500' : ''">{{ data.plans.expiring_soon }}</p>
        <p class="text-xs text-muted-foreground">perlu diingatkan</p>
      </RouterLink>
      <div class="rounded-2xl border border-border/60 bg-card p-4">
        <p class="text-xs text-muted-foreground">Pembayaran bulan ini</p>
        <p class="mt-1 font-display text-2xl font-bold">{{ rupiah(data.revenue.this_month) }}</p>
      </div>
      <div class="rounded-2xl border border-border/60 bg-card p-4">
        <p class="text-xs text-muted-foreground">Perkiraan pendapatan/bulan</p>
        <p class="mt-1 font-display text-2xl font-bold">{{ rupiah(data.revenue.estimated_mrr) }}</p>
        <p class="text-xs text-muted-foreground">dari tenant Pro aktif</p>
      </div>
      <div class="col-span-2 rounded-2xl border border-border/60 bg-card p-4">
        <p class="text-xs text-muted-foreground">Kendaraan di antrian semua tenant hari ini</p>
        <p class="mt-1 font-display text-2xl font-bold">{{ data.bookings_today }}</p>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <Card v-for="list in [
        { title: 'Pendaftar terbaru', items: data.recent_signups, empty: 'Belum ada tenant.', date: (t: SuperOverview['recent_signups'][number]) => `Daftar ${shortDate(t.created_at)}` },
        { title: 'Langganan hampir habis', items: data.expiring, empty: 'Tidak ada yang habis dalam 7 hari.', date: (t: SuperOverview['expiring'][number]) => `Habis ${shortDate(t.pro_until)}` },
      ]" :key="list.title">
        <CardHeader><CardTitle class="text-base">{{ list.title }}</CardTitle></CardHeader>
        <CardContent class="divide-y divide-border/50">
          <p v-if="!list.items.length" class="text-sm text-muted-foreground">{{ list.empty }}</p>
          <RouterLink
            v-for="t in list.items"
            :key="t.id"
            :to="{ name: 'super-tenant', params: { id: t.id } }"
            class="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium">{{ t.name }}</p>
              <p class="truncate text-xs text-muted-foreground">{{ t.subdomain }} · {{ list.date(t) }}</p>
            </div>
            <StatusBadge :status="t.status" />
            <PlanBadge :plan="t.plan" :pro-until="t.pro_until" />
            <ChevronRight class="h-4 w-4 text-muted-foreground" />
          </RouterLink>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
