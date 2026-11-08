import { useState } from 'react';
import { ChevronRight, Clock, MapPin, MessageCircle, Navigation } from 'lucide-react';
import { CarTop } from '../components/CarTop';
import { PackageCard } from '../components/PackageCard';
import { PromoSlider } from '../components/PromoSlider';
import { Page } from '../components/SiteNav';
import { useQueue } from '../hooks/useQueue';
import { CATEGORY_LABELS, DAY_LABELS, formatHours, PackageCategory, todayHours, whatsappLink } from '../lib/site';
import { useSite } from '../lib/siteContext';

interface Props {
  onBook: (packageId: number | null) => void;
  onNavigate: (page: Page) => void;
}

export function HomePage({ onBook, onNavigate }: Props) {
  const { business, packages } = useSite();
  const { board } = useQueue();
  const [filter, setFilter] = useState<PackageCategory | 'all'>('all');

  const categories = (Object.keys(CATEGORY_LABELS) as PackageCategory[]).filter((c) => packages.some((p) => p.category === c));
  const shown = filter === 'all' ? packages : packages.filter((p) => p.category === filter);
  const today = todayHours(business.openingHours);
  const location = [business.address, business.city].filter(Boolean).join(', ');
  const wa = whatsappLink(business.whatsapp, `Halo ${business.name}, saya mau tanya layanan cuci mobil.`);

  return (
    <div className="space-y-10">
      <PromoSlider onBook={onBook} />

      {/* Ringkasan antrian live */}
      {board && (
        <button
          type="button"
          onClick={() => onNavigate('status')}
          className="flex w-full items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 text-left transition-shadow hover:shadow-lg sm:p-5"
        >
          <div className="flex -space-x-6">
            {board.in_progress.slice(0, 3).map((item) => (
              <div key={item.ticket} className="bay-lane h-12 w-20 rounded-xl px-1 ring-2 ring-white">
                <CarTop type={item.vehicle_type} color={item.vehicle_color} className="h-full w-full py-1.5" />
              </div>
            ))}
            {board.in_progress.length === 0 && (
              <div className="bay-lane grid h-12 w-20 place-items-center rounded-xl text-[10px] font-semibold text-white/70">Kosong</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Antrian sekarang
            </p>
            <p className="truncate text-sm text-slate-500">
              {board.stats.in_progress} dicuci · {board.stats.waiting} menunggu ·{' '}
              {board.stats.next_wait_minutes > 0 ? `tunggu ±${board.stats.next_wait_minutes} mnt` : 'bisa langsung dikerjakan'}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
        </button>
      )}

      <section id="layanan">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold">Paket Layanan</h2>
            <p className="mt-1 text-sm text-slate-500">Harga paket mobil untuk sedan/hatchback; jenis kendaraan lain menyesuaikan.</p>
          </div>
          {categories.length > 1 && (
            <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Kategori layanan">
              {(['all', ...categories] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={filter === c}
                  onClick={() => setFilter(c)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    filter === c ? 'bg-ink-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-ink-900'
                  }`}
                >
                  {c === 'all' ? 'Semua' : CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} onBook={onBook} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Clock className="h-5 w-5 text-brand-500" /> Jam buka
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            {business.openingHours.map((h) => (
              <div key={h.day} className={`flex justify-between ${h.day === today?.day ? 'font-semibold text-ink-900' : 'text-slate-500'}`}>
                <dt>{DAY_LABELS[h.day]}</dt>
                <dd>{formatHours(h)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <MapPin className="h-5 w-5 text-brand-500" /> Lokasi
          </h2>
          {location && <p className="mt-4 text-sm text-slate-600">{location}</p>}
          {business.description && <p className="mt-3 text-sm text-slate-500">{business.description}</p>}
          <div className="mt-auto flex flex-wrap gap-3 pt-5">
            {business.mapsUrl && (
              <a
                href={business.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2.5 text-sm font-semibold hover:bg-slate-200"
              >
                <Navigation className="h-4 w-4" /> Petunjuk arah
              </a>
            )}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                <MessageCircle className="h-4 w-4" /> Chat WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
