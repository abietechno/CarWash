<script setup lang="ts">
defineProps<{ active?: boolean }>()
</script>

<template>
  <button
    type="button"
    :aria-pressed="!!active"
    :class="[
      'rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-50',
      active ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
    ]"
  >
    <slot />
  </button>
</template>
