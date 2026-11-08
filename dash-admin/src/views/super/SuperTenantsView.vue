<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { ChevronRight, Search } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import PlanBadge from '@/components/super/PlanBadge.vue'
import StatusBadge from '@/components/super/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { api, errorMessage } from '@/lib/api'
import { shortDate } from '@/lib/format'
import type { SuperTenant } from '@/types'

const route = useRoute()
const router = useRouter()

const STATUS_FILTERS = [
  { value: '', label: 'Semua status' },
  { value: 'published', label: 'Online' },
  { value: 'draft', label: 'Draft' },
  { value: 'suspended', label: 'Nonaktif' },
]
const PLAN_FILTERS = [
  { value: '', label: 'Semua paket' },
  { value: 'pro', label: 'Pro' },
  { value: 'free', label: 'Gratis' },
  { value: 'expiring', label: 'Habis ≤ 7 hari' },
]

const q = (key: string) => (typeof route.query[key] === 'string' ? (route.query[key] as string) : '')
const search = ref(q('search'))
const status = ref(q('status'))
const plan = ref(q('plan'))
const page = ref(1)

const tenants = ref<SuperTenant[] | null>(null)
const meta = ref({ current_page: 1, last_page: 1, total: 0 })
let searchTimer: ReturnType<typeof setTimeout> | undefined

async function load() {
  try {
    const params = { search: search.value || undefined, status: status.value || undefined, plan: plan.value || undefined, page: page.value }
    const { data } = await api.get<{ data: SuperTenant[]; meta: typeof meta.value }>('/super/tenants', { params })
    tenants.value = data.data
    meta.value = data.meta
    router.replace({ query: { search: params.search, status: params.status, plan: params.plan } })
  } catch (e) {
    toast.error(errorMessage(e))
  }
}

onMounted(load)

watch([status, plan], () => {
  page.value = 1
  load()
})

watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    load()
  }, 350)
})

function goPage(next: number) {
  page.value = next
  load()
}
</script>

<template>
  <PageHeader title="Tenant" :description="`${meta.total} bisnis terdaftar`" />

  <div class="space-y-4 p-4 sm:p-6">
    <div class="relative">
      <Search class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="search" placeholder="Cari nama bisnis, subdomain, atau email pemilik" class="pl-9" />
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="f in STATUS_FILTERS"
        :key="`s-${f.value}`"
        type="button"
        :class="['rounded-full px-3 py-1 text-xs font-medium', status === f.value ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground']"
        @click="status = f.value"
      >
        {{ f.label }}
      </button>
      <span class="mx-1 w-px bg-border" />
      <button
        v-for="f in PLAN_FILTERS"
        :key="`p-${f.value}`"
        type="button"
        :class="['rounded-full px-3 py-1 text-xs font-medium', plan === f.value ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground']"
        @click="plan = f.value"
      >
        {{ f.label }}
      </button>
    </div>

    <div v-if="!tenants" class="space-y-2">
      <Skeleton v-for="i in 5" :key="i" class="h-20 rounded-2xl" />
    </div>
    <p v-else-if="!tenants.length" class="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      Tidak ada tenant yang cocok.
    </p>

    <div v-else class="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/60 bg-card">
      <RouterLink
        v-for="t in tenants"
        :key="t.id"
        :to="{ name: 'super-tenant', params: { id: t.id } }"
        class="flex items-center gap-4 p-4 transition-colors hover:bg-accent"
      >
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted font-display font-bold">
          {{ t.name.charAt(0).toUpperCase() }}
        </span>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="truncate font-medium">{{ t.name }}</p>
            <StatusBadge :status="t.status" />
            <PlanBadge :plan="t.plan" :pro-until="t.pro_until" />
          </div>
          <p class="truncate text-sm text-muted-foreground">
            {{ t.subdomain }}<template v-if="t.owner"> · {{ t.owner.name }} ({{ t.owner.email }})</template>
          </p>
        </div>
        <div class="hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
          <p>{{ t.bookings_this_month }} antrian bulan ini</p>
          <p>Daftar {{ shortDate(t.created_at) }}</p>
        </div>
        <ChevronRight class="h-4 w-4 shrink-0 text-muted-foreground" />
      </RouterLink>
    </div>

    <div v-if="meta.last_page > 1" class="flex items-center justify-center gap-3">
      <Button variant="outline" size="sm" :disabled="meta.current_page <= 1" @click="goPage(meta.current_page - 1)">Sebelumnya</Button>
      <span class="text-sm text-muted-foreground">{{ meta.current_page }} / {{ meta.last_page }}</span>
      <Button variant="outline" size="sm" :disabled="meta.current_page >= meta.last_page" @click="goPage(meta.current_page + 1)">Berikutnya</Button>
    </div>
  </div>
</template>
