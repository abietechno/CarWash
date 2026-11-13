import { INTL_LOCALES, Locale, translate } from '../i18n';

// Harga dalam rupiah, jadi formatnya tetap Indonesia apa pun bahasa tampilannya.
const rupiahFormat = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

export const rupiah = (value: number) => rupiahFormat.format(value);

export function duration(minutes: number, locale: Locale): string {
  if (minutes < 60) return translate(locale, 'format.minutes', { count: minutes });
  const rest = minutes % 60;
  const hours = translate(locale, 'format.hours', { count: Math.floor(minutes / 60) });
  return rest ? `${hours} ${translate(locale, 'format.shortMinutes', { count: rest })}` : hours;
}

// Jam:menit dari string ISO, mis. "09:35".
export function clock(iso: string | null, locale: Locale): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleTimeString(INTL_LOCALES[locale], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).replace('.', ':');
}

export const todayLabel = (locale: Locale) =>
  new Date().toLocaleDateString(INTL_LOCALES[locale], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
