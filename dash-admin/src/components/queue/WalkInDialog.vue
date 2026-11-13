<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { LoaderCircle } from '@lucide/vue'
import CarTop from '@/components/CarTop.vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { t } from '@/i18n'
import { api, errorMessage, fieldErrors, type FieldErrors } from '@/lib/api'
import { VEHICLE_COLORS } from '@/lib/carSvg'
import { colorLabel, rupiah } from '@/lib/format'
import { fitsVehicle, isMotor, scopedPrice } from '@/lib/vehicles'
import type { QueueBoard, ServicePackage, VehicleType } from '@/types'

const props = defineProps<{ packages: ServicePackage[]; vehicleTypes: VehicleType[] }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ saved: [board: QueueBoard] }>()

const saving = ref(false)
const errors = ref<FieldErrors>({})
const form = reactive({
  customer_name: '',
  phone: '',
  plate: '',
  vehicle_type: 'compact',
  vehicle_brand: '',
  vehicle_color: 'white',
  package_id: null as number | null,
})

const vehiclePackages = computed(() => props.packages.filter((p) => p.is_active && fitsVehicle(p.vehicle_scope, form.vehicle_type)))
const multiplier = computed(() => props.vehicleTypes.find((v) => v.code === form.vehicle_type)?.price_multiplier ?? 1)

function keepValidPackage() {
  if (!vehiclePackages.value.some((p) => p.id === form.package_id)) form.package_id = vehiclePackages.value[0]?.id ?? null
}

watch(() => form.vehicle_type, keepValidPackage)

watch(open, (isOpen) => {
  if (!isOpen) return
  errors.value = {}
  Object.assign(form, {
    customer_name: '',
    phone: '',
    plate: '',
    vehicle_type: props.vehicleTypes[0]?.code ?? 'compact',
    vehicle_brand: '',
    vehicle_color: 'white',
    package_id: null,
  })
  keepValidPackage()
})

async function submit() {
  saving.value = true
  errors.value = {}
  try {
    const { data } = await api.post<QueueBoard>('/bookings', {
      ...form,
      phone: form.phone || null,
      vehicle_brand: form.vehicle_brand || null,
      plate: form.plate || null,
    })
    emit('saved', data)
    open.value = false
    toast.success(t('walkIn.added', { name: form.customer_name }))
  } catch (e) {
    errors.value = fieldErrors(e)
    toast.error(errorMessage(e, t('walkIn.failed')))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-h-[90svh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ t('walkIn.title') }}</DialogTitle>
        <DialogDescription>{{ t('walkIn.description') }}</DialogDescription>
      </DialogHeader>

      <form id="walkin-form" class="space-y-4" @submit.prevent="submit">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2 space-y-2 sm:col-span-1">
            <Label for="walkin-name">{{ t('walkIn.name') }}</Label>
            <Input id="walkin-name" v-model="form.customer_name" maxlength="100" required />
            <p v-if="errors.customer_name" class="text-xs text-destructive">{{ errors.customer_name[0] }}</p>
          </div>
          <div class="col-span-2 space-y-2 sm:col-span-1">
            <Label for="walkin-phone">{{ t('walkIn.phone') }}</Label>
            <Input id="walkin-phone" v-model="form.phone" inputmode="tel" />
            <p v-if="errors.phone" class="text-xs text-destructive">{{ errors.phone[0] }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <Label>{{ t('walkIn.vehicleType') }}</Label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="type in vehicleTypes"
              :key="type.code"
              type="button"
              :class="[
                'flex items-center gap-2 rounded-xl border p-2 text-left text-xs transition-colors',
                form.vehicle_type === type.code ? 'border-foreground bg-accent' : 'border-border/60 hover:bg-accent/50',
              ]"
              @click="form.vehicle_type = type.code"
            >
              <CarTop :type="type.code" :color="form.vehicle_color" class="h-8 w-14 shrink-0" />
              <span class="line-clamp-3">{{ type.name }}</span>
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="walkin-brand">{{ t('walkIn.brand') }}</Label>
          <Input id="walkin-brand" v-model="form.vehicle_brand" maxlength="60" :placeholder="isMotor(form.vehicle_type) ? 'Honda Beat' : 'Honda Accord'" />
          <p v-if="errors.vehicle_brand" class="text-xs text-destructive">{{ errors.vehicle_brand[0] }}</p>
        </div>

        <div class="space-y-2">
          <Label>{{ t('walkIn.color') }} <span class="font-normal text-muted-foreground">{{ colorLabel(form.vehicle_color) }}</span></Label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(color, code) in VEHICLE_COLORS"
              :key="code"
              type="button"
              :title="colorLabel(code)"
              :aria-label="colorLabel(code)"
              :class="['h-7 w-7 rounded-full border-2 transition-transform', form.vehicle_color === code ? 'scale-110 border-foreground' : 'border-border']"
              :style="{ background: color.body }"
              @click="form.vehicle_color = code"
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label>{{ t('walkIn.package') }}</Label>
          <div class="space-y-2">
            <label
              v-for="pkg in vehiclePackages"
              :key="pkg.id"
              :class="[
                'flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-sm',
                form.package_id === pkg.id ? 'border-foreground bg-accent' : 'border-border/60',
              ]"
            >
              <span class="flex items-center gap-2">
                <input v-model="form.package_id" type="radio" name="walkin-package" :value="pkg.id" class="accent-current" />
                {{ pkg.name }}
              </span>
              <span class="font-display font-semibold">{{ rupiah(scopedPrice(pkg.price, pkg.vehicle_scope, multiplier)) }}</span>
            </label>
            <p v-if="!vehiclePackages.length" class="text-sm text-muted-foreground">{{ t('queue.noPackages') }}</p>
          </div>
          <p v-if="errors.package_id" class="text-xs text-destructive">{{ errors.package_id[0] }}</p>
        </div>

        <div class="space-y-2">
          <Label for="walkin-plate">{{ t('walkIn.plate') }}</Label>
          <Input id="walkin-plate" v-model="form.plate" maxlength="20" :placeholder="t('walkIn.platePlaceholder')" />
        </div>
      </form>

      <DialogFooter>
        <Button variant="outline" @click="open = false">{{ t('common.cancel') }}</Button>
        <Button type="submit" form="walkin-form" :disabled="saving || !form.package_id">
          <LoaderCircle v-if="saving" class="animate-spin" />
          {{ t('walkIn.submit') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
