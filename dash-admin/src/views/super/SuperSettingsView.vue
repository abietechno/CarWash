<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
import { LoaderCircle } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { t } from '@/i18n'
import { api, errorMessage, fieldErrors, type FieldErrors } from '@/lib/api'
import type { PlatformSettings } from '@/types'

const loaded = ref(false)
const saving = ref(false)
const errors = ref<FieldErrors>({})
const form = reactive({
  pro_monthly_price: 0 as string | number,
  pro_yearly_price: 0 as string | number,
  payment_instructions: '',
  contact_whatsapp: '',
})

onMounted(async () => {
  try {
    Object.assign(form, (await api.get<PlatformSettings>('/super/settings')).data)
    loaded.value = true
  } catch (e) {
    toast.error(errorMessage(e))
  }
})

async function save() {
  saving.value = true
  errors.value = {}
  try {
    const { data } = await api.put<PlatformSettings>('/super/settings', {
      ...form,
      pro_monthly_price: Number(form.pro_monthly_price),
      pro_yearly_price: Number(form.pro_yearly_price),
      contact_whatsapp: form.contact_whatsapp || null,
    })
    Object.assign(form, data)
    toast.success(t('superSettings.saved'))
  } catch (e) {
    errors.value = fieldErrors(e)
    toast.error(errorMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <PageHeader :title="t('superSettings.title')" :description="t('superSettings.description')">
    <template #actions>
      <Button :disabled="!loaded || saving" @click="save">
        <LoaderCircle v-if="saving" class="animate-spin" />
        {{ t('common.save') }}
      </Button>
    </template>
  </PageHeader>

  <form class="space-y-4 p-4 sm:p-6" @submit.prevent="save">
    <Card>
      <CardHeader>
        <CardTitle class="text-base">{{ t('superSettings.priceTitle') }}</CardTitle>
        <CardDescription>{{ t('superSettings.priceText') }}</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="price-monthly">{{ t('superSettings.monthly') }}</Label>
          <Input id="price-monthly" v-model="form.pro_monthly_price" type="number" min="0" step="1000" />
          <p v-if="errors.pro_monthly_price" class="text-xs text-destructive">{{ errors.pro_monthly_price[0] }}</p>
        </div>
        <div class="space-y-2">
          <Label for="price-yearly">{{ t('superSettings.yearly') }}</Label>
          <Input id="price-yearly" v-model="form.pro_yearly_price" type="number" min="0" step="1000" />
          <p v-if="errors.pro_yearly_price" class="text-xs text-destructive">{{ errors.pro_yearly_price[0] }}</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">{{ t('superSettings.paymentTitle') }}</CardTitle>
        <CardDescription>{{ t('superSettings.paymentText') }}</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="pay-instructions">{{ t('superSettings.instructions') }}</Label>
          <Textarea id="pay-instructions" v-model="form.payment_instructions" rows="5" :placeholder="t('superSettings.instructionsPlaceholder')" />
        </div>
        <div class="space-y-2">
          <Label for="contact-wa">{{ t('superSettings.adminWhatsapp') }}</Label>
          <Input id="contact-wa" v-model="form.contact_whatsapp" inputmode="tel" placeholder="0812..." />
          <p v-if="errors.contact_whatsapp" class="text-xs text-destructive">{{ errors.contact_whatsapp[0] }}</p>
        </div>
      </CardContent>
    </Card>
  </form>
</template>
