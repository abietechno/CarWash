<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { LoaderCircle, Pencil, Plus, Star, Trash2 } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import AddonDialog from '@/components/services/AddonDialog.vue'
import PackageDialog from '@/components/services/PackageDialog.vue'
import PromoDialog from '@/components/services/PromoDialog.vue'
import UpgradeNotice from '@/components/UpgradeNotice.vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api, errorMessage } from '@/lib/api'
import { ADDON_CATEGORIES, duration, PACKAGE_CATEGORIES, PROMO_THEMES, rupiah, VEHICLE_SCOPES } from '@/lib/format'
import { PRO_MAX_PROMOS } from '@/lib/plans'
import { fitsVehicle } from '@/lib/vehicles'
import { useAuthStore } from '@/stores/auth'
import type { Promo, ServiceAddon, ServicePackage, VehicleCode, VehicleType } from '@/types'

type Tab = 'packages' | 'addons' | 'promos' | 'vehicles'
type Kind = 'packages' | 'addons' | 'promos'

const auth = useAuthStore()
const features = computed(() => auth.tenant?.features)
const activePackages = computed(() => packages.value.filter((p) => p.is_active).length)
const promosFull = computed(() => promos.value.length >= (features.value?.max_promos ?? 0))

const tab = ref<Tab>('packages')
const loaded = ref(false)
const packages = ref<ServicePackage[]>([])
const addons = ref<ServiceAddon[]>([])
const vehicleTypes = ref<VehicleType[]>([])
const promos = ref<Promo[]>([])

const packageDialog = ref(false)
const editingPackage = ref<ServicePackage | null>(null)
const addonDialog = ref(false)
const editingAddon = ref<ServiceAddon | null>(null)
const promoDialog = ref(false)
const editingPromo = ref<Promo | null>(null)

const pendingDelete = ref<{ kind: Kind; id: number; name: string } | null>(null)
const savingVehicles = ref(false)

onMounted(async () => {
  try {
    const [p, a, v, pr] = await Promise.all([
      api.get<ServicePackage[]>('/packages'),
      api.get<ServiceAddon[]>('/addons'),
      api.get<VehicleType[]>('/vehicle-types'),
      api.get<Promo[]>('/promos'),
    ])
    packages.value = p.data
    addons.value = a.data
    vehicleTypes.value = v.data
    promos.value = pr.data
    loaded.value = true
  } catch (e) {
    toast.error(errorMessage(e))
  }
})

function openPackage(item: ServicePackage | null) {
  editingPackage.value = item
  packageDialog.value = true
}

function openAddon(item: ServiceAddon | null) {
  editingAddon.value = item
  addonDialog.value = true
}

function openPromo(item: Promo | null) {
  editingPromo.value = item
  promoDialog.value = true
}

function upsert<T extends { id: number }>(list: T[], item: T): T[] {
  return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item]
}

async function toggleActive(kind: Kind, item: ServicePackage | ServiceAddon | Promo, active: boolean) {
  try {
    const { data } = await api.put(`/${kind}/${item.id}`, { ...item, is_active: active })
    if (kind === 'packages') packages.value = upsert(packages.value, data as ServicePackage)
    else if (kind === 'addons') addons.value = upsert(addons.value, data as ServiceAddon)
    else promos.value = upsert(promos.value, data as Promo)
  } catch (e) {
    toast.error(errorMessage(e))
  }
}

async function confirmDelete() {
  const target = pendingDelete.value
  if (!target) return
  try {
    await api.delete(`/${target.kind}/${target.id}`)
    if (target.kind === 'packages') packages.value = packages.value.filter((x) => x.id !== target.id)
    else if (target.kind === 'addons') addons.value = addons.value.filter((x) => x.id !== target.id)
    else promos.value = promos.value.filter((x) => x.id !== target.id)
    toast.success(`"${target.name}" dihapus.`)
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    pendingDelete.value = null
  }
}

// Contoh harga per kendaraan dari paket aktif termurah yang kena pengali.
function examplePrice(code: VehicleCode) {
  return packages.value
    .filter((p) => p.is_active && p.vehicle_scope !== 'motor' && fitsVehicle(p.vehicle_scope, code))
    .reduce<number | null>((min, p) => (min === null || p.price < min ? p.price : min), null)
}

async function saveVehicles() {
  savingVehicles.value = true
  try {
    const { data } = await api.put<VehicleType[]>('/vehicle-types', {
      vehicle_types: vehicleTypes.value.map(({ code, name, examples, price_multiplier }) => ({
        code,
        name,
        examples: examples || null,
        price_multiplier: Number(price_multiplier),
      })),
    })
    vehicleTypes.value = data
    toast.success('Jenis kendaraan disimpan.')
  } catch (e) {
    toast.error(errorMessage(e, 'Gagal menyimpan jenis kendaraan.'))
  } finally {
    savingVehicles.value = false
  }
}
</script>

