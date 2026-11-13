<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { LoaderCircle } from '@lucide/vue'
import ImageField from '@/components/ImageField.vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { t } from '@/i18n'
import { api, errorMessage, fieldErrors, type FieldErrors } from '@/lib/api'
import { PACKAGE_CATEGORIES, VEHICLE_SCOPES } from '@/lib/format'
import { syncImage } from '@/lib/images'
import type { PackageCategory, ServicePackage, VehicleScope } from '@/types'

const props = defineProps<{ item: ServicePackage | null }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ saved: [item: ServicePackage] }>()

const saving = ref(false)
const errors = ref<FieldErrors>({})
const imageFile = ref<File | null>(null)
const imageRemoved = ref(false)
const form = reactive({
  name: '',
  category: 'wash' as PackageCategory,
  vehicle_scope: 'car' as VehicleScope,
  tagline: '',
  price: '' as string | number,
  duration_minutes: '' as string | number,
  description: '',
  features: '',
  is_popular: false,
  is_active: true,
})

const PRICE_HINTS = { car: 'packageDialog.hintCar', motor: 'packageDialog.hintMotor', all: 'packageDialog.hintAll' } as const satisfies Record<VehicleScope, string>
const priceHint = computed(() => t(PRICE_HINTS[form.vehicle_scope]))

watch(open, (isOpen) => {
  if (!isOpen) return
  const item = props.item
  errors.value = {}
  imageFile.value = null
  imageRemoved.value = false
  Object.assign(form, {
    name: item?.name ?? '',
    category: item?.category ?? 'wash',
    vehicle_scope: item?.vehicle_scope ?? 'car',
    tagline: item?.tagline ?? '',
    price: item?.price ?? '',
    duration_minutes: item?.duration_minutes ?? 60,
    description: item?.description ?? '',
    features: (item?.features ?? []).join('\n'),
    is_popular: item?.is_popular ?? false,
    is_active: item?.is_active ?? true,
  })
})

async function submit() {
  saving.value = true
  errors.value = {}
  const payload = {
    ...form,
    tagline: form.tagline || null,
    description: form.description || null,
    price: Number(form.price),
    duration_minutes: Number(form.duration_minutes),
    features: form.features.split('\n').map((line) => line.trim()).filter(Boolean),
  }
  try {
    const { data } = props.item
      ? await api.put<ServicePackage>(`/packages/${props.item.id}`, payload)
      : await api.post<ServicePackage>('/packages', payload)
    const withImage = await syncImage<ServicePackage>(`/packages/${data.id}`, imageFile.value, imageRemoved.value, !!props.item?.image_url)
    emit('saved', withImage ?? data)
    open.value = false
    toast.success(props.item ? t('packageDialog.updated') : t('packageDialog.added'))
  } catch (e) {
    errors.value = fieldErrors(e)
    toast.error(errorMessage(e, t('packageDialog.failed')))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-h-[90svh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ item ? t('packageDialog.edit') : t('packageDialog.add') }}</DialogTitle>
        <DialogDescription>{{ t('packageDialog.description') }}</DialogDescription>
      </DialogHeader>

      <form id="package-form" class="space-y-4" @submit.prevent="submit">
        <div class="space-y-2">
          <Label>{{ t('packageDialog.photo') }}</Label>
          <ImageField v-model:file="imageFile" v-model:removed="imageRemoved" :current-url="item?.image_url ?? null" />
        </div>
        <div class="space-y-2">
          <Label for="pkg-name">{{ t('packageDialog.name') }}</Label>
          <Input id="pkg-name" v-model="form.name" maxlength="100" required />
          <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name[0] }}</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>{{ t('common.category') }}</Label>
            <Select v-model="form.category">
              <SelectTrigger class="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="(label, value) in PACKAGE_CATEGORIES" :key="value" :value="value">{{ label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="pkg-duration">{{ t('common.durationMinutes') }}</Label>
            <Input id="pkg-duration" v-model="form.duration_minutes" type="number" min="5" max="1440" required />
            <p v-if="errors.duration_minutes" class="text-xs text-destructive">{{ errors.duration_minutes[0] }}</p>
          </div>
        </div>
        <div class="space-y-2">
          <Label>{{ t('packageDialog.vehicles') }}</Label>
          <Select v-model="form.vehicle_scope">
            <SelectTrigger class="w-full" :aria-label="t('packageDialog.vehicles')"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="(label, value) in VEHICLE_SCOPES" :key="value" :value="value">{{ label }}</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.vehicle_scope" class="text-xs text-destructive">{{ errors.vehicle_scope[0] }}</p>
        </div>
        <div class="space-y-2">
          <Label for="pkg-price">{{ t('common.priceRp') }}</Label>
          <Input id="pkg-price" v-model="form.price" type="number" min="0" step="1000" required />
          <p class="text-xs text-muted-foreground">{{ priceHint }}</p>
          <p v-if="errors.price" class="text-xs text-destructive">{{ errors.price[0] }}</p>
        </div>
        <div class="space-y-2">
          <Label for="pkg-tagline">{{ t('common.tagline') }}</Label>
          <Input id="pkg-tagline" v-model="form.tagline" maxlength="150" />
        </div>
        <div class="space-y-2">
          <Label for="pkg-description">{{ t('common.description') }}</Label>
          <Textarea id="pkg-description" v-model="form.description" rows="3" maxlength="2000" />
        </div>
        <div class="space-y-2">
          <Label for="pkg-features">{{ t('packageDialog.features') }}</Label>
          <Textarea id="pkg-features" v-model="form.features" rows="4" :placeholder="t('packageDialog.featuresPlaceholder')" />
          <p v-if="errors.features" class="text-xs text-destructive">{{ errors.features[0] }}</p>
        </div>
        <div class="flex flex-wrap gap-6">
          <label class="flex items-center gap-2 text-sm"><Switch v-model="form.is_active" /> {{ t('common.active') }}</label>
          <label class="flex items-center gap-2 text-sm"><Switch v-model="form.is_popular" /> {{ t('packageDialog.markPopular') }}</label>
        </div>
      </form>

      <DialogFooter>
        <Button variant="outline" @click="open = false">{{ t('common.cancel') }}</Button>
        <Button type="submit" form="package-form" :disabled="saving">
          <LoaderCircle v-if="saving" class="animate-spin" />
          {{ t('common.save') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
