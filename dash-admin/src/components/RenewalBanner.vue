<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { CircleAlert } from '@lucide/vue'
import { shortDate } from '@/lib/format'
import { renewalState } from '@/lib/plans'
import { useAuthStore } from '@/stores/auth'

// Pengingat bayar langganan di atas semua halaman tenant (kecuali halaman Langganan itu sendiri).
const auth = useAuthStore()
const route = useRoute()

const tenant = computed(() => auth.tenant)
const state = computed(() =>
  tenant.value && route.path !== '/langganan' ? renewalState(tenant.value.plan, tenant.value.pro_until) : null,
)
</script>

<template>
  <RouterLink
    v-if="tenant && state"
    to="/langganan"
    :class="[
      'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors sm:px-6',
      state.kind === 'expiring'
        ? 'bg-amber-500/15 text-amber-800 hover:bg-amber-500/20 dark:text-amber-200'
        : 'bg-red-500/15 text-red-800 hover:bg-red-500/20 dark:text-red-200',
    ]"
  >
    <CircleAlert class="h-4 w-4 shrink-0" />
    <span class="flex-1">
      <template v-if="state.kind === 'expiring'">
        <strong>Pro berakhir {{ shortDate(tenant.pro_until) }}</strong> ({{ state.daysLeft }} hari lagi).
        Perpanjang supaya reservasi online, promo, dan logo tetap aktif.
      </template>
      <template v-else>
        <strong>Pro sudah berakhir {{ shortDate(tenant.pro_until) }}.</strong>
        Situsmu kembali ke paket Gratis: reservasi online mati, promo tinggal 1 foto, logo disembunyikan.
      </template>
    </span>
    <span
      :class="[
        'shrink-0 rounded-full px-3 py-1 text-xs font-semibold',
        state.kind === 'expiring' ? 'bg-amber-500 text-amber-950' : 'bg-red-500 text-white',
      ]"
    >
      Perpanjang
    </span>
  </RouterLink>
</template>
