<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { LoaderCircle } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { t } from '@/i18n'
import { api, errorMessage } from '@/lib/api'
import { TRANSACTION_METHODS } from '@/lib/format'
import type { PaymentSettings, TransactionMethod } from '@/types'

const ALL_METHODS = Object.keys(TRANSACTION_METHODS) as TransactionMethod[]

const methods = ref<TransactionMethod[] | null>(null)
const saving = ref(false)

onMounted(async () => {
  try {
    const { data } = await api.get<PaymentSettings>('/payment-settings')
    methods.value = data.methods
  } catch (e) {
    toast.error(errorMessage(e, t('payments.loadFailed')))
  }
})

function toggle(method: TransactionMethod, enabled: boolean) {
  if (!methods.value) return
  methods.value = enabled ? [...methods.value, method] : methods.value.filter((m) => m !== method)
}

async function save() {
  saving.value = true
  try {
    const { data } = await api.put<PaymentSettings>('/payment-settings', { methods: methods.value })
    methods.value = data.methods
    toast.success(t('payments.saved'))
  } catch (e) {
    toast.error(errorMessage(e, t('payments.saveFailed')))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <PageHeader :title="t('nav.payments')" :description="t('payments.description')">
    <template #actions>
      <Button :disabled="!methods?.length || saving" @click="save">
        <LoaderCircle v-if="saving" class="animate-spin" />
        {{ t('common.save') }}
      </Button>
    </template>
  </PageHeader>

  <div v-if="!methods" class="space-y-4 p-4 sm:p-6">
    <Skeleton v-for="i in 2" :key="i" class="h-48 rounded-2xl" />
  </div>

  <div v-else class="space-y-4 p-4 sm:p-6">
    <Card>
      <CardHeader>
        <CardTitle class="text-base">{{ t('payments.cashierTitle') }}</CardTitle>
        <CardDescription>{{ t('payments.cashierText') }}</CardDescription>
      </CardHeader>
      <CardContent class="divide-y divide-border/50">
        <label v-for="key in ALL_METHODS" :key="key" class="flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0">
          {{ TRANSACTION_METHODS[key] }}
          <Switch :model-value="methods.includes(key)" :aria-label="t('payments.accept', { method: TRANSACTION_METHODS[key] })" @update:model-value="(v: boolean) => toggle(key, v)" />
        </label>
        <p v-if="!methods.length" class="pt-3 text-sm text-destructive">{{ t('payments.minOne') }}</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <div class="flex flex-wrap items-center gap-2">
          <CardTitle class="text-base">{{ t('payments.onlineTitle') }}</CardTitle>
          <Badge variant="secondary">{{ t('payments.inDevelopment') }}</Badge>
        </div>
        <CardDescription>
          {{ t('payments.onlineText') }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          {{ t('payments.enableOnline') }}
          <Switch :model-value="false" disabled :aria-label="t('payments.enableOnline')" />
        </div>
      </CardContent>
    </Card>
  </div>
</template>
