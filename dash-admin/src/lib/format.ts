import type { AddonCategory, Day, PackageCategory, PromoTheme } from '@/types'

// Warna slide promo; nilai gradient yang sama dipakai situs tenant (src/lib/site.ts).
export const PROMO_THEMES: Record<PromoTheme, { label: string; swatch: string }> = {
  blue: { label: 'Biru', swatch: '#2563EB' },
  cyan: { label: 'Cyan', swatch: '#0891B2' },
  violet: { label: 'Ungu', swatch: '#7C3AED' },
  amber: { label: 'Kuning', swatch: '#D97706' },
  rose: { label: 'Merah muda', swatch: '#E11D48' },
  slate: { label: 'Gelap', swatch: '#334155' },
}

const rupiahFormat = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export const rupiah = (value: number) => rupiahFormat.format(value)

export function duration(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`
  const rest = minutes % 60
  return `${Math.floor(minutes / 60)} jam${rest ? ` ${rest} menit` : ''}`
}

// Jam:menit dari string ISO, mis. "09:35".
export function clock(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
}

// Tanggal pendek, mis. "8 Nov 2026".
export function shortDate(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Nilai untuk <input type="date"> menurut tanggal lokal (bukan UTC), mis. "2026-11-08".
export function dateInputValue(iso?: string | null): string {
  return new Date(iso ?? Date.now()).toLocaleDateString('sv-SE')
}

// Sisa hari sampai tanggal tertentu (negatif kalau sudah lewat).
export function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
}

export const PAYMENT_METHODS: Record<string, string> = {
  transfer: 'Transfer bank',
  qris: 'QRIS',
  cash: 'Tunai',
  other: 'Lainnya',
}

export const TENANT_STATUS: Record<string, string> = {
  published: 'Online',
  draft: 'Draft',
  suspended: 'Dinonaktifkan',
}

export const DAY_LABELS: Record<Day, string> = {
  mon: 'Senin',
  tue: 'Selasa',
  wed: 'Rabu',
  thu: 'Kamis',
  fri: 'Jumat',
  sat: 'Sabtu',
  sun: 'Minggu',
}

export const PACKAGE_CATEGORIES: Record<PackageCategory, string> = {
  wash: 'Cuci',
  salon: 'Salon',
  coating: 'Coating',
}

export const ADDON_CATEGORIES: Record<AddonCategory, string> = {
  interior: 'Interior',
  exterior: 'Eksterior',
  protection: 'Proteksi',
}
