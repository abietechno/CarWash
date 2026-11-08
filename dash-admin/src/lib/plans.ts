import { daysUntil } from '@/lib/format'
import type { Plan } from '@/types'

// Sama dengan Tenant::PRO_MAX_PROMOS di backend; dipakai untuk teks ajakan upgrade.
export const PRO_MAX_PROMOS = 25

// Peringatan perpanjangan muncul 7 hari sebelum Pro habis (sama dengan "habis ≤ 7 hari" di super-admin),
// dan masih ditampilkan 30 hari setelah Pro berakhir.
const EXPIRING_DAYS = 7
const EXPIRED_NOTICE_DAYS = 30

export type Renewal = { kind: 'expiring'; daysLeft: number } | { kind: 'expired' } | null

export function renewalState(plan: Plan, proUntil: string | null): Renewal {
  const days = daysUntil(proUntil)
  if (days === null) return null
  if (plan === 'pro') return days <= EXPIRING_DAYS ? { kind: 'expiring', daysLeft: Math.max(days, 1) } : null
  return days >= -EXPIRED_NOTICE_DAYS ? { kind: 'expired' } : null
}

/** Link wa.me dari nomor lokal (08xx) atau internasional (62xx). */
export function whatsappUrl(number: string | null | undefined, text?: string): string | null {
  if (!number) return null
  let digits = number.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}
