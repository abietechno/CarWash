import { CalendarCheck, CarFront, House, Languages, MessageCircle } from 'lucide-react';
import { isLocale, LOCALES, MessageKey, useI18n } from '../i18n';
import { formatHours, todayHours, whatsappLink } from '../lib/site';
import { useSite } from '../lib/siteContext';

export type Page = 'home' | 'booking' | 'status';

const NAV: { page: Page; label: MessageKey; icon: typeof House }[] = [
  { page: 'home', label: 'nav.home', icon: House },
  { page: 'booking', label: 'nav.booking', icon: CalendarCheck },
  { page: 'status', label: 'nav.status', icon: CarFront },
];

interface NavProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

// Kode bahasa yang terlihat; <select> asli transparan di atasnya supaya di HP muncul pemilih bawaan.
function LanguagePicker() {
  const { locale, setLocale, t } = useI18n();
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <label className="relative flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300">
      <Languages className="h-4 w-4" />
      {current.short}
      <select
        value={locale}
        onChange={(e) => isLocale(e.target.value) && setLocale(e.target.value)}
        aria-label={t('nav.language')}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code} lang={l.code}>
            {l.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SiteHeader({ page, onNavigate }: NavProps) {
  const { business } = useSite();
  const { locale, t } = useI18n();
  const today = todayHours(business.openingHours);
  const wa = whatsappLink(business.whatsapp, t('wa.ask', { name: business.name }));

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
        <button type="button" onClick={() => onNavigate('home')} className="flex min-w-0 items-center gap-3 text-left">
          {business.logo ? (
            <img src={business.logo} alt={t('header.logoAlt', { name: business.name })} className="h-10 w-auto max-w-32 shrink-0 object-contain" />
          ) : (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500 font-display text-lg font-extrabold text-white">
              {business.name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate font-display font-bold">{business.name}</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${business.openNow ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="truncate">
                {business.openNow ? t('header.openToday', { hours: today ? formatHours(today, locale) : '' }) : t('header.closedNow')}
              </span>
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex" aria-label={t('nav.mainMenu')}>
          {NAV.map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => onNavigate(item.page)}
              aria-current={page === item.page ? 'page' : undefined}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                page === item.page ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-ink-900'
              }`}
            >
              {t(item.label)}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LanguagePicker />
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

export function BottomNav({ page, onNavigate }: NavProps) {
  const { t } = useI18n();

  return (
    <nav
      aria-label={t('nav.mainMenu')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <div className="mx-auto flex max-w-md items-end justify-around px-4 pt-2 pb-2">
        {NAV.map((item) => {
          const active = page === item.page;
          const Icon = item.icon;
          if (item.page === 'booking') {
            return (
              <button
                key={item.page}
                type="button"
                onClick={() => onNavigate(item.page)}
                className="-mt-6 flex flex-col items-center gap-1 text-xs font-semibold text-brand-700"
              >
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/40">
                  <Icon className="h-6 w-6" />
                </span>
                {t(item.label)}
              </button>
            );
          }
          return (
            <button
              key={item.page}
              type="button"
              onClick={() => onNavigate(item.page)}
              aria-current={active ? 'page' : undefined}
              className={`flex w-20 flex-col items-center gap-1 py-1 text-xs ${active ? 'font-semibold text-brand-600' : 'text-slate-500'}`}
            >
              <Icon className="h-6 w-6" strokeWidth={active ? 2.4 : 1.8} />
              {item.page === 'status' ? t('nav.statusShort') : t(item.label)}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
