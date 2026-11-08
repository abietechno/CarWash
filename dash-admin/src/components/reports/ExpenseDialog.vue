<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { LoaderCircle } from '@lucide/vue'
import ChipButton from '@/components/ChipButton.vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api, errorMessage, fieldErrors, type FieldErrors } from '@/lib/api'
import { dateInputValue, EXPENSE_CATEGORIES, TRANSACTION_METHODS } from '@/lib/format'
import type { Transaction, TransactionMethod } from '@/types'

const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ saved: [transaction: Transaction] }>()

const saving = ref(false)
const errors = ref<FieldErrors>({})
const form = reactive({
  category: 'supplies',
  amount: '' as number | string,
  business_date: dateInputValue(),
  payment_method: 'cash' as TransactionMethod,
  description: '',
})

watch(open, (isOpen) => {
  if (!isOpen) return
  errors.value = {}
  Object.assign(form, { category: 'supplies', amount: '', business_date: dateInputValue(), payment_method: 'cash', description: '' })
})

async function submit() {
  saving.value = true
  errors.value = {}
  try {
    const { data } = await api.post<Transaction>('/transactions/expenses', {
      ...form,
      amount: Number(form.amount),
      description: form.description.trim() || null,
    })
    emit('saved', data)
    open.value = false
    toast.success('Pengeluaran dicatat.')
  } catch (e) {
    errors.value = fieldErrors(e)
    toast.error(errorMessage(e, 'Gagal mencatat pengeluaran.'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Catat pengeluaran</DialogTitle>
        <DialogDescription>Uang keluar untuk operasional usaha.</DialogDescription>
      </DialogHeader>

      <form id="expense-form" class="space-y-4" @submit.prevent="submit">
        <div class="space-y-2">
          <p class="text-sm font-medium">Kategori</p>
          <div class="flex flex-wrap gap-2">
            <ChipButton v-for="(label, key) in EXPENSE_CATEGORIES" :key="key" :active="form.category === key" @click="form.category = String(key)">{{ label }}</ChipButton>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-2">
            <Label for="expense-amount">Jumlah (Rp)</Label>
            <Input id="expense-amount" v-model="form.amount" type="number" inputmode="numeric" min="1" required placeholder="150000" />
            <p v-if="errors.amount" class="text-xs text-destructive">{{ errors.amount[0] }}</p>
          </div>
          <div class="space-y-2">
            <Label for="expense-date">Tanggal</Label>
            <Input id="expense-date" v-model="form.business_date" type="date" :max="dateInputValue()" required />
            <p v-if="errors.business_date" class="text-xs text-destructive">{{ errors.business_date[0] }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-medium">Dibayar dengan</p>
          <div class="flex flex-wrap gap-2">
            <ChipButton v-for="(label, key) in TRANSACTION_METHODS" :key="key" :active="form.payment_method === key" @click="form.payment_method = key">{{ label }}</ChipButton>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="expense-description">Keterangan</Label>
          <Input id="expense-description" v-model="form.description" maxlength="255" placeholder="Beli sabun 5 liter" />
          <p v-if="errors.description" class="text-xs text-destructive">{{ errors.description[0] }}</p>
        </div>
      </form>

      <DialogFooter>
        <Button variant="outline" @click="open = false">Batal</Button>
        <Button type="submit" form="expense-form" :disabled="saving">
          <LoaderCircle v-if="saving" class="animate-spin" />
          Simpan
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
