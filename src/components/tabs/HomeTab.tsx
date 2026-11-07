import React from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  ChevronRight,
  Car,
  Droplets,
  Star,
  Award,
  PhoneCall,
  Flame,
} from 'lucide-react';
import { ServicePackage, BookingOrder, LoyaltyProfile, BayMonitor } from '../../types';
import { playIosTap } from '../../utils/audio';

interface HomeTabProps {
  packages: ServicePackage[];
  activeOrder?: BookingOrder | null;
  loyalty: LoyaltyProfile;
  bays: BayMonitor[];
  onSelectPackageForBooking: (pkg: ServicePackage) => void;
  onNavigateToTab: (tab: 'home' | 'booking' | 'tracking' | 'loyalty' | 'admin') => void;
  dark?: boolean;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  packages,
  activeOrder,
  loyalty,
  bays,
  onSelectPackageForBooking,
  onNavigateToTab,
  dark = false,
}) => {
  const busyBays = bays.filter((b) => b.status === 'pengerjaan').length;

  return (
    <div className="space-y-5 pb-24">
      {/* Top Greeting Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-medium tracking-wide uppercase text-blue-500">
            Aura GlossLab Studio
          </span>
          <h2 className="text-xl font-bold tracking-tight">Halo, {loyalty.name.split(' ')[0]}</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            playIosTap();
            onNavigateToTab('loyalty');
          }}
          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-semibold border cupertino-press ${
            dark
              ? 'bg-amber-950/40 text-amber-300 border-amber-600/40'
              : 'bg-amber-50 text-amber-700 border-amber-300/80'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>{loyalty.tier} Member</span>
          <ChevronRight className="w-3 h-3 opacity-60" />
        </button>
      </div>

      {/* Live Active Order Tracking Banner (if there's an active job) */}
      {activeOrder && activeOrder.status !== 'selesai' && (
        <div
          onClick={() => {
            playIosTap();
            onNavigateToTab('tracking');
          }}
          className={`p-4 rounded-2xl border cursor-pointer cupertino-press transition-all ${
            dark
              ? 'bg-gradient-to-r from-blue-950/50 via-zinc-900 to-indigo-950/40 border-blue-800/50'
              : 'bg-gradient-to-r from-blue-50 via-white to-indigo-50/60 border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                Pengerjaan Sedang Berlangsung
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {activeOrder.progressPercentage}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold tracking-tight">{activeOrder.vehicleModel}</h4>
              <p className="text-xs text-zinc-500">
                {activeOrder.vehiclePlate} · {activeOrder.bayName.split('(')[0]}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
              <span>Lacak Langsung</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${activeOrder.progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Hero Studio Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-zinc-800">
        <div className="relative h-48 w-full bg-slate-900">
          <img
            src="/src/assets/images/detailing_hero_studio_1794059425076.jpg"
            alt="GlossLab Studio"
            className="w-full h-full object-cover brightness-[0.82]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {/* Bay status pill */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/15">
            <span
              className={`w-2 h-2 rounded-full ${
                busyBays < bays.length ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span>
              {bays.length - busyBays} dari {bays.length} Bay Tersedia
            </span>
          </div>

          {/* Hero text */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-1.5 text-xs text-blue-300 font-medium mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Detailing Presisi & Cuci Hidrolik Salju</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white leading-tight">
              Kilau Sempurna Berstandar Kontes
            </h3>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/15">
              <span className="text-[11px] text-zinc-300">
                Air Deionisasi Murni · pH Netral
              </span>
              <button
                type="button"
                onClick={() => {
                  playIosTap();
                  onNavigateToTab('booking');
                }}
                className="py-1.5 px-3 rounded-full bg-white text-slate-900 text-xs font-bold shadow-md hover:bg-zinc-100 cupertino-press"
              >
                Booking Jadwal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Matrix */}
      <div className="grid grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => {
            playIosTap();
            onNavigateToTab('booking');
          }}
          className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center border transition-all cupertino-press ${
            dark
              ? 'bg-zinc-800/80 border-zinc-700/60 text-white'
              : 'bg-white border-slate-200/80 text-slate-900 shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold leading-tight">Reservasi</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playIosTap();
            onNavigateToTab('tracking');
          }}
          className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center border transition-all cupertino-press ${
            dark
              ? 'bg-zinc-800/80 border-zinc-700/60 text-white'
              : 'bg-white border-slate-200/80 text-slate-900 shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1.5">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold leading-tight">Live Status</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playIosTap();
            onNavigateToTab('loyalty');
          }}
          className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center border transition-all cupertino-press ${
            dark
              ? 'bg-zinc-800/80 border-zinc-700/60 text-white'
              : 'bg-white border-slate-200/80 text-slate-900 shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold leading-tight">Loyalty & Ulasan</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playIosTap();
            onNavigateToTab('admin');
          }}
          className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center border transition-all cupertino-press ${
            dark
              ? 'bg-zinc-800/80 border-zinc-700/60 text-white'
              : 'bg-white border-slate-200/80 text-slate-900 shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold leading-tight">Admin Bay</span>
        </button>
      </div>

      {/* Stamp Card Progress Teaser */}
      <div
        onClick={() => {
          playIosTap();
          onNavigateToTab('loyalty');
        }}
        className={`p-4 rounded-2xl border cursor-pointer cupertino-press ${
          dark
            ? 'bg-zinc-900 border-zinc-800'
            : 'bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border-blue-100'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <h4 className="text-xs font-bold">Kartu Cuci Berhadiah</h4>
          </div>
          <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
            {loyalty.stamps}/5 Stamp Terkumpul
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          {[1, 2, 3, 4, 5].map((index) => {
            const isStamped = index <= loyalty.stamps;
            const isLast = index === 5;
            return (
              <div
                key={index}
                className={`flex-1 h-12 rounded-xl flex flex-col items-center justify-center border text-xs font-semibold ${
                  isStamped
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : isLast
                    ? 'border-dashed border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 text-amber-600'
                    : dark
                    ? 'bg-zinc-800/60 border-zinc-700 text-zinc-500'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {isStamped ? (
                  <Droplets className="w-4 h-4" />
                ) : isLast ? (
                  <Sparkles className="w-4 h-4 animate-pulse text-amber-500" />
                ) : (
                  <span>#{index}</span>
                )}
                <span className="text-[9px] mt-0.5">
                  {isLast ? 'GRATIS' : `Ke-${index}`}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 text-center">
          1x cuci lagi untuk klaim voucher <strong className="text-blue-600 dark:text-blue-400">Gratis Cuci Signature</strong>!
        </p>
      </div>

      {/* Featured Service Packages */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base md:text-lg font-bold tracking-tight">Pilihan Paket Unggulan</h3>
            <p className="text-xs text-zinc-500">Pengerjaan higienis dengan garansi kepuasan</p>
          </div>
          <button
            type="button"
            onClick={() => {
              playIosTap();
              onNavigateToTab('booking');
            }}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Lihat Semua
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                dark
                  ? 'bg-zinc-800/90 border-zinc-700/80 hover:border-zinc-600'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex gap-3">
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 bg-zinc-200 dark:bg-zinc-700">
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {pkg.popular && (
                    <span className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow-xs">
                      Favorit
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs md:text-sm font-bold tracking-tight leading-tight">
                        {pkg.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5">
                        {pkg.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500" />
                      {pkg.durationMinutes} Menit
                    </span>
                    <span>·</span>
                    <span>Garansi Bersih</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-700/60">
                <div className="text-xs">
                  <span className="text-[10px] text-zinc-400">Mulai </span>
                  <span className="font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 text-sm">
                    Rp {pkg.priceBase.toLocaleString('id-ID')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playIosTap();
                    onSelectPackageForBooking(pkg);
                    onNavigateToTab('booking');
                  }}
                  className="py-1.5 px-3.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs cupertino-press"
                >
                  Pilih Paket
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Studio Quality Commitments & CS Contact (Responsive Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          className={`p-4 rounded-2xl border space-y-2.5 md:col-span-2 ${
            dark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Standar Kualitas GlossLab Studio
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-[11px]">Air Deionisasi 0 TDS (Bebas Jamur)</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-[11px]">Sampo pH-Netral Bersertifikat</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-[11px]">Garansi Hujan 24 Jam (Cuci Ulang)</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="text-[11px]">Master Detailer Berpengalaman</span>
            </div>
          </div>
        </div>

        {/* Emergency / CS Contact bar */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between text-xs ${
            dark
              ? 'bg-zinc-800/50 border-zinc-700/60'
              : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-xs">Konsultasi Cat & Salon?</p>
              <p className="text-[11px] text-zinc-500">Chief Detailer standby 24 jam</p>
            </div>
          </div>
          <a
            href="https://wa.me/6281288990011?text=Halo%20GlossLab,%20saya%20mau%20konsultasi%20salon%20mobil"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 text-center cupertino-press"
          >
            Chat WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};
