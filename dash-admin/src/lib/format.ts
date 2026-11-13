import { intlLocale, label, labels, t } from '@/i18n'
import type { PromoTheme } from '@/types'

// Warna slide promo; nilai gradient yang sama dipakai situs tenant (src/lib/site.ts). Labelnya di enums.promoThemes.
export const PROMO_THEMES: Record<PromoTheme, { swatch: string }> = {
  blue: { swatch: '#2563EB' },
  cyan: { swatch: '#0891B2' },
  violet: { swatch: '#7C3AED' },
  amber: { swatch: '#D97706' },
  rose: { swatch: '#E11D48' },
  slate: { swatch: '#334155' },
}

// Harga dalam rupiah, jadi formatnya tetap Indonesia apa pun bahasa tampilannya.
const rupiahFormat = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export const rupiah = (value: number) => rupiahFormat.format(value)

export function duration(minutes: number): string {
  if (minutes < 60) return t('format.minutes', { count: minutes })
  const rest = minutes % 60
  const hours = t('format.hours', { count: Math.floor(minutes / 60) })
  return rest ? `${hours} ${t('format.minutes', { count: rest })}` : hours
}

// Jam:menit dari string ISO, mis. "09:35".
export function clock(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleTimeString(intlLocale(), { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).replace('.', ':')
}

// Tanggal pendek, mis. "8 Nov 2026".
export function shortDate(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString(intlLocale(), { day: 'numeric', month: 'short', year: 'numeric' })
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

// Label kode → teks sesuai bahasa aktif (lihat labels() di i18n).
export const PAYMENT_METHODS = labels('paymentMethods')
export const TRANSACTION_METHODS = labels('transactionMethods')
export const EXPENSE_CATEGORIES = labels('expenseCategories')
export const TENANT_STATUS = labels('tenantStatus')
export const DAY_LABELS = labels('days')
export const PACKAGE_CATEGORIES = labels('packageCategories')
export const VEHICLE_SCOPES = labels('vehicleScopes')
export const ADDON_CATEGORIES = labels('addonCategories')
export const PROMO_THEME_LABELS = labels('promoThemes')
// Warna kendaraan (kode dari VEHICLE_COLORS di lib/carSvg.ts).
export const colorLabel = (code: string) => label('colors', code)

// Angka ringkas untuk sumbu grafik, mis. "500 rb", "1,5 jt".
export function compactRupiah(value: number): string {
  const short = (n: number) => n.toLocaleString(intlLocale(), { maximumFractionDigits: 1 })
  if (value >= 1_000_000) return t('format.million', { n: short(value / 1_000_000) })
  if (value >= 1_000) return t('format.thousand', { n: short(value / 1_000) })
  return String(value)
}

// Tanggal + jam, mis. "8 Nov 2026 14:30".
export function dateTime(iso: string | null): string {
  return iso ? `${shortDate(iso)} ${clock(iso)}` : '-'
}
