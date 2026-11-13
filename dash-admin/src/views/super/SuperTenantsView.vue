<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { ChevronRight, Search } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import PlanBadge from '@/components/super/PlanBadge.vue'
import StatusBadge from '@/components/super/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { t } from '@/i18n'
import { api, errorMessage } from '@/lib/api'
import { shortDate, TENANT_STATUS } from '@/lib/format'
import type { SuperTenant } from '@/types'

const route = useRoute()
const router = useRouter()

const STATUS_FILTERS = computed(() => [
  { value: '', label: t('superTenants.allStatus') },
  { value: 'published', label: TENANT_STATUS.published },
  { value: 'draft', label: TENANT_STATUS.draft },
  { value: 'suspended', label: t('superTenants.inactive') },
])
const PLAN_FILTERS = computed(() => [
  { value: '', label: t('superTenants.allPlans') },
  { value: 'pro', label: 'Pro' },
  { value: 'free', label: t('common.free') },
  { value: 'expiring', label: t('superOverview.expiringSoon') },
])

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
  <PageHeader :title="t('nav.tenants')" :description="t('superTenants.registered', { count: meta.total })" />

  <div class="space-y-4 p-4 sm:p-6">
    <div class="relative">
      <Search class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="search" :placeholder="t('superTenants.search')" class="pl-9" />
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
      {{ t('superTenants.none') }}
    </p>

    <div v-else class="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/60 bg-card">
      <RouterLink
        v-for="row in tenants"
        :key="row.id"
        :to="{ name: 'super-tenant', params: { id: row.id } }"
        class="flex items-center gap-4 p-4 transition-colors hover:bg-accent"
      >
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted font-display font-bold">
          {{ row.name.charAt(0).toUpperCase() }}
        </span>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="truncate font-medium">{{ row.name }}</p>
            <StatusBadge :status="row.status" />
            <PlanBadge :plan="row.plan" :pro-until="row.pro_until" />
          </div>
          <p class="truncate text-sm text-muted-foreground">
            {{ row.subdomain }}<template v-if="row.owner"> · {{ row.owner.name }} ({{ row.owner.email }})</template>
          </p>
        </div>
        <div class="hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
          <p>{{ t('superTenants.bookingsMonth', { count: row.bookings_this_month }) }}</p>
          <p>{{ t('superOverview.signedUp', { date: shortDate(row.created_at) }) }}</p>
        </div>
        <ChevronRight class="h-4 w-4 shrink-0 text-muted-foreground" />
      </RouterLink>
    </div>

    <div v-if="meta.last_page > 1" class="flex items-center justify-center gap-3">
      <Button variant="outline" size="sm" :disabled="meta.current_page <= 1" @click="goPage(meta.current_page - 1)">{{ t('common.previous') }}</Button>
      <span class="text-sm text-muted-foreground">{{ meta.current_page }} / {{ meta.last_page }}</span>
      <Button variant="outline" size="sm" :disabled="meta.current_page >= meta.last_page" @click="goPage(meta.current_page + 1)">{{ t('common.next') }}</Button>
    </div>
  </div>
</template>
