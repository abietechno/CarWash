import { ref, watch } from 'vue'
import en from './en'
import id, { type Messages } from './id'
import ms from './ms'

export type Locale = 'id' | 'ms' | 'en'

// Nama bahasa ditulis dalam bahasanya sendiri, jadi tidak ikut diterjemahkan.
export const LOCALES: { code: Locale; short: string; name: string }[] = [
  { code: 'id', short: 'ID', name: 'Bahasa Indonesia' },
  { code: 'ms', short: 'MY', name: 'Bahasa Melayu' },
  { code: 'en', short: 'EN', name: 'English' },
]

const MESSAGES: Record<Locale, Messages> = { id, ms, en }

// Format tanggal/jam per bahasa. Rupiah tetap memakai format Indonesia (lib/format.ts).
const INTL_LOCALES: Record<Locale, string> = { id: 'id-ID', ms: 'ms-MY', en: 'en-GB' }

const STORAGE_KEY = 'locale'

// Semua kunci teks, mis. "queue.title"; salah ketik langsung ketahuan saat type-check.
type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>
}[keyof T & string]

export type MessageKey = Leaves<Messages>
type Enums = Messages['enums']
type Params = Record<string, string | number>

export const isLocale = (value: unknown): value is Locale => value === 'id' || value === 'ms' || value === 'en'

// ?lang= dari link landing page menang atas pilihan tersimpan.
function initialLocale(): Locale {
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (isLocale(fromUrl)) return fromUrl
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLocale(saved)) return saved
  } catch {
    // Penyimpanan diblokir; pakai bahasa bawaan.
  }
  return 'id'
}

export const locale = ref<Locale>(initialLocale())

watch(
  locale,
  (value) => {
    document.documentElement.lang = value
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // Penyimpanan diblokir; pilihan tetap berlaku untuk sesi ini.
    }
  },
  { immediate: true },
)

export function setLocale(value: Locale) {
  locale.value = value
}

export const intlLocale = () => INTL_LOCALES[locale.value]

function lookup(messages: Messages, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined), messages)
  return typeof value === 'string' ? value : undefined
}

/**
 * Teks sesuai bahasa aktif. {nama} diganti dari params; "satu|banyak" dipilih dari params.count.
 * Membaca `locale`, jadi template yang memanggilnya ikut berganti saat bahasa diganti.
 */
export function t(key: MessageKey, params?: Params): string {
  let text = lookup(MESSAGES[locale.value], key) ?? lookup(id, key) ?? key
  if (!params) return text
  if (params.count !== undefined && text.includes('|')) {
    const [one = text, other = one] = text.split('|')
    text = Number(params.count) === 1 ? one : other
  }
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match))
}

/** Label kode dari server (metode bayar, kategori, ...); kode tak dikenal ditampilkan apa adanya. */
export function label<G extends keyof Enums>(group: G, key: string): string {
  const table = MESSAGES[locale.value].enums[group] as Record<string, string>
  return table[key] ?? (id.enums[group] as Record<string, string>)[key] ?? key
}

/**
 * Peta kode → label yang selalu mengikuti bahasa aktif (getter per kunci), untuk v-for dan lookup.
 * Kode yang tidak ada di kamus menghasilkan undefined, sama seperti objek biasa.
 */
export function labels<G extends keyof Enums>(group: G): Record<keyof Enums[G] & string, string> & Record<string, string> {
  const out = {} as Record<string, string>
  for (const key of Object.keys(id.enums[group])) {
    Object.defineProperty(out, key, { enumerable: true, get: () => label(group, key) })
  }
  return out as Record<keyof Enums[G] & string, string> & Record<string, string>
}
