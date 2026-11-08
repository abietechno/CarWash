<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { LoaderCircle, Minus, Plus, ShoppingCart, Trash2, X } from '@lucide/vue'
import ChipButton from '@/components/ChipButton.vue'
import CarTop from '@/components/CarTop.vue'
import PageHeader from '@/components/PageHeader.vue'
import TransactionDialog from '@/components/pos/TransactionDialog.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { api, errorMessage } from '@/lib/api'
import { rupiah, TRANSACTION_METHODS } from '@/lib/format'
import { fitsVehicle, scopedPrice } from '@/lib/vehicles'
import type { PosCatalog, Transaction, TransactionMethod, UnpaidBooking, VehicleCode, VehicleScope } from '@/types'

interface CartLine {
  key: string
  type: 'package' | 'addon' | 'custom'
  id?: number
  name: string
  basePrice: number
  scope?: VehicleScope
  qty: number
}

const route = useRoute()
const router = useRouter()

const catalog = ref<PosCatalog | null>(null)
const tab = ref<'packages' | 'addons' | 'custom'>('packages')
const booking = ref<UnpaidBooking | null>(null)
const vehicle = ref<VehicleCode | null>(null)
const lines = ref<CartLine[]>([])
const customer = reactive({ name: '', phone: '' })
const custom = reactive({ name: '', price: '' as number | string })
const discount = ref<number | string>('')
const method = ref<TransactionMethod>('cash')
const paid = ref<number | string>('')
const saving = ref(false)
const receipt = ref<Transaction | null>(null)
const receiptOpen = ref(false)

const STATUS_LABEL: Record<string, string> = {
  waiting: 'Menunggu',
  in_progress: 'Dikerjakan',
  done: 'Siap diambil',
  picked_up: 'Sudah diambil',
}

async function load() {
  try {
    const { data } = await api.get<PosCatalog>('/pos/catalog')
    catalog.value = data
    vehicle.value ??= data.vehicle_types[0]?.code ?? null

    // Datang dari tombol "Bayar" di halaman Antrian.
    const fromQueue = Number(route.query.booking)
    if (fromQueue) {
      const target = data.unpaid.find((b) => b.id === fromQueue)
      if (target) pickBooking(target)
      else toast.info('Antrian itu sudah dibayar atau tidak ditemukan.')
      router.replace({ query: {} })
    }
  } catch (e) {
    toast.error(errorMessage(e, 'Gagal memuat data kasir.'))
  }
}

onMounted(load)

function pickBooking(item: UnpaidBooking) {
  if (booking.value?.id === item.id) {
    booking.value = null
    customer.name = ''
    customer.phone = ''
    return
  }
  booking.value = item
  customer.name = item.customer_name
  customer.phone = item.phone ?? ''
}

const activeVehicle = computed(() => booking.value?.vehicle_type ?? vehicle.value)
const multiplier = computed(() => catalog.value?.vehicle_types.find((v) => v.code === activeVehicle.value)?.price_multiplier ?? 1)
const unitPrice = (line: Pick<CartLine, 'type' | 'basePrice' | 'scope'>) =>
  line.type === 'package' ? scopedPrice(line.basePrice, line.scope ?? 'car', multiplier.value) : line.basePrice
const vehiclePackages = computed(() => {
  const code = activeVehicle.value
  return code ? (catalog.value?.packages ?? []).filter((p) => fitsVehicle(p.vehicle_scope, code)) : []
})

// Paket yang tidak berlaku untuk kendaraan baru dikeluarkan supaya tidak ditolak saat bayar.
watch(activeVehicle, (code) => {
  if (!code) return
  const kept = lines.value.filter((l) => l.type !== 'package' || fitsVehicle(l.scope ?? 'car', code))
  if (kept.length === lines.value.length) return
  lines.value = kept
  toast.info('Paket yang tidak berlaku untuk kendaraan ini dikeluarkan dari pesanan.')
})

function qtyOf(key: string) {
  return lines.value.find((l) => l.key === key)?.qty ?? 0
}

