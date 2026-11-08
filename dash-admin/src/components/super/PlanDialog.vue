<script setup lang="ts">
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { LoaderCircle } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api, errorMessage } from '@/lib/api'
import { dateInputValue } from '@/lib/format'
import type { SuperTenantDetail } from '@/types'

// Koreksi manual masa aktif Pro (salah catat, kompensasi, uji coba). Tercatat di log.
const props = defineProps<{ tenant: SuperTenantDetail }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ saved: [tenant: SuperTenantDetail] }>()

const until = ref('')
const note = ref('')
const saving = ref(false)

watch(open, (isOpen) => {
  if (!isOpen) return
  until.value = props.tenant.pro_until ? dateInputValue(props.tenant.pro_until) : ''
  note.value = ''
})

async function save(proUntil: string | null) {
  saving.value = true
  try {
    const { data } = await api.put<SuperTenantDetail>(`/super/tenants/${props.tenant.id}/plan`, { pro_until: proUntil, note: note.value || null })
    emit('saved', data)
    open.value = false
    toast.success(proUntil ? 'Masa aktif Pro diubah.' : 'Tenant dijadikan Gratis.')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Ubah masa aktif Pro</DialogTitle>
        <DialogDescription>Untuk koreksi. Pembayaran normal cukup lewat "Catat pembayaran".</DialogDescription>
      </DialogHeader>
      <form id="plan-form" class="space-y-4" @submit.prevent="save(until)">
        <div class="space-y-2">
          <Label for="plan-until">Pro aktif sampai</Label>
          <Input id="plan-until" v-model="until" type="date" required />
        </div>
        <div class="space-y-2">
          <Label for="plan-note">Alasan</Label>
          <Input id="plan-note" v-model="note" maxlength="255" placeholder="mis. kompensasi gangguan" />
        </div>
      </form>
      <DialogFooter class="sm:justify-between">
        <Button variant="ghost" class="text-destructive" :disabled="saving" @click="save(null)">Jadikan Gratis</Button>
        <div class="flex gap-2">
          <Button variant="outline" @click="open = false">Batal</Button>
          <Button type="submit" form="plan-form" :disabled="saving || !until">
            <LoaderCircle v-if="saving" class="animate-spin" />
            Simpan
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