<template>
  <PageHeader title="Layanan & Harga" description="Paket, add-on, dan harga per jenis kendaraan">
    <template #actions>
      <Button v-if="tab === 'packages'" :disabled="!loaded" @click="openPackage(null)"><Plus /> Paket</Button>
      <Button v-else-if="tab === 'addons'" :disabled="!loaded" @click="openAddon(null)"><Plus /> Add-on</Button>
      <Button v-else-if="tab === 'promos'" :disabled="!loaded || promosFull" @click="openPromo(null)"><Plus /> Promo</Button>
      <Button v-else :disabled="!loaded || savingVehicles" @click="saveVehicles">
        <LoaderCircle v-if="savingVehicles" class="animate-spin" />
        Simpan
      </Button>
    </template>
  </PageHeader>

  <div class="p-4 sm:p-6">
    <Tabs v-model="tab">
      <TabsList class="mb-4">
        <TabsTrigger value="packages">Paket</TabsTrigger>
        <TabsTrigger value="addons">Add-on</TabsTrigger>
        <TabsTrigger value="promos">Promo</TabsTrigger>
        <TabsTrigger value="vehicles">Kendaraan</TabsTrigger>
      </TabsList>

      <div v-if="!loaded" class="space-y-3">
        <Skeleton v-for="i in 3" :key="i" class="h-24 rounded-2xl" />
      </div>

      <template v-else>
        <TabsContent value="packages" class="space-y-3">
          <UpgradeNotice
            v-if="features?.max_packages"
            :message="`${activePackages}/${features.max_packages} paket aktif (batas paket Gratis). Pro: tanpa batas.`"
          />
          <p v-if="!packages.length" class="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Belum ada paket. Tambahkan minimal satu paket aktif sebelum publikasi.
          </p>
          <Card v-for="item in packages" :key="item.id" size="sm" :class="{ 'opacity-60': !item.is_active }">
            <CardContent class="flex items-start gap-4">
              <img v-if="item.image_url" :src="item.image_url" alt="" class="h-16 w-20 shrink-0 rounded-xl object-cover" />
              <div v-else class="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-muted text-[10px] text-muted-foreground">Foto default</div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="font-medium">{{ item.name }}</p>
                  <Badge variant="secondary">{{ PACKAGE_CATEGORIES[item.category] }}</Badge>
                  <Badge variant="secondary">{{ VEHICLE_SCOPES[item.vehicle_scope] }}</Badge>
                  <Badge v-if="item.is_popular" variant="outline"><Star class="fill-current" /> Terlaris</Badge>
                </div>
                <p v-if="item.tagline" class="mt-1 truncate text-sm text-muted-foreground">{{ item.tagline }}</p>
                <p class="mt-2 text-sm">
                  <span class="font-display font-bold">{{ rupiah(item.price) }}</span>
                  <span class="text-muted-foreground"> · {{ duration(item.duration_minutes) }}</span>
                </p>
              </div>
              <div class="flex shrink-0 items-center gap-1">
                <Switch
                  :model-value="item.is_active"
                  :aria-label="`Aktifkan ${item.name}`"
                  class="mr-2"
                  @update:model-value="(v: boolean) => toggleActive('packages', item, v)"
                />
                <Button variant="ghost" size="icon-sm" :aria-label="`Edit ${item.name}`" @click="openPackage(item)"><Pencil /></Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  :aria-label="`Hapus ${item.name}`"
                  @click="pendingDelete = { kind: 'packages', id: item.id, name: item.name }"
                >
                  <Trash2 />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addons" class="space-y-3">
          <p v-if="!addons.length" class="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Belum ada add-on.
          </p>
          <Card v-for="item in addons" :key="item.id" size="sm" :class="{ 'opacity-60': !item.is_active }">
            <CardContent class="flex items-start gap-4">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="font-medium">{{ item.name }}</p>
                  <Badge variant="secondary">{{ ADDON_CATEGORIES[item.category] }}</Badge>
                </div>
                <p v-if="item.description" class="mt-1 line-clamp-2 text-sm text-muted-foreground">{{ item.description }}</p>
                <p class="mt-2 text-sm">
                  <span class="font-display font-bold">{{ rupiah(item.price) }}</span>
                  <span class="text-muted-foreground"> · {{ duration(item.duration_minutes) }}</span>
                </p>
              </div>
              <div class="flex shrink-0 items-center gap-1">
                <Switch
                  :model-value="item.is_active"
                  :aria-label="`Aktifkan ${item.name}`"
                  class="mr-2"
                  @update:model-value="(v: boolean) => toggleActive('addons', item, v)"
                />
                <Button variant="ghost" size="icon-sm" :aria-label="`Edit ${item.name}`" @click="openAddon(item)"><Pencil /></Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  :aria-label="`Hapus ${item.name}`"
                  @click="pendingDelete = { kind: 'addons', id: item.id, name: item.name }"
                >
                  <Trash2 />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promos" class="space-y-3">
          <UpgradeNotice
            v-if="features && features.max_promos < PRO_MAX_PROMOS"
            :message="`${promos.length}/${features.max_promos} foto promo (batas Gratis).${promos.length > features.max_promos ? ' Hanya promo aktif teratas yang tampil di situs.' : ''} Pro: sampai ${PRO_MAX_PROMOS} foto.`"
          />
          <p v-else-if="features && promosFull" class="text-sm text-muted-foreground">
            Sudah {{ features.max_promos }} foto promo (batas Pro). Hapus promo lama untuk menambah yang baru.
          </p>
          <p v-if="!promos.length" class="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Belum ada promo. Tanpa promo, slider di situs menampilkan nama & tagline bisnismu.
          </p>
          <Card v-for="item in promos" :key="item.id" size="sm" :class="{ 'opacity-60': !item.is_active }">
            <CardContent class="flex items-start gap-4">
              <div
                class="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-cover bg-center"
                :style="item.image_url ? { backgroundImage: `url(${item.image_url})` } : { background: PROMO_THEMES[item.theme].swatch }"
              />
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="font-medium">{{ item.title }}</p>
                  <Badge v-if="item.badge" variant="secondary">{{ item.badge }}</Badge>
                </div>
                <p v-if="item.subtitle" class="mt-1 line-clamp-2 text-sm text-muted-foreground">{{ item.subtitle }}</p>
                <p v-if="item.service_package_id" class="mt-1 text-xs text-muted-foreground">
                  → {{ packages.find((p) => p.id === item.service_package_id)?.name ?? 'paket dihapus' }}
                </p>
              </div>
              <div class="flex shrink-0 items-center gap-1">
                <Switch
                  :model-value="item.is_active"
                  :aria-label="`Tampilkan ${item.title}`"
                  class="mr-2"
                  @update:model-value="(v: boolean) => toggleActive('promos', item, v)"
                />
                <Button variant="ghost" size="icon-sm" :aria-label="`Edit ${item.title}`" @click="openPromo(item)"><Pencil /></Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  :aria-label="`Hapus ${item.title}`"
                  @click="pendingDelete = { kind: 'promos', id: item.id, name: item.title }"
                >
                  <Trash2 />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Pengali harga per jenis kendaraan</CardTitle>
              <CardDescription>
                Harga paket = harga dasar × pengali, kecuali paket Motor yang memakai harganya sendiri. Contoh memakai paket aktif termurah.
                Jenis kendaraan tampil di reservasi situs kalau ada paket untuknya.
              </CardDescription>
            </CardHeader>
            <CardContent class="divide-y divide-border/50">
              <div v-for="type in vehicleTypes" :key="type.code" class="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[1fr_1fr_7rem]">
                <div class="space-y-1">
                  <Input v-model="type.name" :aria-label="`Nama ${type.code}`" maxlength="100" />
                  <Input
                    :model-value="type.examples ?? ''"
                    :aria-label="`Contoh ${type.code}`"
                    placeholder="Contoh kendaraan"
                    maxlength="255"
                    class="text-muted-foreground"
                    @update:model-value="(v) => (type.examples = String(v))"
                  />
                </div>
                <div class="flex items-center text-sm text-muted-foreground sm:justify-end">
                  <span v-if="examplePrice(type.code) !== null">≈ {{ rupiah(Math.round(examplePrice(type.code)! * Number(type.price_multiplier))) }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-sm text-muted-foreground">×</span>
                  <Input v-model="type.price_multiplier" type="number" min="0.1" max="5" step="0.05" :aria-label="`Pengali ${type.code}`" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </template>
    </Tabs>
  </div>

  <PackageDialog v-model:open="packageDialog" :item="editingPackage" @saved="(p) => (packages = upsert(packages, p))" />
  <AddonDialog v-model:open="addonDialog" :item="editingAddon" @saved="(a) => (addons = upsert(addons, a))" />
  <PromoDialog v-model:open="promoDialog" :item="editingPromo" :packages="packages" @saved="(p) => (promos = upsert(promos, p))" />

  <AlertDialog :open="pendingDelete !== null" @update:open="(v: boolean) => !v && (pendingDelete = null)">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Hapus "{{ pendingDelete?.name }}"?</AlertDialogTitle>
        <AlertDialogDescription>Tidak bisa dibatalkan. Matikan saja kalau hanya ingin menyembunyikan dari situs.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Batal</AlertDialogCancel>
        <AlertDialogAction variant="destructive" @click="confirmDelete">Hapus</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
