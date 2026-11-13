import { useEffect, useState } from 'react';
import { BottomNav, Page, SiteHeader } from './components/SiteNav';
import { useI18n } from './i18n';
import { whatsappLink } from './lib/site';
import { useSite } from './lib/siteContext';
import { landingUrl } from './lib/siteLinks';
import { BookingPage } from './pages/BookingPage';
import { HomePage } from './pages/HomePage';
import { StatusPage } from './pages/StatusPage';

// Halaman dibaca dari hash supaya link #reservasi / #status bisa dibagikan.
const PAGE_HASH: Record<Page, string> = { home: '', booking: '#reservasi', status: '#status' };

function pageFromHash(): Page {
  if (window.location.hash.startsWith('#reservasi')) return 'booking';
  if (window.location.hash.startsWith('#status')) return 'status';
  return 'home';
}

export default function App() {
  const { business, features, packages } = useSite();
  const { locale, t } = useI18n();
  const [page, setPage] = useState<Page>(pageFromHash);
  const [booking, setBooking] = useState<{ packageId: number | null; key: number }>({ packageId: null, key: 0 });

  useEffect(() => {
    const sync = () => setPage(pageFromHash());
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  const navigate = (next: Page) => {
    if (next !== page) {
      history.pushState(null, '', PAGE_HASH[next] || window.location.pathname + window.location.search);
      setPage(next);
    }
    window.scrollTo({ top: 0 });
  };

  // Tombol "Pesan" di promo/paket: buka form reservasi baru dengan paket terpilih.
  // Tanpa reservasi online (paket Gratis), pesan lewat WhatsApp bisnis.
  const book = (packageId: number | null) => {
    if (!features.onlineBooking) {
      const pkg = packages.find((p) => p.id === packageId);
      const text = pkg ? t('wa.orderPackage', { name: business.name, package: pkg.name }) : t('wa.order', { name: business.name });
      const wa = whatsappLink(business.whatsapp, text);
      if (wa) {
        window.open(wa, '_blank', 'noopener');
        return;
      }
    }
    setBooking((b) => ({ packageId, key: b.key + 1 }));
    navigate('booking');
  };

  return (
    <div className="min-h-screen">
      <SiteHeader page={page} onNavigate={navigate} />

      <main className="mx-auto max-w-5xl px-4 pt-6 pb-32 md:pb-16">
        {page === 'home' && <HomePage onBook={book} onNavigate={navigate} />}
        {page === 'booking' && <BookingPage key={booking.key} initialPackageId={booking.packageId} onNavigate={navigate} />}
        {page === 'status' && <StatusPage onNavigate={navigate} />}
      </main>

      <footer className="border-t border-slate-200 py-8 pb-28 text-center text-xs text-slate-400 md:pb-8">
        © {new Date().getFullYear()} {business.name}
        {features.branding && (
          <>
            {' · '}{t('footer.madeWith')}{' '}
            <a href={landingUrl(locale)} className="font-semibold text-slate-500 hover:text-brand-600">
              WashWuzz
            </a>
          </>
        )}
      </footer>

      <BottomNav page={page} onNavigate={navigate} />
    </div>
  );
}