function add(type: CartLine['type'], id: number, name: string, basePrice: number, scope?: VehicleScope) {
  const key = `${type}-${id}`
  const existing = lines.value.find((l) => l.key === key)
  if (existing) existing.qty = Math.min(99, existing.qty + 1)
  else lines.value.push({ key, type, id, name, basePrice, scope, qty: 1 })
}

function addCustom() {
  const price = Number(custom.price)
  if (!custom.name.trim() || !Number.isInteger(price) || price < 0) return
  lines.value.push({ key: `custom-${Date.now()}`, type: 'custom', name: custom.name.trim(), basePrice: price, qty: 1 })
  custom.name = ''
  custom.price = ''
}

function changeQty(line: CartLine, delta: number) {
  line.qty += delta
  if (line.qty <= 0) lines.value = lines.value.filter((l) => l !== line)
  else line.qty = Math.min(99, line.qty)
}

const subtotal = computed(() => (booking.value?.price ?? 0) + lines.value.reduce((sum, l) => sum + unitPrice(l) * l.qty, 0))
const discountValue = computed(() => Math.max(0, Number(discount.value) || 0))
const total = computed(() => Math.max(0, subtotal.value - discountValue.value))
const paidValue = computed(() => Number(paid.value) || 0)
const isExactCash = computed(() => paid.value === '')
const change = computed(() => (isExactCash.value ? 0 : Math.max(0, paidValue.value - total.value)))
const hasItems = computed(() => !!booking.value || lines.value.length > 0)
const cashShort = computed(() => method.value === 'cash' && !isExactCash.value && paidValue.value < total.value)
const discountTooBig = computed(() => discountValue.value > subtotal.value)
const canPay = computed(() => hasItems.value && !saving.value && !cashShort.value && !discountTooBig.value)

const quickCash = computed(() => [...new Set([50_000, 100_000, 200_000])].filter((v) => v > total.value).slice(0, 2))

function reset() {
  booking.value = null
  lines.value = []
  customer.name = ''
  customer.phone = ''
  discount.value = ''
  paid.value = ''
  method.value = 'cash'
}

