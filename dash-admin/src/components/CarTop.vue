<script setup lang="ts">
import { computed } from 'vue'
import { carSvg } from '@/lib/carSvg'

const props = defineProps<{ type: string; color: string }>()

// Markup berasal dari peta bentuk/warna tetap di carSvg (bukan input bebas), aman untuk v-html.
const svg = computed(() => carSvg(props.type, props.color))
</script>

<template>
  <div class="[&>svg]:h-full [&>svg]:w-full" v-html="svg" />
</template>
