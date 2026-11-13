import React, { useEffect, useState } from 'react';
import { Droplets, Loader2 } from 'lucide-react';
import App from './App';
import { I18nProvider, useI18n } from './i18n';
import { fetchSite, Site } from './lib/site';
import { SiteContext } from './lib/siteContext';
import { landingUrl } from './lib/siteLinks';

type State = { status: 'loading' } | { status: 'ready'; site: Site } | { status: 'missing' } | { status: 'error' };

// Muat data tenant dari subdomain yang dibuka, lalu tampilkan app (atau halaman "tidak ditemukan").
// Bahasa bawaan mengikuti pilihan pemilik situs sampai pengunjung memilih sendiri.
export function SiteGate() {
  const [state, setState] = useState<State>({ status: 'loading' });

  const load = () => {
    setState({ status: 'loading' });
    fetchSite()
      .then((site) => setState(site ? { status: 'ready', site } : { status: 'missing' }))
      .catch(() => setState({ status: 'error' }));
  };

  useEffect(load, []);

  useEffect(() => {
    if (state.status === 'ready') {
      const { name, tagline, logo } = state.site.business;
      document.title = tagline ? `${name} — ${tagline}` : name;
      // Logo tenant (Pro) juga jadi ikon tab browser.
      if (logo) {
        let icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (!icon) {
          icon = document.createElement('link');
          icon.rel = 'icon';
          document.head.appendChild(icon);
        }
        icon.href = logo;
      }
    }
  }, [state]);

  return (
    <I18nProvider fallback={state.status === 'ready' ? state.site.business.locale : 'id'}>
      {state.status === 'ready' ? (
        <SiteContext.Provider value={state.site}>
          <App />
        </SiteContext.Provider>
      ) : (
        <GateScreen state={state} onRetry={load} />
      )}
    </I18nProvider>
  );
}

function GateScreen({ state, onRetry }: { state: Exclude<State, { status: 'ready' }>; onRetry: () => void }) {
  const { locale, t } = useI18n();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-6">
      {state.status === 'loading' ? (
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" aria-label={t('gate.loading')} />
      ) : (
        <div className="max-w-sm text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center">
            <Droplets className="w-7 h-7" />
          </div>
          {state.status === 'missing' ? (
            <>
              <h1 className="mt-5 text-xl font-bold">{t('gate.notFound')}</h1>
              <p className="mt-2 text-sm text-slate-500">
                <span className="font-medium text-slate-700">{window.location.hostname}</span> {t('gate.notFoundText')}
              </p>
              <a
                href={landingUrl(locale)}
                className="mt-6 inline-block rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
              >
                {t('gate.create')}
              </a>
            </>
          ) : (
            <>
              <h1 className="mt-5 text-xl font-bold">{t('gate.loadFailed')}</h1>
              <p className="mt-2 text-sm text-slate-500">{t('gate.checkConnection')}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-6 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
              >
                {t('gate.retry')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
