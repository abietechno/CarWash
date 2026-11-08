<script setup lang="ts">
import { computed } from 'vue'
import { Check, CircleX, Phone, Play, Undo2 } from '@lucide/vue'
import CarTop from '@/components/CarTop.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { clock } from '@/lib/format'
import type { BoardBooking, BookingStatus } from '@/types'

const props = defineProps<{ booking: BoardBooking; vehicleName: string; busy?: boolean }>()
const emit = defineEmits<{ move: [status: BookingStatus] }>()

const b = computed(() => props.booking)
</script>

<template>
  <div class="rounded-2xl border border-border/60 bg-card p-3">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="font-display text-lg font-bold">{{ b.ticket }}</span>
        <Badge v-if="b.bay && b.status === 'in_progress'" variant="secondary">Bay {{ b.bay }}</Badge>
      </div>
      <Badge variant="outline">{{ b.source === 'online' ? 'Online' : 'Datang langsung' }}</Badge>
    </div>

    <div class="mt-2 flex items-center gap-3">
      <div class="h-14 w-24 shrink-0 rounded-xl bg-muted/60 p-1">
        <CarTop :type="b.vehicle_type" :color="b.vehicle_color" class="h-full w-full" />
      </div>
      <div class="min-w-0 text-sm">
        <p class="truncate font-medium">{{ b.customer_name }}</p>
        <a v-if="b.phone" :href="`tel:${b.phone}`" class="flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <Phone class="h-3 w-3" /> {{ b.phone }}
        </a>
        <p class="truncate text-muted-foreground">{{ vehicleName }}<template v-if="b.plate"> · {{ b.plate }}</template></p>
      </div>
    </div>

    <p class="mt-2 truncate text-sm">{{ b.package_name }}</p>

    <div v-if="b.status === 'in_progress'" class="mt-2">
      <div class="h-1.5 overflow-hidden rounded-full bg-muted">
        <div class="h-full rounded-full bg-sky-500 transition-all" :style="{ width: `${b.progress ?? 0}%` }" />
      </div>
      <p class="mt-1 text-xs text-muted-foreground">
        {{ b.progress }}% · sisa ±{{ b.remaining_minutes }} mnt · mulai {{ clock(b.started_at) }}
      </p>
    </div>
    <p v-else-if="b.status === 'waiting'" class="mt-1 text-xs text-muted-foreground">
      Masuk {{ clock(b.created_at) }} · est. mulai {{ b.est_wait_minutes ? clock(b.est_start_at) : 'sekarang' }}
    </p>
    <p v-else-if="b.status === 'done'" class="mt-1 text-xs text-muted-foreground">Selesai {{ clock(b.finished_at) }}</p>

    <div class="mt-3 flex gap-2">
      <template v-if="b.status === 'waiting'">
        <Button size="sm" class="flex-1" :disabled="busy" @click="emit('move', 'in_progress')"><Play /> Mulai</Button>
        <Button size="sm" variant="ghost" :disabled="busy" aria-label="Batalkan" @click="emit('move', 'cancelled')"><CircleX /></Button>
      </template>
      <template v-else-if="b.status === 'in_progress'">
        <Button size="sm" class="flex-1" :disabled="busy" @click="emit('move', 'done')"><Check /> Selesai</Button>
        <Button size="sm" variant="ghost" :disabled="busy" aria-label="Kembalikan ke antrian" @click="emit('move', 'waiting')"><Undo2 /></Button>
      </template>
      <template v-else-if="b.status === 'done'">
        <Button size="sm" class="flex-1" :disabled="busy" @click="emit('move', 'picked_up')"><Check /> Sudah diambil</Button>
        <Button size="sm" variant="ghost" :disabled="busy" aria-label="Kembalikan ke dikerjakan" @click="emit('move', 'in_progress')"><Undo2 /></Button>
      </template>
    </div>
  </div>
</template>
