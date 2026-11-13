<script setup lang="ts">
import { computed } from 'vue'
import { Check, CircleCheck, CircleX, Phone, Play, Undo2, Wallet } from '@lucide/vue'
import CarTop from '@/components/CarTop.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { t } from '@/i18n'
import { clock, rupiah } from '@/lib/format'
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
        <Badge v-if="b.bay && b.status === 'in_progress'" variant="secondary">{{ t('queueCard.bay', { n: b.bay }) }}</Badge>
      </div>
      <Badge variant="outline">{{ b.source === 'online' ? t('queueCard.online') : t('queueCard.walkIn') }}</Badge>
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
        <p v-if="b.vehicle_brand" class="truncate text-muted-foreground">{{ b.vehicle_brand }}</p>
      </div>
    </div>

    <div class="mt-2 flex items-center justify-between gap-2 text-sm">
      <span class="min-w-0 truncate">{{ b.package_name }}</span>
      <span class="shrink-0 font-medium tabular-nums">{{ rupiah(b.price) }}</span>
    </div>

    <div v-if="b.status === 'in_progress'" class="mt-2">
      <div class="h-1.5 overflow-hidden rounded-full bg-muted">
        <div class="h-full rounded-full bg-sky-500 transition-all" :style="{ width: `${b.progress ?? 0}%` }" />
      </div>
      <p class="mt-1 text-xs text-muted-foreground">
        {{ t('queueCard.progress', { progress: b.progress ?? 0, minutes: b.remaining_minutes ?? 0, time: clock(b.started_at) }) }}
      </p>
    </div>
    <p v-else-if="b.status === 'waiting'" class="mt-1 text-xs text-muted-foreground">
      {{ t('queueCard.waitingInfo', { time: clock(b.created_at), start: b.est_wait_minutes ? clock(b.est_start_at) : t('queueCard.now') }) }}
    </p>
    <p v-else-if="b.status === 'done'" class="mt-1 text-xs text-muted-foreground">{{ t('queueCard.finishedAt', { time: clock(b.finished_at) }) }}</p>

    <div class="mt-3 flex gap-2">
      <template v-if="b.status === 'waiting'">
        <Button size="sm" class="flex-1" :disabled="busy" @click="emit('move', 'in_progress')"><Play /> {{ t('queueCard.start') }}</Button>
        <Button v-if="!b.transaction_id" size="sm" variant="ghost" :disabled="busy" :aria-label="t('queueCard.cancel')" @click="emit('move', 'cancelled')"><CircleX /></Button>
      </template>
      <template v-else-if="b.status === 'in_progress'">
        <Button size="sm" class="flex-1" :disabled="busy" @click="emit('move', 'done')"><Check /> {{ t('queueCard.finish') }}</Button>
        <Button size="sm" variant="ghost" :disabled="busy" :aria-label="t('queueCard.backToQueue')" @click="emit('move', 'waiting')"><Undo2 /></Button>
      </template>
      <template v-else-if="b.status === 'done'">
        <Button size="sm" class="flex-1" :disabled="busy" @click="emit('move', 'picked_up')"><Check /> {{ t('queueCard.pickedUp') }}</Button>
        <Button size="sm" variant="ghost" :disabled="busy" :aria-label="t('queueCard.backToProgress')" @click="emit('move', 'in_progress')"><Undo2 /></Button>
      </template>
      <Badge v-if="b.transaction_id" variant="secondary" class="self-center"><CircleCheck /> {{ t('queueCard.paid') }}</Badge>
      <Button v-else size="sm" variant="outline" as-child>
        <RouterLink :to="{ name: 'pos', query: { booking: b.id } }"><Wallet /> {{ t('queue.pay') }}</RouterLink>
      </Button>
    </div>
  </div>
</template>
