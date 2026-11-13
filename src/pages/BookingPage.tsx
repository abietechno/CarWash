import { FormEvent, ReactNode, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CarFront, Check, Clock, Loader2, MessageCircle, Moon } from 'lucide-react';
import { CarTop } from '../components/CarTop';
import { Page } from '../components/SiteNav';
import { VEHICLE_COLORS } from '../lib/carSvg';
import { useI18n } from '../i18n';
import { clock, duration, rupiah } from '../lib/format';
import { BookingError, createBooking, QueueItem, saveMyTicket } from '../lib/queue';
import { fitsVehicle, formatHours, priceFor, todayHours, VehicleType, whatsappLink } from '../lib/site';
import { useSite } from '../lib/siteContext';

interface Props {
  initialPackageId: number | null;
  onNavigate: (page: Page) => void;
}

export function BookingPage({ initialPackageId, onNavigate }: Props) {
  const { business, features, packages, vehicleTypes } = useSite();
  const { locale, t, label } = useI18n();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  // Jenis kendaraan hanya ditawarkan kalau ada paket untuknya.
  const vehicleChoices = vehicleTypes.filter((v) => packages.some((p) => fitsVehicle(p, v)));
  const startPackage = packages.find((p) => p.id === initialPackageId) ?? packages.find((p) => p.popular) ?? packages[0];
  const startVehicle = vehicleChoices.find((v) => !startPackage || fitsVehicle(startPackage, v)) ?? vehicleChoices[0];
  const [vehicleCode, setVehicleCode] = useState(startVehicle?.code ?? 'compact');
  const [color, setColor] = useState('white');
  const [packageId, setPackageId] = useState<number | null>(
    startPackage?.id ?? null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<QueueItem | null>(null);

  const vehicle = vehicleTypes.find((v) => v.code === vehicleCode);
  const vehiclePackages = vehicle ? packages.filter((p) => fitsVehicle(p, vehicle)) : packages;
  const pkg = packages.find((p) => p.id === packageId);
  const total = pkg ? priceFor(pkg, vehicle) : 0;
  const today = todayHours(business.openingHours);

  function chooseVehicle(next: VehicleType) {
    setVehicleCode(next.code);
    if (pkg && fitsVehicle(pkg, next)) return;
    const fitting = packages.filter((p) => fitsVehicle(p, next));
    setPackageId((fitting.find((p) => p.popular) ?? fitting[0])?.id ?? null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!pkg) return;
    setSubmitting(true);
    setError('');
    setFieldErrors({});
    try {
      const booking = await createBooking({
        customer_name: name,
        phone,
        vehicle_type: vehicleCode,
        vehicle_color: color,
        package_id: pkg.id,
      }, locale);
      if (booking.date) saveMyTicket(business.subdomain, booking.ticket, booking.date);
      setResult(booking);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      if (e instanceof BookingError) {
        setError(e.message);
        setFieldErrors(e.fields);
      } else {
        setError(t('booking.offline'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!features.onlineBooking) return <BookingUnavailable onNavigate={onNavigate} />;

  if (result) return <BookingSuccess booking={result} vehicleName={vehicle?.name ?? ''} total={total} onNavigate={onNavigate} />;

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">{t('booking.title')}</h1>
          <p className="mt-1 text-slate-500">{t('booking.subtitle')}</p>
        </div>

        {!business.openNow && (
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <Moon className="h-5 w-5 shrink-0" />
            <p>{today && !today.closed ? t('booking.closedToday', { hours: formatHours(today, locale) }) : t('booking.closed')}</p>
          </div>
        )}

        <Step number={1} title={t('booking.step1')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('booking.name')} error={fieldErrors.customer_name?.[0]}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                autoComplete="name"
                placeholder={t('booking.namePlaceholder')}
                className="input"
              />
            </Field>
            <Field label={t('booking.phone')} error={fieldErrors.phone?.[0]}>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                inputMode="tel"
                autoComplete="tel"
                placeholder="0812..."
                className="input"
              />
            </Field>
          </div>
          <p className="mt-3 text-xs text-slate-400">{t('booking.privacy')}</p>
        </Step>

        <Step number={2} title={t('booking.step2')}>
          <div className="grid grid-cols-2 gap-3">
            {vehicleChoices.map((v) => {
              const active = v.code === vehicleCode;
              return (
                <button
                  key={v.code}
                  type="button"
                  onClick={() => chooseVehicle(v)}
                  aria-pressed={active}
                  className={`rounded-2xl border-2 p-3 text-left transition-all ${
                    active ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <CarTop type={v.code} color={color} className="mx-auto h-14 w-28" />
                  <p className="mt-2 text-sm leading-tight font-semibold">{v.name}</p>
                  {v.examples && <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{v.examples}</p>}
                </button>
              );
            })}
          </div>
          <p className="mt-5 mb-2 text-sm font-medium">{t('booking.color')} <span className="font-normal text-slate-500">· {label('colors', color)}</span></p>
          <div className="flex flex-wrap gap-2.5">
            {Object.entries(VEHICLE_COLORS).map(([code, c]) => (
              <button
                key={code}
                type="button"
                title={label('colors', code)}
                aria-label={label('colors', code)}
                aria-pressed={code === color}
                onClick={() => setColor(code)}
                className={`h-9 w-9 rounded-full border-2 transition-transform ${code === color ? 'scale-110 border-brand-500 ring-2 ring-brand-200' : 'border-slate-200'}`}
                style={{ background: c.body }}
              />
            ))}
          </div>
          {fieldErrors.vehicle_type && <p className="mt-2 text-xs text-red-600">{fieldErrors.vehicle_type[0]}</p>}
        </Step>

        <Step number={3} title={t('booking.step3')}>
          <div className="space-y-3">
            {vehiclePackages.map((p) => {
              const active = p.id === packageId;
              return (
                <label
                  key={p.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 transition-all ${
                    active ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input type="radio" name="package" className="sr-only" checked={active} onChange={() => setPackageId(p.id)} />
                  <img src={p.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover sm:w-20" />
                  <span className="min-w-0 flex-1">
                    <span className="block leading-snug font-semibold">{p.name}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {duration(p.durationMinutes, locale)}
                      </span>
                      <span className="font-display text-sm font-extrabold whitespace-nowrap text-brand-600">{rupiah(priceFor(p, vehicle))}</span>
                    </span>
                  </span>
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${active ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300'}`}
                  >
                    {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                </label>
              );
            })}
          </div>
          {fieldErrors.package_id && <p className="mt-2 text-xs text-red-600">{fieldErrors.package_id[0]}</p>}
        </Step>
      </div>

      {/* Ringkasan: kartu samping di desktop, menempel di bawah di HP */}
      <aside className="lg:sticky lg:top-24">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="bay-lane h-28 rounded-2xl px-6">
            <CarTop type={vehicleCode} color={color} className="mx-auto h-full max-w-[220px] py-3" />
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">{t('booking.vehicle')}</dt>
              <dd className="text-right font-medium">{vehicle?.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">{t('booking.package')}</dt>
              <dd className="text-right font-medium">{pkg?.name ?? '-'}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-slate-100 pt-3">
              <dt className="font-semibold">{t('booking.total')}</dt>
              <dd className="font-display text-xl font-extrabold text-brand-600">{rupiah(total)}</dd>
            </div>
          </dl>
          <p className="mt-1 text-xs text-slate-400">{t('booking.payOnSite')}</p>
          {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !pkg || !business.openNow}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 py-3.5 font-bold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CarFront className="h-5 w-5" />}
            {t('booking.submit')}
          </button>
        </div>
      </aside>
    </form>
  );
}

// Bisnis tanpa reservasi online: arahkan ke WhatsApp atau datang langsung.
function BookingUnavailable({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { business } = useSite();
  const { t } = useI18n();
  const wa = whatsappLink(business.whatsapp, t('wa.order', { name: business.name }));

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center">
      <CarTop type="medium" color="blue" className="mx-auto h-16 w-32" />
      <h1 className="mt-5 text-2xl font-extrabold">{t('unavailable.title')}</h1>
      <p className="mt-2 text-slate-500">
        {t('unavailable.text', { name: business.name })}
      </p>
      <div className="mt-6 flex flex-col gap-3">
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-emerald-500 py-3.5 font-bold text-white hover:bg-emerald-600"
          >
            <MessageCircle className="h-5 w-5" /> {t('home.chat')}
          </a>
        )}
        <button
          type="button"
          onClick={() => onNavigate('status')}
          className="rounded-full bg-white py-3.5 font-semibold ring-1 ring-slate-200 hover:bg-slate-50"
        >
          {t('unavailable.viewQueue')}
        </button>
      </div>
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="mb-4 flex items-center gap-3 text-lg font-bold">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-500 text-sm text-white">{number}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function BookingSuccess({
  booking,
  vehicleName,
  total,
  onNavigate,
}: {
  booking: QueueItem;
  vehicleName: string;
  total: number;
  onNavigate: (page: Page) => void;
}) {
  const { business } = useSite();
  const { locale, t } = useI18n();
  const wa = whatsappLink(business.whatsapp, t('wa.booked', { name: business.name, ticket: booking.ticket }));

  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      confetti({ particleCount: 120, spread: 75, origin: { y: 0.3 }, colors: ['#2f7bf6', '#22d3ee', '#facc15', '#ffffff'] });
    }
  }, []);

  return (
    <div className="mx-auto max-w-md text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
        <Check className="h-7 w-7" strokeWidth={3} />
      </span>
      <h1 className="mt-4 text-2xl font-extrabold">{t('success.title')}</h1>
      <p className="mt-1 text-slate-500">{t('success.save')}</p>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-brand-900/5">
        <div className="bay-lane h-32 px-8">
          <CarTop type={booking.vehicle_type} color={booking.vehicle_color} className="mx-auto h-full max-w-[240px] py-3" />
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-500">{t('success.ticket')}</p>
          <p className="font-display text-6xl font-extrabold tracking-tight text-brand-600">{booking.ticket}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-left text-sm">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{t('success.position')}</p>
              <p className="font-display text-lg font-bold">{t('success.positionValue', { n: booking.position ?? 1 })}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{t('success.estimate')}</p>
              <p className="font-display text-lg font-bold">
                {booking.est_wait_minutes ? t('success.minutes', { count: booking.est_wait_minutes }) : t('success.now')}
              </p>
              {booking.est_wait_minutes ? <p className="text-xs text-slate-500">{t('success.around', { time: clock(booking.est_start_at, locale) })}</p> : null}
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            {vehicleName} · {booking.package_name} · <span className="font-semibold">{rupiah(total)}</span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onNavigate('status')}
          className="rounded-full bg-brand-500 py-3.5 font-bold text-white hover:bg-brand-600"
        >
          {t('success.track')}
        </button>
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-white py-3.5 font-semibold ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <MessageCircle className="h-5 w-5 text-emerald-500" /> {t('success.confirm')}
          </a>
        )}
      </div>
    </div>
  );
}
