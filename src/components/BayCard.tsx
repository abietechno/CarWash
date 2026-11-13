import { useI18n } from '../i18n';
import { QueueItem } from '../lib/queue';
import { CarTop } from './CarTop';

// Mobil yang sedang dicuci: ilustrasi di bay + progress.
export function BayCard({ item, vehicleName, mine }: { item: QueueItem; vehicleName: string; mine: boolean }) {
  const { t } = useI18n();

  return (
    <article
      className={`overflow-hidden rounded-3xl border bg-white ${mine ? 'border-brand-400 ring-4 ring-brand-100' : 'border-slate-200'}`}
    >
      <div className="bay-lane relative h-36 px-6">
        <CarTop type={item.vehicle_type} color={item.vehicle_color} className="relative z-10 mx-auto h-full max-w-[260px] py-4" />
        {/* busa sabun */}
        {[18, 34, 52, 68, 80].map((left, i) => (
          <span
            key={left}
            className="foam-bubble absolute bottom-6 z-20 rounded-full bg-white/80"
            style={{ left: `${left}%`, width: 8 + (i % 3) * 4, height: 8 + (i % 3) * 4, animationDelay: `${i * 0.5}s` }}
          />
        ))}
        {item.bay && (
          <span className="absolute top-4 left-4 z-30 rounded-full bg-brand-500 px-2.5 py-0.5 text-xs font-bold text-white">BAY {item.bay}</span>
        )}
        {mine && <span className="absolute top-4 right-4 z-30 rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-brand-700">{t('bay.yours')}</span>}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold">{item.name}</p>
            <p className="truncate text-sm text-slate-500">
              {vehicleName} · {item.package_name}
            </p>
          </div>
          <span className="shrink-0 font-display text-2xl font-extrabold whitespace-nowrap text-ink-900">{item.ticket}</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all duration-700" style={{ width: `${item.progress ?? 0}%` }} />
        </div>
        <p className="mt-2 text-sm text-slate-500">
          <span className="font-semibold text-ink-900">{item.progress ?? 0}%</span> · {t('bay.remaining', { minutes: item.remaining_minutes ?? 0 })}
        </p>
      </div>
    </article>
  );
}