async function pay() {
  saving.value = true
  try {
    const { data } = await api.post<Transaction>('/pos/sales', {
      booking_id: booking.value?.id ?? null,
      vehicle_type: activeVehicle.value,
      customer_name: customer.name.trim() || null,
      customer_phone: customer.phone.trim() || null,
      items: lines.value.map((l) =>
        l.type === 'custom' ? { type: l.type, name: l.name, price: l.basePrice, qty: l.qty } : { type: l.type, id: l.id, qty: l.qty },
      ),
      discount: discountValue.value,
      payment_method: method.value,
      paid_amount: method.value === 'cash' && !isExactCash.value ? paidValue.value : null,
    })
    receipt.value = data
    receiptOpen.value = true
    reset()
    await load()
  } catch (e) {
    toast.error(errorMessage(e, 'Pembayaran gagal disimpan.'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <PageHeader title="Kasir" description="Catat pembayaran pelanggan" />

  <div v-if="!catalog" class="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_22rem]">
    <Skeleton class="h-96 rounded-2xl" />
    <Skeleton class="h-96 rounded-2xl" />
  </div>

  <div v-else class="grid items-start gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_22rem]">
    <div class="min-w-0 space-y-4">
      <Card v-if="catalog.unpaid.length" size="sm">
        <CardHeader><CardTitle class="text-base">Antrian belum bayar</CardTitle></CardHeader>
        <CardContent class="grid gap-2 sm:grid-cols-2">
          <button
            v-for="b in catalog.unpaid"
            :key="b.id"
            type="button"
            :aria-pressed="booking?.id === b.id"
            :class="[
              'flex items-center gap-3 rounded-xl border p-2.5 text-left transition-colors',
              booking?.id === b.id ? 'border-foreground bg-accent' : 'border-border/60 hover:bg-accent',
            ]"
            @click="pickBooking(b)"
          >
            <CarTop :type="b.vehicle_type" :color="b.vehicle_color" class="h-9 w-14 shrink-0" />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-medium">{{ b.ticket }} · {{ b.customer_name }}</span>
              <span class="block truncate text-xs text-muted-foreground">{{ b.package_name }} · {{ STATUS_LABEL[b.status] }}</span>
            </span>
            <span class="shrink-0 text-sm font-semibold tabular-nums">{{ rupiah(b.price) }}</span>
          </button>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardContent class="space-y-4">
          <div v-if="!booking" class="space-y-2">
            <p class="text-sm font-medium">Jenis kendaraan</p>
            <div class="flex flex-wrap gap-2">
              <ChipButton v-for="v in catalog.vehicle_types" :key="v.code" :active="vehicle === v.code" @click="vehicle = v.code">{{ v.name }}</ChipButton>
            </div>
          </div>

          <div :class="['flex flex-wrap gap-2', !booking && 'border-t border-border/50 pt-4']">
            <ChipButton :active="tab === 'packages'" @click="tab = 'packages'">Paket</ChipButton>
            <ChipButton :active="tab === 'addons'" @click="tab = 'addons'">Add-on</ChipButton>
            <ChipButton :active="tab === 'custom'" @click="tab = 'custom'">Item lain</ChipButton>
          </div>

          <div v-if="tab === 'packages'" class="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <button
              v-for="p in vehiclePackages"
              :key="p.id"
              type="button"
              class="relative rounded-xl border border-border/60 p-3 text-left transition-colors hover:bg-accent"
              @click="add('package', p.id, p.name, p.price, p.vehicle_scope)"
            >
              <span class="block text-sm leading-snug font-medium">{{ p.name }}</span>
              <span class="mt-1 block text-sm tabular-nums text-muted-foreground">{{ rupiah(unitPrice({ type: 'package', basePrice: p.price, scope: p.vehicle_scope })) }}</span>
              <span v-if="qtyOf(`package-${p.id}`)" class="absolute top-2 right-2 grid h-5 min-w-5 place-items-center rounded-full bg-foreground px-1 text-xs font-bold text-background">{{ qtyOf(`package-${p.id}`) }}</span>
            </button>
            <p v-if="!vehiclePackages.length" class="col-span-full text-sm text-muted-foreground">Belum ada paket untuk kendaraan ini. Atur di Layanan &amp; Harga.</p>
          </div>

          <div v-else-if="tab === 'addons'" class="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <button
              v-for="a in catalog.addons"
              :key="a.id"
              type="button"
              class="relative rounded-xl border border-border/60 p-3 text-left transition-colors hover:bg-accent"
              @click="add('addon', a.id, a.name, a.price)"
            >
              <span class="block text-sm leading-snug font-medium">{{ a.name }}</span>
              <span class="mt-1 block text-sm tabular-nums text-muted-foreground">{{ rupiah(a.price) }}</span>
              <span v-if="qtyOf(`addon-${a.id}`)" class="absolute top-2 right-2 grid h-5 min-w-5 place-items-center rounded-full bg-foreground px-1 text-xs font-bold text-background">{{ qtyOf(`addon-${a.id}`) }}</span>
            </button>
            <p v-if="!catalog.addons.length" class="col-span-full text-sm text-muted-foreground">Belum ada add-on aktif.</p>
          </div>

          <form v-else class="grid gap-3 sm:grid-cols-[1fr_10rem_auto] sm:items-end" @submit.prevent="addCustom">
            <div class="space-y-2">
              <Label for="custom-name">Nama item</Label>
              <Input id="custom-name" v-model="custom.name" maxlength="100" placeholder="Parfum mobil" />
            </div>
            <div class="space-y-2">
              <Label for="custom-price">Harga</Label>
              <Input id="custom-price" v-model="custom.price" type="number" inputmode="numeric" min="0" placeholder="25000" />
            </div>
            <Button type="submit" variant="outline" :disabled="!custom.name.trim() || custom.price === ''"><Plus /> Tambah</Button>
          </form>
        </CardContent>
      </Card>
    </div>

    <Card class="lg:sticky lg:top-20">
      <CardHeader><CardTitle class="flex items-center gap-2 text-base"><ShoppingCart class="h-4 w-4" /> Pesanan</CardTitle></CardHeader>
      <CardContent class="space-y-4">
        <p v-if="!hasItems" class="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Pilih antrian atau tambahkan item.
        </p>

        <ul v-else class="space-y-3 text-sm">
          <li v-if="booking" class="flex items-start gap-2">
            <div class="min-w-0 flex-1">
              <p class="font-medium">{{ booking.package_name }}</p>
              <p class="text-xs text-muted-foreground">Antrian {{ booking.ticket }}<template v-if="booking.plate"> · {{ booking.plate }}</template></p>
            </div>
            <span class="tabular-nums">{{ rupiah(booking.price) }}</span>
            <button type="button" class="text-muted-foreground hover:text-foreground" aria-label="Lepas antrian" @click="pickBooking(booking!)"><X class="h-4 w-4" /></button>
          </li>
          <li v-for="line in lines" :key="line.key" class="flex items-center gap-2">
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium">{{ line.name }}</p>
              <p class="text-xs tabular-nums text-muted-foreground">{{ rupiah(unitPrice(line)) }}</p>
            </div>
            <div class="flex items-center gap-1">
              <Button type="button" variant="outline" size="icon-sm" :aria-label="`Kurangi ${line.name}`" @click="changeQty(line, -1)">
                <Trash2 v-if="line.qty === 1" /><Minus v-else />
              </Button>
              <span class="w-6 text-center tabular-nums">{{ line.qty }}</span>
              <Button type="button" variant="outline" size="icon-sm" :aria-label="`Tambah ${line.name}`" @click="changeQty(line, 1)"><Plus /></Button>
            </div>
            <span class="w-20 text-right tabular-nums">{{ rupiah(unitPrice(line) * line.qty) }}</span>
          </li>
        </ul>

        <div class="grid grid-cols-2 gap-3 border-t border-border/60 pt-4">
          <div class="space-y-2">
            <Label for="customer-name">Pelanggan</Label>
            <Input id="customer-name" v-model="customer.name" maxlength="100" placeholder="Opsional" />
          </div>
          <div class="space-y-2">
            <Label for="customer-phone">No. HP</Label>
            <Input id="customer-phone" v-model="customer.phone" type="tel" maxlength="20" placeholder="Opsional" />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="discount">Diskon (Rp)</Label>
          <Input id="discount" v-model="discount" type="number" inputmode="numeric" min="0" placeholder="0" />
          <p v-if="discountTooBig" class="text-xs text-destructive">Diskon melebihi subtotal.</p>
        </div>

        <div class="space-y-2 border-t border-border/60 pt-4">
          <p v-if="discountValue" class="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span> <span class="tabular-nums">{{ rupiah(subtotal) }}</span></p>
          <p class="flex items-baseline justify-between"><span class="text-sm font-medium">Total</span> <span class="font-display text-2xl font-bold tabular-nums">{{ rupiah(total) }}</span></p>
        </div>

        <div class="flex flex-wrap gap-2">
          <ChipButton v-for="(label, key) in TRANSACTION_METHODS" :key="key" :active="method === key" @click="method = key">{{ label }}</ChipButton>
        </div>

        <div v-if="method === 'cash'" class="space-y-2">
          <Label for="paid">Uang diterima</Label>
          <Input id="paid" v-model="paid" type="number" inputmode="numeric" min="0" placeholder="Kosongkan kalau uang pas" />
          <div class="flex flex-wrap gap-2">
            <ChipButton :active="isExactCash" @click="paid = ''">Uang pas</ChipButton>
            <ChipButton v-for="v in quickCash" :key="v" :active="paidValue === v" @click="paid = v">{{ rupiah(v) }}</ChipButton>
          </div>
          <p v-if="cashShort" class="text-xs text-destructive">Uang diterima kurang {{ rupiah(total - paidValue) }}.</p>
          <p v-else-if="!isExactCash" class="flex justify-between text-sm font-medium"><span>Kembalian</span> <span class="tabular-nums">{{ rupiah(change) }}</span></p>
        </div>

        <Button class="h-11 w-full" :disabled="!canPay" @click="pay">
          <LoaderCircle v-if="saving" class="animate-spin" />
          Bayar {{ rupiah(total) }}
        </Button>
      </CardContent>
    </Card>
  </div>

  <TransactionDialog v-model:open="receiptOpen" :transaction="receipt" title="Pembayaran berhasil" @voided="load" />
</template>
