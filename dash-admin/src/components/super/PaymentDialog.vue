<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { LoaderCircle } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { t } from '@/i18n'
import { api, errorMessage, fieldErrors, type FieldErrors } from '@/lib/api'
import { dateInputValue, PAYMENT_METHODS, rupiah, shortDate } from '@/lib/format'
import type { PaymentPeriod, SuperTenantDetail } from '@/types'

const props = defineProps<{ tenant: SuperTenantDetail }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ saved: [tenant: SuperTenantDetail] }>()

const saving = ref(false)
const errors = ref<FieldErrors>({})
const form = reactive({
  period: 'monthly' as PaymentPeriod,
  amount: 0 as string | number,
  method: 'transfer',
  reference: '',
  note: '',
  paid_at: '',
})

watch(open, (isOpen) => {
  if (!isOpen) return
  errors.value = {}
  Object.assign(form, {
    period: 'monthly',
    amount: props.tenant.prices.monthly,
    method: 'transfer',
    reference: '',
    note: '',
    paid_at: dateInputValue(),
  })
})

watch(
  () => form.period,
  (period) => (form.amount = props.tenant.prices[period]),
)

// Perpanjangan dimulai dari akhir masa aktif sekarang kalau masih Pro.
const newUntil = computed(() => {
  const active = props.tenant.plan === 'pro' && props.tenant.pro_until ? new Date(props.tenant.pro_until) : new Date()
  const end = new Date(active)
  end.setMonth(end.getMonth() + (form.period === 'yearly' ? 12 : 1))
  return end.toISOString()
})

async function submit() {
  saving.value = true
  errors.value = {}
  try {
    const { data } = await api.post<SuperTenantDetail>(`/super/tenants/${props.tenant.id}/payments`, {
      ...form,
      amount: Number(form.amount),
      reference: form.reference || null,
      note: form.note || null,
    })
    emit('saved', data)
    open.value = false
    toast.success(t('paymentDialog.saved', { date: shortDate(data.pro_until) }))
  } catch (e) {
    errors.value = fieldErrors(e)
    toast.error(errorMessage(e, t('paymentDialog.failed')))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ t('paymentDialog.title') }}</DialogTitle>
        <DialogDescription>{{ t('paymentDialog.description', { name: tenant.name, date: shortDate(newUntil) }) }}</DialogDescription>
      </DialogHeader>

      <form id="payment-form" class="space-y-4" @submit.prevent="submit">
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="p in (['monthly', 'yearly'] as const)"
            :key="p"
            type="button"
            :class="['rounded-xl border p-3 text-left text-sm', form.period === p ? 'border-foreground bg-accent' : 'border-border/60']"
            @click="form.period = p"
          >
            <span class="block font-medium">{{ p === 'monthly' ? t('common.monthly') : t('common.yearly') }}</span>
            <span class="text-muted-foreground">{{ rupiah(tenant.prices[p]) }}</span>
          </button>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="pay-amount">{{ t('paymentDialog.amount') }}</Label>
            <Input id="pay-amount" v-model="form.amount" type="number" min="0" step="1000" required />
            <p v-if="errors.amount" class="text-xs text-destructive">{{ errors.amount[0] }}</p>
          </div>
          <div class="space-y-2">
            <Label for="pay-date">{{ t('paymentDialog.date') }}</Label>
            <Input id="pay-date" v-model="form.paid_at" type="date" required />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>{{ t('paymentDialog.method') }}</Label>
            <Select v-model="form.method">
              <SelectTrigger class="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="(label, value) in PAYMENT_METHODS" :key="value" :value="value">{{ label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="pay-ref">{{ t('paymentDialog.reference') }}</Label>
            <Input id="pay-ref" v-model="form.reference" maxlength="100" :placeholder="t('common.optionalLower')" />
          </div>
        </div>
        <div class="space-y-2">
          <Label for="pay-note">{{ t('paymentDialog.note') }}</Label>
          <Input id="pay-note" v-model="form.note" maxlength="255" :placeholder="t('common.optionalLower')" />
        </div>
      </form>

      <DialogFooter>
        <Button variant="outline" @click="open = false">{{ t('common.cancel') }}</Button>
        <Button type="submit" form="payment-form" :disabled="saving">
          <LoaderCircle v-if="saving" class="animate-spin" />
          {{ t('paymentDialog.submit') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
