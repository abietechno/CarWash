import React, { useEffect, useState } from 'react';
import { Droplets, Loader2 } from 'lucide-react';
import App from './App';
import { fetchSite, Site } from './lib/site';
import { SiteContext } from './lib/siteContext';

type State = { status: 'loading' } | { status: 'ready'; site: Site } | { status: 'missing' } | { status: 'error' };

const LANDING_URL = import.meta.env.VITE_LANDING_URL || 'https://carwash.cloudbizz.my.id';

// Muat data tenant dari subdomain yang dibuka, lalu tampilkan app (atau halaman "tidak ditemukan").
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
      const { name, tagline } = state.site.business;
      document.title = tagline ? `${name} — ${tagline}` : name;
    }
  }, [state]);

  if (state.status === 'ready') {
    return (
      <SiteContext.Provider value={state.site}>
        <App />
      </SiteContext.Provider>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-6">
      {state.status === 'loading' ? (
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" aria-label="Memuat" />
      ) : (
        <div className="max-w-sm text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center">
            <Droplets className="w-7 h-7" />
          </div>
          {state.status === 'missing' ? (
            <>
              <h1 className="mt-5 text-xl font-bold">Situs tidak ditemukan</h1>
              <p className="mt-2 text-sm text-slate-500">
                <span className="font-medium text-slate-700">{window.location.hostname}</span> belum terdaftar atau belum
                dipublikasikan oleh pemiliknya.
              </p>
              <a
                href={LANDING_URL}
                className="mt-6 inline-block rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Buat situs cuci mobilmu
              </a>
            </>
          ) : (
            <>
              <h1 className="mt-5 text-xl font-bold">Gagal memuat situs</h1>
              <p className="mt-2 text-sm text-slate-500">Periksa koneksi internet, lalu coba lagi.</p>
              <button
                type="button"
                onClick={load}
                className="mt-6 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Coba lagi
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
