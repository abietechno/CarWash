<script setup lang="ts">
import { Crown } from '@lucide/vue'
import { t } from '@/i18n'

defineProps<{ message: string }>()
</script>

<template>
  <RouterLink
    to="/langganan"
    class="flex items-center gap-3 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-3 text-sm transition-colors hover:bg-violet-500/15"
  >
    <Crown class="h-4 w-4 shrink-0 text-violet-400" />
    <span class="flex-1">{{ message }}</span>
    <span class="font-semibold text-violet-400">{{ t('renewal.seePro') }}</span>
  </RouterLink>
</template>
