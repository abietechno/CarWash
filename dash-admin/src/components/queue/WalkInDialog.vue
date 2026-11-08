<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { LoaderCircle } from '@lucide/vue'
import CarTop from '@/components/CarTop.vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api, errorMessage, fieldErrors, type FieldErrors } from '@/lib/api'
import { VEHICLE_COLORS } from '@/lib/carSvg'
import { rupiah } from '@/lib/format'
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
  vehicle_color: 'white',
  package_id: null as number | null,
})

const activePackages = computed(() => props.packages.filter((p) => p.is_active))
const multiplier = computed(() => props.vehicleTypes.find((v) => v.code === form.vehicle_type)?.price_multiplier ?? 1)

watch(open, (isOpen) => {
  if (!isOpen) return
  errors.value = {}
  Object.assign(form, {
    customer_name: '',
    phone: '',
    plate: '',
    vehicle_type: props.vehicleTypes[0]?.code ?? 'compact',
    vehicle_color: 'white',
    package_id: activePackages.value[0]?.id ?? null,
  })
})

async function submit() {
  saving.value = true
  errors.value = {}
  try {
    const { data } = await api.post<QueueBoard>('/bookings', {
      ...form,
      phone: form.phone || null,
      plate: form.plate || null,
    })
    emit('saved', data)
    open.value = false
    toast.success(`${form.customer_name} masuk antrian.`)
  } catch (e) {
    errors.value = fieldErrors(e)
    toast.error(errorMessage(e, 'Gagal menambah antrian.'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-h-[90svh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Pelanggan datang langsung</DialogTitle>
        <DialogDescription>Masuk ke antrian hari ini dan langsung tampil di situs.</DialogDescription>
      </DialogHeader>

      <form id="walkin-form" class="space-y-4" @submit.prevent="submit">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2 space-y-2 sm:col-span-1">
            <Label for="walkin-name">Nama</Label>
            <Input id="walkin-name" v-model="form.customer_name" maxlength="100" required />
            <p v-if="errors.customer_name" class="text-xs text-destructive">{{ errors.customer_name[0] }}</p>
          </div>
          <div class="col-span-2 space-y-2 sm:col-span-1">
            <Label for="walkin-phone">No. HP (opsional)</Label>
            <Input id="walkin-phone" v-model="form.phone" inputmode="tel" />
            <p v-if="errors.phone" class="text-xs text-destructive">{{ errors.phone[0] }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <Label>Jenis mobil</Label>
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
              <span class="line-clamp-2">{{ type.name }}</span>
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <Label>Warna</Label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(color, code) in VEHICLE_COLORS"
              :key="code"
              type="button"
              :title="color.label"
              :aria-label="color.label"
              :class="['h-7 w-7 rounded-full border-2 transition-transform', form.vehicle_color === code ? 'scale-110 border-foreground' : 'border-border']"
              :style="{ background: color.body }"
              @click="form.vehicle_color = code"
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label>Paket</Label>
          <div class="space-y-2">
            <label
              v-for="pkg in activePackages"
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
              <span class="font-display font-semibold">{{ rupiah(Math.round(pkg.price * multiplier)) }}</span>
            </label>
          </div>
          <p v-if="errors.package_id" class="text-xs text-destructive">{{ errors.package_id[0] }}</p>
        </div>

        <div class="space-y-2">
          <Label for="walkin-plate">Plat nomor (opsional, hanya terlihat admin)</Label>
          <Input id="walkin-plate" v-model="form.plate" maxlength="20" placeholder="L 1234 AB" />
        </div>
      </form>

      <DialogFooter>
        <Button variant="outline" @click="open = false">Batal</Button>
        <Button type="submit" form="walkin-form" :disabled="saving || !form.package_id">
          <LoaderCircle v-if="saving" class="animate-spin" />
          Masukkan antrian
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
