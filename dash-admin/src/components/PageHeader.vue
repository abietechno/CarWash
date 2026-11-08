<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <!-- Header kaca (glassmorphism) yang menempel saat discroll -->
  <div class="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-xl">
    <div class="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <div class="min-w-0">
        <h1 class="truncate text-xl font-bold">{{ title }}</h1>
        <p v-if="description" class="truncate text-sm text-muted-foreground">{{ description }}</p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
