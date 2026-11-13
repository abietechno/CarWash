import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from './en';
import id, { Messages } from './id';
import ms from './ms';

export type Locale = 'id' | 'ms' | 'en';

// Nama bahasa ditulis dalam bahasanya sendiri, jadi tidak ikut diterjemahkan.
export const LOCALES: { code: Locale; short: string; name: string }[] = [
  { code: 'id', short: 'ID', name: 'Bahasa Indonesia' },
  { code: 'ms', short: 'MY', name: 'Bahasa Melayu' },
  { code: 'en', short: 'EN', name: 'English' },
];

const MESSAGES: Record<Locale, Messages> = { id, ms, en };

// Format tanggal/jam per bahasa. Rupiah tetap format Indonesia (lib/format.ts).
export const INTL_LOCALES: Record<Locale, string> = { id: 'id-ID', ms: 'ms-MY', en: 'en-GB' };

// Pilihan pengunjung disimpan per subdomain (localStorage per origin), menang atas bahasa bawaan tenant.
const STORAGE_KEY = 'ww-locale';

type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type MessageKey = Leaves<Messages>;
type Enums = Messages['enums'];
type Params = Record<string, string | number>;

export const isLocale = (value: unknown): value is Locale => value === 'id' || value === 'ms' || value === 'en';

function lookup(messages: Messages, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined), messages);
  return typeof value === 'string' ? value : undefined;
}

/** Teks untuk bahasa tertentu; {nama} diganti dari params, "satu|banyak" dipilih dari params.count. */
export function translate(locale: Locale, key: MessageKey, params?: Params): string {
  let text = lookup(MESSAGES[locale], key) ?? lookup(id, key) ?? key;
  if (!params) return text;
  if (params.count !== undefined && text.includes('|')) {
    const [one = text, other = one] = text.split('|');
    text = Number(params.count) === 1 ? one : other;
  }
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

/** Label kode (hari, kategori, warna); kode tak dikenal ditampilkan apa adanya. */
export function translateLabel<G extends keyof Enums>(locale: Locale, group: G, code: string): string {
  return (MESSAGES[locale].enums[group] as Record<string, string>)[code] ?? (id.enums[group] as Record<string, string>)[code] ?? code;
}

function savedLocale(): Locale | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isLocale(saved) ? saved : null;
  } catch {
    return null;
  }
}

interface I18n {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, params?: Params) => string;
  label: <G extends keyof Enums>(group: G, code: string) => string;
}

const I18nContext = createContext<I18n | null>(null);

/** fallback = bahasa bawaan tenant, dipakai selama pengunjung belum memilih sendiri. */
export function I18nProvider({ fallback, children }: { fallback: Locale; children: ReactNode }) {
  const [chosen, setChosen] = useState<Locale | null>(savedLocale);
  const locale = chosen ?? fallback;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setChosen(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Penyimpanan diblokir; pilihan tetap berlaku sampai halaman ditutup.
    }
  }, []);

  const value = useMemo<I18n>(
    () => ({
      locale,
      setLocale,
      t: (key, params) => translate(locale, key, params),
      label: (group, code) => translateLabel(locale, group, code),
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const i18n = useContext(I18nContext);
  if (!i18n) throw new Error('useI18n() harus dipakai di dalam I18nProvider');
  return i18n;
}
