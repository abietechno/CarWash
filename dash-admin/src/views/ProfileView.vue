<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
import { LoaderCircle } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { api, errorMessage, fieldErrors, type FieldErrors } from '@/lib/api'
import { DAY_LABELS } from '@/lib/format'
import { useAuthStore } from '@/stores/auth'
import type { OpeningHour, Tenant } from '@/types'

const auth = useAuthStore()

const loaded = ref(false)
const saving = ref(false)
const errors = ref<FieldErrors>({})

const form = reactive({
  name: '',
  tagline: '',
  description: '',
  whatsapp: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  maps_url: '',
  bay_count: 2 as string | number,
  opening_hours: [] as OpeningHour[],
})

function fill(tenant: Tenant) {
  Object.assign(form, {
    name: tenant.name,
    tagline: tenant.tagline ?? '',
    description: tenant.description ?? '',
    whatsapp: tenant.whatsapp ?? '',
    phone: tenant.phone ?? '',
    email: tenant.email ?? '',
    address: tenant.address ?? '',
    city: tenant.city ?? '',
    maps_url: tenant.maps_url ?? '',
    bay_count: tenant.bay_count,
    opening_hours: tenant.opening_hours.map((day) => ({ ...day })),
  })
}

onMounted(async () => {
  try {
    const { data } = await api.get<Tenant>('/tenant')
    auth.setTenant(data)
    fill(data)
    loaded.value = true
  } catch (e) {
    toast.error(errorMessage(e))
  }
})

function copyMondayToAll() {
  const monday = form.opening_hours[0]
  if (!monday) return
  form.opening_hours = form.opening_hours.map((day) => ({ ...monday, day: day.day }))
}

async function save() {
  saving.value = true
  errors.value = {}
  try {
    // Kolom kosong dikirim sebagai null supaya validasi nullable berlaku.
    const payload = {
      ...Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value === '' ? null : value])),
      bay_count: Number(form.bay_count),
    }
    const { data } = await api.put<Tenant>('/tenant', payload)
    auth.setTenant(data)
    fill(data)
    toast.success('Profil disimpan.')
  } catch (e) {
    errors.value = fieldErrors(e)
    toast.error(errorMessage(e, 'Gagal menyimpan profil.'))
  } finally {
    saving.value = false
  }
}

function hourError(index: number) {
  return errors.value[`opening_hours.${index}.close`]?.[0] ?? errors.value[`opening_hours.${index}.open`]?.[0]
}
</script>

