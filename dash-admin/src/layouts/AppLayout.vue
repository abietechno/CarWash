<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Building2,
  CarFront,
  ChartColumn,
  Crown,
  Globe,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Moon,
  Settings,
  ShoppingCart,
  Store,
  Sun,
  Tags,
} from '@lucide/vue'
import RenewalBanner from '@/components/RenewalBanner.vue'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useDarkMode } from '@/composables/useDarkMode'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { isDark, toggle: toggleDark } = useDarkMode()

const TENANT_NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/antrian', label: 'Antrian', icon: CarFront },
  { to: '/kasir', label: 'Kasir', icon: ShoppingCart },
  { to: '/laporan', label: 'Laporan', icon: ChartColumn },
  { to: '/profil', label: 'Profil Bisnis', icon: Store },
  { to: '/layanan', label: 'Layanan & Harga', icon: Tags },
  { to: '/langganan', label: 'Langganan', icon: Crown },
]

const SUPER_NAV = [
  { to: '/super', label: 'Ringkasan', icon: LayoutDashboard },
  { to: '/super/tenants', label: 'Tenant', icon: Building2 },
  { to: '/super/settings', label: 'Pengaturan', icon: Settings },
]

const navItems = computed(() => (auth.isSuperadmin ? SUPER_NAV : TENANT_NAV))
const siteUrl = computed(() => (auth.isSuperadmin ? null : auth.tenant?.url))

// Nav bawah mobile tenant: 4 menu utama, sisanya di "Lainnya" supaya ikon tidak terlalu rapat.
const MOBILE_PRIMARY = 4
const mobileNav = computed(() => (auth.isSuperadmin ? navItems.value : navItems.value.slice(0, MOBILE_PRIMARY)))
const moreNav = computed(() => (auth.isSuperadmin ? [] : navItems.value.slice(MOBILE_PRIMARY)))
const moreOpen = ref(false)
const moreActive = computed(() => moreNav.value.some((item) => isActive(item.to)))

watch(
  () => route.fullPath,
  () => (moreOpen.value = false),
)

function isActive(path: string) {
  return path === '/' || path === '/super' ? route.path === path : route.path.startsWith(path)
}

async function handleLogout() {
  const wasImpersonating = auth.impersonating
  await auth.logout()
  router.push(wasImpersonating && auth.isLoggedIn ? { name: 'super-tenants' } : { name: 'login' })
}

// Keluar dari mode bantuan, kembali ke detail tenant di super-admin.
async function backToSuper() {
  const tenantId = auth.tenant?.id
  await auth.stopImpersonation()
  router.push(tenantId ? { name: 'super-tenant', params: { id: tenantId } } : { name: 'super' })
}
</script>

