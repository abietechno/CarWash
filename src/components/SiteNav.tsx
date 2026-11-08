import { CalendarCheck, CarFront, House, MessageCircle } from 'lucide-react';
import { formatHours, todayHours, whatsappLink } from '../lib/site';
import { useSite } from '../lib/siteContext';

export type Page = 'home' | 'booking' | 'status';

const NAV: { page: Page; label: string; icon: typeof House }[] = [
  { page: 'home', label: 'Beranda', icon: House },
  { page: 'booking', label: 'Reservasi', icon: CalendarCheck },
  { page: 'status', label: 'Status Antrian', icon: CarFront },
];

interface NavProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

export function SiteHeader({ page, onNavigate }: NavProps) {
  const { business } = useSite();
  const today = todayHours(business.openingHours);
  const wa = whatsappLink(business.whatsapp, `Halo ${business.name}, saya mau tanya.`);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <button type="button" onClick={() => onNavigate('home')} className="flex min-w-0 items-center gap-3 text-left">
          {business.logo ? (
            <img src={business.logo} alt={`Logo ${business.name}`} className="h-10 w-auto max-w-32 shrink-0 object-contain" />
          ) : (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500 font-display text-lg font-extrabold text-white">
              {business.name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate font-display font-bold">{business.name}</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className={`h-1.5 w-1.5 rounded-full ${business.openNow ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {business.openNow ? `Buka hari ini ${today ? formatHours(today) : ''}` : 'Sedang tutup'}
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Menu utama">
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
              {item.label}
            </button>
          ))}
        </nav>

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
    </header>
  );
}

export function BottomNav({ page, onNavigate }: NavProps) {
  return (
    <nav
      aria-label="Menu utama"
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
                {item.label}
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
              {item.page === 'status' ? 'Status' : item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
