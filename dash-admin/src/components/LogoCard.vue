<script setup lang="ts">
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { ImagePlus, LoaderCircle, Trash2 } from '@lucide/vue'
import UpgradeNotice from '@/components/UpgradeNotice.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { t } from '@/i18n'
import { api, errorMessage } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import type { Tenant } from '@/types'

// Logo di header situs (fitur Pro). Langsung tersimpan saat dipilih, terpisah dari tombol Simpan profil.
const auth = useAuthStore()
const tenant = computed(() => auth.tenant)
const allowed = computed(() => tenant.value?.features.custom_logo ?? false)

const input = ref<HTMLInputElement | null>(null)
const busy = ref(false)

async function run(request: () => Promise<{ data: Tenant }>, success: string) {
  busy.value = true
  try {
    auth.setTenant((await request()).data)
    toast.success(success)
  } catch (e) {
    toast.error(errorMessage(e, t('logo.saveFailed')))
  } finally {
    busy.value = false
  }
}

function pick(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (input.value) input.value.value = ''
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    toast.error(t('logo.badFormat'))
    return
  }
  if (file.size > 3 * 1024 * 1024) {
    toast.error(t('logo.tooLarge'))
    return
  }
  const body = new FormData()
  body.append('image', file)
  run(() => api.post<Tenant>('/tenant/logo', body), t('logo.updated'))
}

function remove() {
  run(() => api.delete<Tenant>('/tenant/logo'), t('logo.removed'))
}
</script>

<template>
  <Card v-if="tenant">
    <CardHeader>
      <CardTitle class="text-base">{{ t('logo.title') }}</CardTitle>
      <CardDescription>{{ t('logo.text') }}</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <!-- Pratinjau header situs tenant (warna terang, seperti situs aslinya) -->
      <div class="flex items-center gap-3 rounded-xl border border-border/60 bg-white px-4 py-3 text-slate-900">
        <img
          v-if="tenant.logo_url"
          :src="tenant.logo_url"
          alt=""
          :class="['h-10 w-auto max-w-32 object-contain', !allowed && 'opacity-40 grayscale']"
        />
        <span v-else class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2f7bf6] text-lg font-extrabold text-white">
          {{ tenant.name.charAt(0).toUpperCase() }}
        </span>
        <span class="truncate font-bold">{{ tenant.name }}</span>
      </div>

      <UpgradeNotice v-if="!allowed" :message="t('logo.proOnly')" />
      <p v-if="!allowed && tenant.logo_url" class="text-sm text-muted-foreground">
        {{ t('logo.hiddenOnFree') }}
      </p>

      <div v-if="allowed || tenant.logo_url" class="flex flex-wrap gap-2">
        <Button v-if="allowed" type="button" variant="outline" size="sm" :disabled="busy" @click="input?.click()">
          <LoaderCircle v-if="busy" class="animate-spin" />
          <ImagePlus v-else />
          {{ tenant.logo_url ? t('logo.change') : t('logo.upload') }}
        </Button>
        <Button v-if="tenant.logo_url" type="button" variant="ghost" size="sm" :disabled="busy" @click="remove">
          <Trash2 /> {{ t('logo.remove') }}
        </Button>
      </div>
      <input ref="input" type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="pick" />
    </CardContent>
  </Card>
</template>