<template>
  <TooltipProvider :delay-duration="0">
    <div class="relative min-h-screen bg-background transition-colors duration-200">
      <!-- Sidebar desktop: ikon saja, gaya Threads -->
      <aside class="fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col items-center bg-background py-5 md:flex">
        <RouterLink
          to="/"
          aria-label="CarWash Cloud"
          class="mb-6 flex h-12 w-16 items-center justify-center transition-all hover:scale-110"
        >
          <img src="/logo.png" alt="" class="w-full" />
        </RouterLink>

        <nav class="flex flex-1 flex-col items-center gap-1">
          <Tooltip v-for="item in navItems" :key="item.to">
            <TooltipTrigger as-child>
              <RouterLink
                :to="item.to"
                :aria-label="item.label"
                :class="[
                  'flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200',
                  isActive(item.to) ? 'text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                ]"
              >
                <component :is="item.icon" class="h-[26px] w-[26px]" :stroke-width="isActive(item.to) ? 2.5 : 1.5" />
              </RouterLink>
            </TooltipTrigger>
            <TooltipContent side="right" :side-offset="8" class="rounded-xl text-xs">{{ item.label }}</TooltipContent>
          </Tooltip>

          <Tooltip v-if="siteUrl">
            <TooltipTrigger as-child>
              <a
                :href="siteUrl"
                target="_blank"
                rel="noopener"
                aria-label="Lihat situs"
                class="flex h-12 w-12 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Globe class="h-[26px] w-[26px]" :stroke-width="1.5" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="right" :side-offset="8" class="rounded-xl text-xs">Lihat situs</TooltipContent>
          </Tooltip>
        </nav>

        <div class="flex flex-col items-center gap-1">
          <Tooltip>
            <TooltipTrigger as-child>
              <button
                type="button"
                :aria-label="isDark ? 'Mode terang' : 'Mode gelap'"
                class="flex h-12 w-12 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                @click="toggleDark"
              >
                <Moon v-if="!isDark" class="h-[26px] w-[26px]" :stroke-width="1.5" />
                <Sun v-else class="h-[26px] w-[26px]" :stroke-width="1.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" :side-offset="8" class="rounded-xl text-xs">
              {{ isDark ? 'Mode terang' : 'Mode gelap' }}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger as-child>
              <button
                type="button"
                aria-label="Keluar"
                class="flex h-12 w-12 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                @click="handleLogout"
              >
                <LogOut class="h-[26px] w-[26px]" :stroke-width="1.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" :side-offset="8" class="rounded-xl text-xs">Keluar</TooltipContent>
          </Tooltip>
        </div>
      </aside>

      <!-- Konten: kolom di tengah -->
      <div class="md:pl-[76px]">
        <div class="mx-auto min-h-screen max-w-5xl border-border/50 pb-20 md:border-x md:pb-0">
          <div
            v-if="auth.impersonating"
            class="flex flex-wrap items-center justify-between gap-2 bg-amber-400 px-4 py-2 text-sm font-medium text-amber-950"
          >
            <span class="flex items-center gap-2">
              <LifeBuoy class="h-4 w-4" />
              Mode bantuan: kamu sedang di dashboard {{ auth.tenant?.name }}
            </span>
            <button type="button" class="rounded-full bg-amber-950 px-3 py-1 text-xs font-semibold text-amber-50" @click="backToSuper">
              Kembali ke super-admin
            </button>
          </div>
          <RenewalBanner v-if="!auth.isSuperadmin" />
          <slot />
        </div>
      </div>

      <!-- Nav bawah mobile -->
      <nav
        class="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border/50 bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <RouterLink
          v-for="item in mobileNav"
          :key="item.to"
          :to="item.to"
          :aria-label="item.label"
          :class="['flex flex-1 flex-col items-center py-3 transition-colors', isActive(item.to) ? 'text-foreground' : 'text-muted-foreground']"
        >
          <component :is="item.icon" class="h-6 w-6" :stroke-width="isActive(item.to) ? 2.5 : 1.5" />
        </RouterLink>
        <button
          v-if="moreNav.length"
          type="button"
          aria-label="Menu lainnya"
          :aria-expanded="moreOpen"
          :class="['flex flex-1 flex-col items-center py-3 transition-colors', moreActive || moreOpen ? 'text-foreground' : 'text-muted-foreground']"
          @click="moreOpen = !moreOpen"
        >
          <Menu class="h-6 w-6" :stroke-width="moreActive ? 2.5 : 1.5" />
        </button>
        <template v-else>
          <button type="button" aria-label="Ganti tema" class="flex flex-1 flex-col items-center py-3 text-muted-foreground" @click="toggleDark">
            <Moon v-if="!isDark" class="h-6 w-6" :stroke-width="1.5" />
            <Sun v-else class="h-6 w-6" :stroke-width="1.5" />
          </button>
          <button type="button" aria-label="Keluar" class="flex flex-1 flex-col items-center py-3 text-muted-foreground" @click="handleLogout">
            <LogOut class="h-6 w-6" :stroke-width="1.5" />
          </button>
        </template>
      </nav>

      <template v-if="moreOpen">
        <div class="fixed inset-0 z-[55] md:hidden" @click="moreOpen = false" />
        <div class="fixed right-2 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-[60] w-56 rounded-2xl border border-border/60 bg-popover p-1.5 text-sm shadow-xl md:hidden">
          <RouterLink
            v-for="item in moreNav"
            :key="item.to"
            :to="item.to"
            :class="['flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent', isActive(item.to) && 'font-semibold']"
          >
            <component :is="item.icon" class="h-5 w-5" :stroke-width="1.5" />
            {{ item.label }}
          </RouterLink>
          <button type="button" class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent" @click="toggleDark">
            <Moon v-if="!isDark" class="h-5 w-5" :stroke-width="1.5" />
            <Sun v-else class="h-5 w-5" :stroke-width="1.5" />
            {{ isDark ? 'Mode terang' : 'Mode gelap' }}
          </button>
          <button type="button" class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent" @click="handleLogout">
            <LogOut class="h-5 w-5" :stroke-width="1.5" />
            Keluar
          </button>
        </div>
      </template>
    </div>
  </TooltipProvider>
</template>
