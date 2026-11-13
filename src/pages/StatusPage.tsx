import { CalendarCheck, PartyPopper } from 'lucide-react';
import { BayCard } from '../components/BayCard';
import { CarTop } from '../components/CarTop';
import { Page } from '../components/SiteNav';
import { useQueue } from '../hooks/useQueue';
import { useI18n } from '../i18n';
import { clock, todayLabel } from '../lib/format';
import { loadMyTicket, QueueBoard, QueueItem } from '../lib/queue';
import { useSite } from '../lib/siteContext';

export function StatusPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { business, vehicleTypes } = useSite();
  const { locale, t } = useI18n();
  const { board, error } = useQueue();

  const vehicleName = (code: string) => vehicleTypes.find((v) => v.code === code)?.name ?? code;
  const myTicket = board ? loadMyTicket(business.subdomain, board.date) : null;
  const empty = board && !board.in_progress.length && !board.waiting.length && !board.ready.length;

  return (
    <div className="space-y-8">
      <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 to-brand-800 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">{t('status.title')}</h1>
            <p className="mt-1 text-white/70">{todayLabel(locale)}</p>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {error ? t('status.disconnected') : t('status.live')}
          </span>
        </div>
        {board && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat value={board.stats.in_progress} label={t('status.washing')} className="text-sky-300" />
            <Stat value={board.stats.waiting} label={t('status.waiting')} className="text-amber-300" />
            <Stat value={board.stats.finished_today} label={t('status.finishedToday')} className="text-emerald-300" />
          </div>
        )}
      </header>

      {!board && !error && <div className="h-64 animate-pulse rounded-3xl bg-slate-200" />}

      {board && myTicket && <MyCar board={board} ticket={myTicket} />}

      {empty && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <CarTop type="compact" color="silver" className="mx-auto h-16 w-32 opacity-60" />
          <p className="mt-4 font-semibold">{t('status.emptyTitle')}</p>
          <p className="mt-1 text-sm text-slate-500">{t('status.emptyText')}</p>
          <button
            type="button"
            onClick={() => onNavigate('booking')}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            <CalendarCheck className="h-4 w-4" /> {t('status.book')}
          </button>
        </div>
      )}

      {board && board.in_progress.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">{t('status.inProgress')}</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {board.in_progress.map((item) => (
              <BayCard key={item.ticket} item={item} vehicleName={vehicleName(item.vehicle_type)} mine={item.ticket === myTicket} />
            ))}
          </div>
        </section>
      )}

      {board && board.waiting.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-baseline gap-2 text-xl font-bold">
            {t('status.next')} <span className="text-sm font-normal text-slate-500">{t('status.vehicles', { count: board.waiting.length })}</span>
          </h2>
          <div className="space-y-3">
            {board.waiting.map((item, i) => (
              <WaitingRow key={item.ticket} item={item} next={i === 0} mine={item.ticket === myTicket} vehicleName={vehicleName(item.vehicle_type)} />
            ))}
          </div>
        </section>
      )}

      {board && board.ready.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">{t('status.ready')}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {board.ready.map((item) => (
              <div
                key={item.ticket}
                className={`rounded-2xl border bg-white p-3 text-center ${item.ticket === myTicket ? 'border-emerald-400 ring-4 ring-emerald-100' : 'border-slate-200'}`}
              >
                <CarTop type={item.vehicle_type} color={item.vehicle_color} className="mx-auto h-12 w-24" />
                <p className="mt-1 font-display text-lg font-extrabold">{item.ticket}</p>
                <p className="truncate text-xs text-slate-500">{item.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ value, label, className }: { value: number; label: string; className: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 sm:p-4">
      <p className={`font-display text-3xl font-extrabold ${className}`}>{value}</p>
      <p className="text-xs text-white/70 sm:text-sm">{label}</p>
    </div>
  );
}

function WaitingRow({ item, next, mine, vehicleName }: { item: QueueItem; next: boolean; mine: boolean; vehicleName: string }) {
  const { locale, t } = useI18n();

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border bg-white p-3 sm:gap-4 sm:p-4 ${
        mine ? 'border-brand-400 ring-4 ring-brand-100' : next ? 'border-emerald-300' : 'border-slate-200'
      }`}
    >
      <span
        className={`grid h-12 w-16 shrink-0 place-items-center rounded-xl font-display text-base font-extrabold sm:w-20 sm:text-lg ${
          next ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-ink-900'
        }`}
      >
        {item.ticket}
      </span>
      <div className="hidden h-12 w-24 shrink-0 rounded-xl bg-slate-100 px-1 sm:block">
        <CarTop type={item.vehicle_type} color={item.vehicle_color} className="h-full w-full py-1" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">
          {item.name}
          {mine && <span className="ml-2 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">{t('bay.yours')}</span>}
        </p>
        <p className="truncate text-sm text-slate-500">
          {vehicleName} · {item.package_name}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs text-slate-500">{t('status.estStart')}</p>
        <p className="font-display font-bold">{item.est_wait_minutes ? clock(item.est_start_at, locale) : t('status.now')}</p>
      </div>
      <span
        className={`hidden shrink-0 rounded-full px-3 py-1 text-xs font-semibold md:inline ${
          next ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
        }`}
      >
        {next ? t('status.nextUp') : t('status.waiting')}
      </span>
    </div>
  );
}

// Ringkasan status mobil milik pengunjung yang reservasi dari browser ini.
function MyCar({ board, ticket }: { board: QueueBoard; ticket: string }) {
  const { locale, t } = useI18n();
  const inProgress = board.in_progress.find((i) => i.ticket === ticket);
  const waitingIndex = board.waiting.findIndex((i) => i.ticket === ticket);
  const ready = board.ready.find((i) => i.ticket === ticket);

  let text: string;
  if (ready) text = t('myCar.ready');
  else if (inProgress) {
    const progress = { progress: inProgress.progress ?? 0, minutes: inProgress.remaining_minutes ?? 0 };
    text = inProgress.bay ? t('myCar.washingAt', { bay: inProgress.bay, ...progress }) : t('myCar.washing', progress);
  } else if (waitingIndex >= 0) {
    const item = board.waiting[waitingIndex];
    const when = item.est_wait_minutes ? t('myCar.startsAround', { time: clock(item.est_start_at, locale) }) : t('myCar.soon');
    text = t('myCar.waiting', { n: waitingIndex + 1, when });
  } else return null;

  return (
    <div className={`flex items-center gap-4 rounded-3xl p-5 text-white ${ready ? 'bg-emerald-500' : 'bg-brand-500'}`}>
      {ready ? <PartyPopper className="h-8 w-8 shrink-0" /> : null}
      <div className="min-w-0">
        <p className="text-sm text-white/80">{t('myCar.label', { ticket })}</p>
        <p className="font-semibold">{text}</p>
      </div>
    </div>
  );
}