<template>
  <PageHeader title="Profil Bisnis" :description="auth.tenant?.url">
    <template #actions>
      <Button :disabled="!loaded || saving" @click="save">
        <LoaderCircle v-if="saving" class="animate-spin" />
        Simpan
      </Button>
    </template>
  </PageHeader>

  <div v-if="!loaded" class="space-y-4 p-4 sm:p-6">
    <Skeleton v-for="i in 3" :key="i" class="h-48 rounded-2xl" />
  </div>

  <form v-else class="space-y-4 p-4 sm:p-6" @submit.prevent="save">
    <Card>
      <CardHeader>
        <CardTitle class="text-base">Informasi bisnis</CardTitle>
        <CardDescription>Tampil di bagian atas situsmu.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="name">Nama bisnis</Label>
          <Input id="name" v-model="form.name" maxlength="100" required />
          <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name[0] }}</p>
        </div>
        <div class="space-y-2">
          <Label for="tagline">Tagline</Label>
          <Input id="tagline" v-model="form.tagline" maxlength="150" placeholder="Cuci & salon mobil premium di Surabaya" />
          <p v-if="errors.tagline" class="text-xs text-destructive">{{ errors.tagline[0] }}</p>
        </div>
        <div class="space-y-2">
          <Label for="description">Deskripsi</Label>
          <Textarea id="description" v-model="form.description" rows="4" maxlength="2000" placeholder="Ceritakan keunggulan bisnismu." />
          <p v-if="errors.description" class="text-xs text-destructive">{{ errors.description[0] }}</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Kontak & lokasi</CardTitle>
        <CardDescription>Pelanggan menghubungi dan menemukanmu dari sini.</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" v-model="form.whatsapp" inputmode="tel" placeholder="0812..." />
          <p v-if="errors.whatsapp" class="text-xs text-destructive">{{ errors.whatsapp[0] }}</p>
        </div>
        <div class="space-y-2">
          <Label for="phone">Telepon (opsional)</Label>
          <Input id="phone" v-model="form.phone" inputmode="tel" />
          <p v-if="errors.phone" class="text-xs text-destructive">{{ errors.phone[0] }}</p>
        </div>
        <div class="space-y-2 sm:col-span-2">
          <Label for="email">Email bisnis (opsional)</Label>
          <Input id="email" v-model="form.email" type="email" />
          <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email[0] }}</p>
        </div>
        <div class="space-y-2 sm:col-span-2">
          <Label for="address">Alamat</Label>
          <Input id="address" v-model="form.address" maxlength="255" placeholder="Jl. Raya Darmo No. 88" />
          <p v-if="errors.address" class="text-xs text-destructive">{{ errors.address[0] }}</p>
        </div>
        <div class="space-y-2">
          <Label for="city">Kota</Label>
          <Input id="city" v-model="form.city" maxlength="100" />
          <p v-if="errors.city" class="text-xs text-destructive">{{ errors.city[0] }}</p>
        </div>
        <div class="space-y-2">
          <Label for="maps_url">Link Google Maps (opsional)</Label>
          <Input id="maps_url" v-model="form.maps_url" type="url" placeholder="https://maps.app.goo.gl/..." />
          <p v-if="errors.maps_url" class="text-xs text-destructive">{{ errors.maps_url[0] }}</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Tempat cuci (bay)</CardTitle>
        <CardDescription>Berapa mobil yang bisa dikerjakan bersamaan. Dipakai untuk estimasi waktu tunggu di papan antrian.</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex items-center gap-3">
          <Input id="bay_count" v-model="form.bay_count" type="number" min="1" max="20" class="w-24" aria-label="Jumlah bay" />
          <span class="text-sm text-muted-foreground">bay</span>
        </div>
        <p v-if="errors.bay_count" class="mt-1 text-xs text-destructive">{{ errors.bay_count[0] }}</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <div class="flex items-center justify-between gap-3">
          <div>
            <CardTitle class="text-base">Jam buka</CardTitle>
            <CardDescription class="mt-1">Matikan untuk hari libur.</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" @click="copyMondayToAll">Samakan dengan Senin</Button>
        </div>
      </CardHeader>
      <CardContent class="divide-y divide-border/50">
        <div v-for="(day, i) in form.opening_hours" :key="day.day" class="py-3 first:pt-0 last:pb-0">
          <div class="flex flex-wrap items-center gap-3">
            <span class="w-16 text-sm font-medium">{{ DAY_LABELS[day.day] }}</span>
            <Switch
              :model-value="!day.closed"
              :aria-label="`Buka hari ${DAY_LABELS[day.day]}`"
              @update:model-value="(open: boolean) => (day.closed = !open)"
            />
            <template v-if="!day.closed">
              <Input v-model="day.open" type="time" class="w-28" :aria-label="`Jam buka ${DAY_LABELS[day.day]}`" />
              <span class="text-muted-foreground">–</span>
              <Input v-model="day.close" type="time" class="w-28" :aria-label="`Jam tutup ${DAY_LABELS[day.day]}`" />
            </template>
            <span v-else class="text-sm text-muted-foreground">Tutup</span>
          </div>
          <p v-if="hourError(i)" class="mt-1 text-xs text-destructive">{{ hourError(i) }}</p>
        </div>
      </CardContent>
    </Card>
  </form>
</template>
