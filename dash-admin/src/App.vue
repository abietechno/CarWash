<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { Toaster } from '@/components/ui/sonner'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()

const withLayout = computed(() => auth.isLoggedIn && route.meta.requiresAuth === true)
</script>

<template>
  <AppLayout v-if="withLayout">
    <RouterView />
  </AppLayout>
  <RouterView v-else />

  <Toaster rich-colors position="top-center" />
</template>
