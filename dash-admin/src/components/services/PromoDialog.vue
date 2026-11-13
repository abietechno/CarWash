<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { LoaderCircle } from '@lucide/vue'
import ImageField from '@/components/ImageField.vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { t } from '@/i18n'
import { api, errorMessage, fieldErrors, type FieldErrors } from '@/lib/api'
import { syncImage } from '@/lib/images'
import { PROMO_THEME_LABELS, PROMO_THEMES } from '@/lib/format'
import type { Promo, PromoTheme, ServicePackage } from '@/types'

const props = defineProps<{ item: Promo | null; packages: ServicePackage[] }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ saved: [item: Promo] }>()

const NO_PACKAGE = 'none'

const saving = ref(false)
const errors = ref<FieldErrors>({})
const imageFile = ref<File | null>(null)
const imageRemoved = ref(false)
const form = reactive({
  title: '',
  subtitle: '',
  badge: '',
  package: NO_PACKAGE as string,
  theme: 'blue' as PromoTheme,
  is_active: true,
})

watch(open, (isOpen) => {
  if (!isOpen) return
  const item = props.item
  errors.value = {}
  imageFile.value = null
  imageRemoved.value = false
  Object.assign(form, {
    title: item?.title ?? '',
    subtitle: item?.subtitle ?? '',
    badge: item?.badge ?? '',
    package: item?.service_package_id ? String(item.service_package_id) : NO_PACKAGE,
    theme: item?.theme ?? 'blue',
    is_active: item?.is_active ?? true,
  })
})

async function submit() {
  saving.value = true
  errors.value = {}
  const payload = {
    title: form.title,
    subtitle: form.subtitle || null,
    badge: form.badge || null,
    service_package_id: form.package === NO_PACKAGE ? null : Number(form.package),
    theme: form.theme,
    is_active: form.is_active,
  }
  try {
    const { data } = props.item
      ? await api.put<Promo>(`/promos/${props.item.id}`, payload)
      : await api.post<Promo>('/promos', payload)
    const withImage = await syncImage<Promo>(`/promos/${data.id}`, imageFile.value, imageRemoved.value, !!props.item?.image_url)
    emit('saved', withImage ?? data)
    open.value = false
    toast.success(props.item ? t('promoDialog.updated') : t('promoDialog.added'))
  } catch (e) {
    errors.value = fieldErrors(e)
    toast.error(errorMessage(e, t('promoDialog.failed')))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-h-[90svh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ item ? t('promoDialog.edit') : t('promoDialog.add') }}</DialogTitle>
        <DialogDescription>{{ t('promoDialog.description') }}</DialogDescription>
      </DialogHeader>

      <form id="promo-form" class="space-y-4" @submit.prevent="submit">
        <div class="space-y-2">
          <Label>{{ t('promoDialog.photo') }}</Label>
          <ImageField v-model:file="imageFile" v-model:removed="imageRemoved" :current-url="item?.image_url ?? null" />
        </div>
        <div class="space-y-2">
          <Label for="promo-title">{{ t('promoDialog.title') }}</Label>
          <Input id="promo-title" v-model="form.title" maxlength="100" required :placeholder="t('promoDialog.titlePlaceholder')" />
          <p v-if="errors.title" class="text-xs text-destructive">{{ errors.title[0] }}</p>
        </div>
        <div class="space-y-2">
          <Label for="promo-subtitle">{{ t('promoDialog.subtitle') }}</Label>
          <Input id="promo-subtitle" v-model="form.subtitle" maxlength="200" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="promo-badge">{{ t('promoDialog.badge') }}</Label>
            <Input id="promo-badge" v-model="form.badge" maxlength="40" :placeholder="t('promoDialog.badgePlaceholder')" />
          </div>
          <div class="space-y-2">
            <Label>{{ t('promoDialog.color') }}</Label>
            <Select v-model="form.theme">
              <SelectTrigger class="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="(theme, value) in PROMO_THEMES" :key="value" :value="value">
                  <span class="h-3 w-3 rounded-full" :style="{ background: theme.swatch }" /> {{ PROMO_THEME_LABELS[value] }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div class="space-y-2">
          <Label>{{ t('promoDialog.target') }}</Label>
          <Select v-model="form.package">
            <SelectTrigger class="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem :value="NO_PACKAGE">{{ t('promoDialog.noPackage') }}</SelectItem>
              <SelectItem v-for="pkg in packages" :key="pkg.id" :value="String(pkg.id)">{{ pkg.name }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <label class="flex items-center gap-2 text-sm"><Switch v-model="form.is_active" /> {{ t('promoDialog.show') }}</label>
      </form>

      <DialogFooter>
        <Button variant="outline" @click="open = false">{{ t('common.cancel') }}</Button>
        <Button type="submit" form="promo-form" :disabled="saving">
          <LoaderCircle v-if="saving" class="animate-spin" />
          {{ t('common.save') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
