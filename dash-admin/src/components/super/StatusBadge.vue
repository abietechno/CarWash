<script setup lang="ts">
import { TENANT_STATUS } from '@/lib/format'
import type { TenantStatus } from '@/types'

defineProps<{ status: TenantStatus }>()
</script>

<template>
  <span class="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
    <span
      :class="[
        'h-1.5 w-1.5 rounded-full',
        status === 'published' ? 'bg-emerald-500' : status === 'suspended' ? 'bg-red-500' : 'bg-muted-foreground',
      ]"
    />
    {{ TENANT_STATUS[status] }}
  </span>
</template>
