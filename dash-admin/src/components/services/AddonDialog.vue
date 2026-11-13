<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { LoaderCircle } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { t } from '@/i18n'
import { api, errorMessage, fieldErrors, type FieldErrors } from '@/lib/api'
import { ADDON_CATEGORIES } from '@/lib/format'
import type { AddonCategory, ServiceAddon } from '@/types'

const props = defineProps<{ item: ServiceAddon | null }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ saved: [item: ServiceAddon] }>()

const saving = ref(false)
const errors = ref<FieldErrors>({})
const form = reactive({
  name: '',
  category: 'exterior' as AddonCategory,
  price: '' as string | number,
  duration_minutes: '' as string | number,
  description: '',
  is_active: true,
})

watch(open, (isOpen) => {
  if (!isOpen) return
  const item = props.item
  errors.value = {}
  Object.assign(form, {
    name: item?.name ?? '',
    category: item?.category ?? 'exterior',
    price: item?.price ?? '',
    duration_minutes: item?.duration_minutes ?? 15,
    description: item?.description ?? '',
    is_active: item?.is_active ?? true,
  })
})

async function submit() {
  saving.value = true
  errors.value = {}
  const payload = {
    ...form,
    description: form.description || null,
    price: Number(form.price),
    duration_minutes: Number(form.duration_minutes),
  }
  try {
    const { data } = props.item
      ? await api.put<ServiceAddon>(`/addons/${props.item.id}`, payload)
      : await api.post<ServiceAddon>('/addons', payload)
    emit('saved', data)
    open.value = false
    toast.success(props.item ? t('addonDialog.updated') : t('addonDialog.added'))
  } catch (e) {
    errors.value = fieldErrors(e)
    toast.error(errorMessage(e, t('addonDialog.failed')))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-h-[90svh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ item ? t('addonDialog.edit') : t('addonDialog.add') }}</DialogTitle>
        <DialogDescription>{{ t('addonDialog.description') }}</DialogDescription>
      </DialogHeader>

      <form id="addon-form" class="space-y-4" @submit.prevent="submit">
        <div class="space-y-2">
          <Label for="addon-name">{{ t('addonDialog.name') }}</Label>
          <Input id="addon-name" v-model="form.name" maxlength="100" required />
          <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name[0] }}</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>{{ t('common.category') }}</Label>
            <Select v-model="form.category">
              <SelectTrigger class="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="(label, value) in ADDON_CATEGORIES" :key="value" :value="value">{{ label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="addon-duration">{{ t('common.durationMinutes') }}</Label>
            <Input id="addon-duration" v-model="form.duration_minutes" type="number" min="5" max="1440" required />
            <p v-if="errors.duration_minutes" class="text-xs text-destructive">{{ errors.duration_minutes[0] }}</p>
          </div>
        </div>
        <div class="space-y-2">
          <Label for="addon-price">{{ t('common.priceRp') }}</Label>
          <Input id="addon-price" v-model="form.price" type="number" min="0" step="1000" required />
          <p v-if="errors.price" class="text-xs text-destructive">{{ errors.price[0] }}</p>
        </div>
        <div class="space-y-2">
          <Label for="addon-description">{{ t('common.description') }}</Label>
          <Textarea id="addon-description" v-model="form.description" rows="3" maxlength="1000" />
        </div>
        <label class="flex items-center gap-2 text-sm"><Switch v-model="form.is_active" /> {{ t('common.active') }}</label>
      </form>

      <DialogFooter>
        <Button variant="outline" @click="open = false">{{ t('common.cancel') }}</Button>
        <Button type="submit" form="addon-form" :disabled="saving">
          <LoaderCircle v-if="saving" class="animate-spin" />
          {{ t('common.save') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
