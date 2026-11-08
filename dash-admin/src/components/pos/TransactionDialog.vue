<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { Ban, LoaderCircle, MessageCircle, Printer } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { api, errorMessage } from '@/lib/api'
import { dateTime, EXPENSE_CATEGORIES, rupiah, TRANSACTION_METHODS } from '@/lib/format'
import { whatsappUrl } from '@/lib/plans'
import { printReceipt, receiptText } from '@/lib/receipt'
import { useAuthStore } from '@/stores/auth'
import type { Transaction } from '@/types'

// Struk penjualan / detail pengeluaran, plus pembatalan transaksi.
const props = defineProps<{ transaction: Transaction | null; title?: string }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ voided: [transaction: Transaction] }>()

const auth = useAuthStore()
const voiding = ref(false)
const reason = ref('')
const saving = ref(false)

watch(open, (isOpen) => {
  if (isOpen) {
    voiding.value = false
    reason.value = ''
  }
})

const tx = computed(() => props.transaction)
const isSale = computed(() => tx.value?.type === 'income')
const waUrl = computed(() =>
  tx.value && auth.tenant && isSale.value ? whatsappUrl(tx.value.customer_phone, receiptText(tx.value, auth.tenant)) : null,
)

async function confirmVoid() {
  if (!tx.value) return
  saving.value = true
  try {
    const { data } = await api.post<Transaction>(`/transactions/${tx.value.id}/void`, { reason: reason.value })
    emit('voided', data)
    open.value = false
    toast.success('Transaksi dibatalkan.')
  } catch (e) {
    toast.error(errorMessage(e, 'Gagal membatalkan transaksi.'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent v-if="tx" class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ title ?? (isSale ? 'Struk penjualan' : 'Pengeluaran') }}</DialogTitle>
        <DialogDescription>{{ tx.number }} · {{ dateTime(tx.created_at) }}</DialogDescription>
      </DialogHeader>

      <p v-if="tx.voided_at" class="rounded-xl bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
        <strong>Dibatalkan {{ dateTime(tx.voided_at) }}.</strong> {{ tx.void_reason }}
      </p>

      <div class="space-y-3 text-sm">
        <template v-if="isSale">
          <p v-if="tx.customer_name || tx.description" class="text-muted-foreground">
            <template v-if="tx.customer_name">Pelanggan: <span class="text-foreground">{{ tx.customer_name }}</span></template>
            <template v-if="tx.customer_name && tx.description"> · </template>{{ tx.description }}
          </p>
          <ul class="space-y-1.5">
            <li v-for="item in tx.items" :key="item.id" class="flex justify-between gap-3">
              <span class="min-w-0">{{ item.qty }}× {{ item.name }}</span>
              <span class="shrink-0 tabular-nums">{{ rupiah(item.subtotal) }}</span>
            </li>
          </ul>
        </template>
        <template v-else>
          <p class="flex justify-between gap-3"><span class="text-muted-foreground">Kategori</span> {{ EXPENSE_CATEGORIES[tx.category] ?? tx.category }}</p>
          <p class="flex justify-between gap-3"><span class="text-muted-foreground">Tanggal</span> {{ tx.business_date }}</p>
          <p v-if="tx.description" class="rounded-xl bg-muted/60 p-3">{{ tx.description }}</p>
        </template>

        <div class="space-y-1.5 border-t border-border/60 pt-3">
          <p v-if="tx.discount" class="flex justify-between"><span class="text-muted-foreground">Subtotal</span> <span class="tabular-nums">{{ rupiah(tx.subtotal) }}</span></p>
          <p v-if="tx.discount" class="flex justify-between"><span class="text-muted-foreground">Diskon</span> <span class="tabular-nums">-{{ rupiah(tx.discount) }}</span></p>
          <p class="flex items-baseline justify-between text-base font-bold"><span>Total</span> <span class="tabular-nums">{{ rupiah(tx.amount) }}</span></p>
          <p class="flex justify-between"><span class="text-muted-foreground">Metode</span> <Badge variant="secondary">{{ TRANSACTION_METHODS[tx.payment_method] }}</Badge></p>
          <template v-if="tx.paid_amount !== null">
            <p class="flex justify-between"><span class="text-muted-foreground">Diterima</span> <span class="tabular-nums">{{ rupiah(tx.paid_amount) }}</span></p>
            <p class="flex justify-between font-medium"><span class="text-muted-foreground">Kembalian</span> <span class="tabular-nums">{{ rupiah(tx.change) }}</span></p>
          </template>
        </div>
      </div>

      <form v-if="voiding" class="space-y-2 border-t border-border/60 pt-3" @submit.prevent="confirmVoid">
        <label for="void-reason" class="text-sm font-medium">Alasan pembatalan</label>
        <Input id="void-reason" v-model="reason" maxlength="200" required placeholder="Salah input harga" />
        <div class="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" @click="voiding = false">Kembali</Button>
          <Button type="submit" variant="destructive" size="sm" :disabled="saving || !reason.trim()">
            <LoaderCircle v-if="saving" class="animate-spin" />
            Batalkan transaksi
          </Button>
        </div>
      </form>

      <div v-else class="flex flex-wrap gap-2">
        <Button v-if="isSale && !tx.voided_at && auth.tenant" size="sm" @click="printReceipt(tx!, auth.tenant!)"><Printer /> Cetak</Button>
        <Button v-if="waUrl && !tx.voided_at" size="sm" variant="outline" as="a" :href="waUrl" target="_blank" rel="noopener"><MessageCircle /> Kirim WhatsApp</Button>
        <Button v-if="!tx.voided_at" size="sm" variant="ghost" class="ml-auto text-muted-foreground" @click="voiding = true"><Ban /> Batalkan</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
