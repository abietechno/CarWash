<script setup lang="ts">
import { computed } from 'vue'
import { Crown } from '@lucide/vue'
import { t } from '@/i18n'
import { daysUntil } from '@/lib/format'
import type { Plan } from '@/types'

const props = defineProps<{ plan: Plan; proUntil: string | null }>()

const left = computed(() => daysUntil(props.proUntil))
const expiring = computed(() => props.plan === 'pro' && left.value !== null && left.value <= 7)
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
      plan === 'pro' ? (expiring ? 'bg-amber-500/15 text-amber-500' : 'bg-violet-500/15 text-violet-400') : 'bg-muted text-muted-foreground',
    ]"
  >
    <Crown v-if="plan === 'pro'" class="h-3 w-3" />
    {{ plan === 'pro' ? (expiring ? t('planBadge.proDays', { days: t('common.daysLeft', { count: left ?? 0 }) }) : 'Pro') : t('common.free') }}
  </span>
</template>
