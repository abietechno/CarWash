<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { ExternalLink, Plus } from '@lucide/vue'
import CarTop from '@/components/CarTop.vue'
import PageHeader from '@/components/PageHeader.vue'
import QueueCard from '@/components/queue/QueueCard.vue'
import WalkInDialog from '@/components/queue/WalkInDialog.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api, errorMessage } from '@/lib/api'
import { clock } from '@/lib/format'
import { useAuthStore } from '@/stores/auth'
import type { BoardBooking, BookingStatus, QueueBoard, ServicePackage, VehicleType } from '@/types'

const REFRESH_MS = 10_000

const auth = useAuthStore()
const board = ref<QueueBoard | null>(null)
const packages = ref<ServicePackage[]>([])
const vehicleTypes = ref<VehicleType[]>([])
const walkInOpen = ref(false)
const busyId = ref<number | null>(null)
let timer: ReturnType<typeof setInterval> | undefined

const dateLabel = computed(() =>
  new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
)
const statusUrl = computed(() => (auth.tenant ? `${auth.tenant.url}/#status` : null))
const history = computed(() => [...(board.value?.picked_up ?? []), ...(board.value?.cancelled ?? [])])

function vehicleName(code: string) {
  return vehicleTypes.value.find((v) => v.code === code)?.name ?? code
}

async function refresh() {
  try {
    const { data } = await api.get<QueueBoard>('/bookings')
    board.value = data
  } catch (e) {
    toast.error(errorMessage(e, 'Gagal memuat antrian.'))
  }
}

onMounted(async () => {
  const [p, v] = await Promise.all([api.get<ServicePackage[]>('/packages'), api.get<VehicleType[]>('/vehicle-types')])
  packages.value = p.data
  vehicleTypes.value = v.data
  await refresh()
  // Online booking masuk dari situs; segarkan berkala selama tab terlihat.
  timer = setInterval(() => document.visibilityState === 'visible' && refresh(), REFRESH_MS)
})

onUnmounted(() => clearInterval(timer))

async function move(booking: BoardBooking, status: BookingStatus) {
  busyId.value = booking.id
  try {
    const { data } = await api.patch<QueueBoard>(`/bookings/${booking.id}/status`, { status })
    board.value = data
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    busyId.value = null
  }
}

const columns = computed(() => [
  { key: 'waiting', title: 'Menunggu', items: board.value?.waiting ?? [], empty: 'Belum ada antrian.' },
  { key: 'in_progress', title: 'Dikerjakan', items: board.value?.in_progress ?? [], empty: 'Bay kosong.' },
  { key: 'ready', title: 'Siap diambil', items: board.value?.ready ?? [], empty: 'Belum ada yang selesai.' },
])
</script>

<template>
  <PageHeader title="Antrian" :description="dateLabel">
    <template #actions>
      <Button v-if="statusUrl" variant="ghost" size="icon" as="a" :href="statusUrl" target="_blank" rel="noopener" aria-label="Lihat papan di situs">
        <ExternalLink />
      </Button>
      <Button :disabled="!vehicleTypes.length" @click="walkInOpen = true"><Plus /> Pelanggan</Button>
    </template>
  </PageHeader>

  <div class="space-y-4 p-4 sm:p-6">
    <div v-if="!board" class="grid gap-4 lg:grid-cols-3">
      <Skeleton v-for="i in 3" :key="i" class="h-64 rounded-2xl" />
    </div>

    <template v-else>
      <div class="grid grid-cols-3 gap-3">
        <div class="rounded-2xl border border-border/60 bg-card p-3">
          <p class="font-display text-2xl font-bold text-sky-500">{{ board.stats.in_progress }}</p>
          <p class="text-xs text-muted-foreground">Dikerjakan · {{ board.bay_count }} bay</p>
        </div>
        <div class="rounded-2xl border border-border/60 bg-card p-3">
          <p class="font-display text-2xl font-bold text-amber-500">{{ board.stats.waiting }}</p>
          <p class="text-xs text-muted-foreground">Menunggu</p>
        </div>
        <div class="rounded-2xl border border-border/60 bg-card p-3">
          <p class="font-display text-2xl font-bold text-emerald-500">{{ board.stats.finished_today }}</p>
          <p class="text-xs text-muted-foreground">Selesai hari ini</p>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <section v-for="col in columns" :key="col.key" class="space-y-3">
          <h2 class="flex items-center gap-2 text-sm font-semibold">
            {{ col.title }}
            <span class="rounded-full bg-muted px-2 text-xs text-muted-foreground">{{ col.items.length }}</span>
          </h2>
          <p v-if="!col.items.length" class="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {{ col.empty }}
          </p>
          <QueueCard
            v-for="b in col.items"
            :key="b.id"
            :booking="b"
            :vehicle-name="vehicleName(b.vehicle_type)"
            :busy="busyId === b.id"
            @move="(status) => move(b, status)"
          />
        </section>
      </div>

      <details v-if="history.length" class="rounded-2xl border border-border/60 bg-card p-4">
        <summary class="cursor-pointer text-sm font-semibold">Riwayat hari ini ({{ history.length }})</summary>
        <ul class="mt-3 divide-y divide-border/50">
          <li v-for="b in history" :key="b.id" class="flex items-center gap-3 py-2 text-sm">
            <span class="w-14 font-display font-bold">{{ b.ticket }}</span>
            <CarTop :type="b.vehicle_type" :color="b.vehicle_color" class="h-7 w-12 shrink-0" />
            <span class="min-w-0 flex-1 truncate">{{ b.customer_name }} · {{ b.package_name }}</span>
            <span class="text-xs text-muted-foreground">
              {{ b.status === 'cancelled' ? 'Batal' : `Diambil ${clock(b.finished_at)}` }}
            </span>
            <Button v-if="b.status !== 'cancelled' && !b.transaction_id" size="sm" variant="outline" as-child>
              <RouterLink :to="{ name: 'pos', query: { booking: b.id } }">Bayar</RouterLink>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              :disabled="busyId === b.id"
              @click="move(b, b.status === 'cancelled' ? 'waiting' : 'done')"
            >
              Kembalikan
            </Button>
          </li>
        </ul>
      </details>
    </template>
  </div>

  <WalkInDialog v-model:open="walkInOpen" :packages="packages" :vehicle-types="vehicleTypes" @saved="(b) => (board = b)" />
</template>
