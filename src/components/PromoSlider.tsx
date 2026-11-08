import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_IMAGE, PromoTheme } from '../lib/site';
import { useSite } from '../lib/siteContext';

const AUTOPLAY_MS = 5000;

// Gradasi warna per tema promo (pilihan warna di dash-admin).
const THEME_OVERLAY: Record<PromoTheme, string> = {
  blue: 'from-blue-800/90 via-blue-700/60',
  cyan: 'from-cyan-800/90 via-cyan-700/60',
  violet: 'from-violet-800/90 via-violet-700/60',
  amber: 'from-amber-800/90 via-amber-700/60',
  rose: 'from-rose-800/90 via-rose-700/60',
  slate: 'from-slate-900/90 via-slate-800/60',
};

interface Slide {
  key: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  image: string;
  theme: PromoTheme;
  packageId: number | null;
}

export function PromoSlider({ onBook }: { onBook: (packageId: number | null) => void }) {
  const { business, packages, promos } = useSite();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  // Tanpa promo, tampilkan satu slide sambutan dari profil bisnis.
  const slides: Slide[] = promos.length
    ? promos.map((p) => ({
        key: `promo-${p.id}`,
        title: p.title,
        subtitle: p.subtitle,
        badge: p.badge,
        image: p.image ?? packages.find((pkg) => pkg.id === p.packageId)?.image ?? HERO_IMAGE,
        theme: p.theme,
        packageId: p.packageId,
      }))
    : [
        {
          key: 'welcome',
          title: business.tagline || `Cuci & salon mobil di ${business.name}`,
          subtitle: business.description,
          badge: business.city,
          image: HERO_IMAGE,
          theme: 'blue',
          packageId: null,
        },
      ];

  const count = slides.length;
  const go = (next: number) => setIndex(((next % count) + count) % count);

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, count]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Promo"
      className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-xl shadow-brand-900/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        setPaused(false);
        if (start === null) return;
        const dx = e.changedTouches[0].clientX - start;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      }}
    >
      <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((slide, i) => (
          <div
            key={slide.key}
            className="relative h-64 w-full shrink-0 sm:h-80"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} dari ${count}`}
            aria-hidden={i !== index}
          >
            <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-r ${THEME_OVERLAY[slide.theme]} to-transparent`} />
            <div className="relative flex h-full max-w-lg flex-col justify-end p-6 text-white sm:p-10">
              {slide.badge && (
                <span className="mb-3 w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">{slide.badge}</span>
              )}
              <h2 className="text-2xl leading-tight font-extrabold sm:text-4xl">{slide.title}</h2>
              {slide.subtitle && <p className="mt-2 line-clamp-2 text-sm text-white/85 sm:text-base">{slide.subtitle}</p>}
              <button
                type="button"
                tabIndex={i === index ? 0 : -1}
                onClick={() => onBook(slide.packageId)}
                className="mt-5 flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink-900 hover:bg-brand-50"
              >
                Pesan sekarang <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <div className="absolute right-5 bottom-5 flex gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={slide.key}
                type="button"
                aria-label={`Promo ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Promo sebelumnya"
            onClick={() => go(index - 1)}
            className="absolute top-1/2 left-3 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur hover:bg-white/30 sm:block"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Promo berikutnya"
            onClick={() => go(index + 1)}
            className="absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur hover:bg-white/30 sm:block"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </section>
  );
}
