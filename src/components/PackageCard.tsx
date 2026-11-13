import { Check, Clock, Star } from 'lucide-react';
import { useI18n } from '../i18n';
import { duration, rupiah } from '../lib/format';
import { Package, packageLabel } from '../lib/site';

export function PackageCard({ pkg, onBook }: { pkg: Package; onBook: (packageId: number) => void }) {
  const { locale, t } = useI18n();

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition-shadow hover:shadow-xl hover:shadow-brand-900/5">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={pkg.image} alt={pkg.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink-900 backdrop-blur">
          {packageLabel(pkg, locale)}
        </span>
        {pkg.popular && (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950">
            <Star className="h-3 w-3 fill-current" /> {t('package.popular')}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold">{pkg.name}</h3>
        {pkg.tagline && <p className="mt-1 text-sm text-slate-500">{pkg.tagline}</p>}
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5" /> {duration(pkg.durationMinutes, locale)}
        </p>
        {pkg.features.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
            {pkg.features.slice(0, 3).map((feature) => (
              <li key={feature} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                {feature}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-xs text-slate-500">{t('package.from')}</p>
            <p className="font-display text-xl font-extrabold text-brand-600">{rupiah(pkg.price)}</p>
          </div>
          <button
            type="button"
            onClick={() => onBook(pkg.id)}
            className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            {t('package.book')}
          </button>
        </div>
      </div>
    </article>
  );
}
