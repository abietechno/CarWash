import React, { useState } from 'react';
import {
  TrendingUp,
  Car,
  Clock,
  Star,
  DollarSign,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  UserCheck,
  RefreshCw,
  MoreVertical,
} from 'lucide-react';
import { BookingOrder, BayMonitor, BookingStatus } from '../../types';
import { DAILY_ANALYTICS_DATA } from '../../data/mockData';
import { playIosTap, playIosNotification } from '../../utils/audio';

interface AdminTabProps {
  orders: BookingOrder[];
  bays: BayMonitor[];
  onUpdateOrderStatus: (orderId: string, newStatus: BookingStatus, progress: number) => void;
  onUpdateBayStatus: (bayId: string, newStatus: 'tersedia' | 'pengerjaan' | 'maintenance') => void;
  onOpenReceipt: (order: BookingOrder) => void;
  dark?: boolean;
}

export const AdminTab: React.FC<AdminTabProps> = ({
  orders,
  bays,
  onUpdateOrderStatus,
  onUpdateBayStatus,
  onOpenReceipt,
  dark = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'bays' | 'orders'>('analytics');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [exportedNotice, setExportedNotice] = useState(false);

  const analytics = DAILY_ANALYTICS_DATA;

  // Calculate live revenue from orders
  const currentTotalRevenue = orders.reduce((acc, o) => acc + (o.paymentStatus === 'lunas' ? o.totalAmount : 0), 0);
  const totalVehiclesCount = orders.length;

  const handleExportReport = () => {
    playIosTap();
    setExportedNotice(true);
    setTimeout(() => setExportedNotice(false), 3000);
  };

  const handleAdvanceOrderStatus = (order: BookingOrder) => {
    playIosTap();
    playIosNotification();

    if (order.status === 'menunggu_antrian') {
      onUpdateOrderStatus(order.id, 'dicuci', 35);
    } else if (order.status === 'dicuci') {
      onUpdateOrderStatus(order.id, 'detailing', 68);
    } else if (order.status === 'detailing') {
      onUpdateOrderStatus(order.id, 'quality_check', 90);
    } else if (order.status === 'quality_check') {
      onUpdateOrderStatus(order.id, 'selesai', 100);
    } else {
      onUpdateOrderStatus(order.id, 'menunggu_antrian', 10);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (orderStatusFilter === 'all') return true;
    if (orderStatusFilter === 'in_progress') return o.status === 'dicuci' || o.status === 'detailing' || o.status === 'quality_check';
    if (orderStatusFilter === 'completed') return o.status === 'selesai' || o.status === 'diambil';
    if (orderStatusFilter === 'queue') return o.status === 'menunggu_antrian';
    return true;
  });

  return (
    <div className="space-y-4 pb-28">
      {/* Header */}
      <div className="pt-1 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold tracking-wide uppercase text-blue-500">
            ADMIN CONSOLE STUDIO
          </span>
          <h2 className="text-xl font-bold tracking-tight">Manajemen & Analitik</h2>
        </div>

        <button
          type="button"
          onClick={handleExportReport}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shadow-xs hover:opacity-90 cupertino-press"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>{exportedNotice ? 'Laporan Terunduh!' : 'Ekspor Harian'}</span>
        </button>
      </div>

      {/* Admin Subnav Segmented */}
      <div
        className={`flex items-center p-1 rounded-xl text-xs font-semibold border ${
          dark ? 'bg-zinc-800/80 border-zinc-700/60' : 'bg-slate-200/80 border-slate-300/40'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            playIosTap();
            setActiveSubTab('analytics');
          }}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeSubTab === 'analytics'
              ? dark
                ? 'bg-zinc-700 text-white shadow-xs'
                : 'bg-white text-slate-900 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Laporan Bisnis
        </button>
        <button
          type="button"
          onClick={() => {
            playIosTap();
            setActiveSubTab('bays');
          }}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeSubTab === 'bays'
              ? dark
                ? 'bg-zinc-700 text-white shadow-xs'
                : 'bg-white text-slate-900 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Monitor Bay ({bays.length})
        </button>
        <button
          type="button"
          onClick={() => {
            playIosTap();
            setActiveSubTab('orders');
          }}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeSubTab === 'orders'
              ? dark
                ? 'bg-zinc-700 text-white shadow-xs'
                : 'bg-white text-slate-900 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Transaksi ({orders.length})
        </button>
      </div>

      {/* SUBTAB 1: COMPREHENSIVE BUSINESS ANALYTICS */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-4">
          {/* Main Revenue Card */}
          <div
            className={`p-4 rounded-3xl border ${
              dark
                ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700/80 text-white'
                : 'bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 border-blue-950 text-white shadow-md'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-blue-200">
              <span>Pendapatan Kotor Hari Ini ({analytics.date.split(',')[0]})</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                +{analytics.growthVsYesterday}%
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold font-mono tracking-tight tabular-nums">
                Rp {currentTotalRevenue.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-blue-300">
                / Target Rp {analytics.targetRevenue.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Target progress bar */}
            <div className="mt-3 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, (currentTotalRevenue / analytics.targetRevenue) * 100)}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-blue-200/80 mt-1.5">
              Tercapai {Math.round((currentTotalRevenue / analytics.targetRevenue) * 100)}% dari target operasional harian studio.
            </p>
          </div>

          {/* 4-Column Performance KPI Cards on Desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div
              className={`p-3.5 rounded-2xl border text-center ${
                dark ? 'bg-zinc-800/80 border-zinc-700/60' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-1">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">Omset Harian</span>
              <h4 className="text-sm md:text-base font-extrabold font-mono mt-0.5 tabular-nums">
                Rp {(currentTotalRevenue / 1000000).toFixed(1)} Jt
              </h4>
              <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">+{analytics.growthVsYesterday}%</p>
            </div>

            <div
              className={`p-3.5 rounded-2xl border text-center ${
                dark ? 'bg-zinc-800/80 border-zinc-700/60' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-1">
                <Car className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">Kendaraan</span>
              <h4 className="text-sm md:text-base font-extrabold font-mono mt-0.5">{totalVehiclesCount} Unit</h4>
              <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Trafik Stabil</p>
            </div>

            <div
              className={`p-3.5 rounded-2xl border text-center ${
                dark ? 'bg-zinc-800/80 border-zinc-700/60' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-1">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">Rerata Durasi</span>
              <h4 className="text-sm md:text-base font-extrabold font-mono mt-0.5">{analytics.avgDurationMinutes} mnt</h4>
              <p className="text-[9px] text-zinc-400">Efisiensi 94%</p>
            </div>

            <div
              className={`p-3.5 rounded-2xl border text-center ${
                dark ? 'bg-zinc-800/80 border-zinc-700/60' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-1">
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">Skor CSAT</span>
              <h4 className="text-sm md:text-base font-extrabold font-mono mt-0.5">{analytics.customerSatisfactionScore}</h4>
              <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Sangat Puas</p>
            </div>
          </div>

          {/* Revenue Breakdown & Hourly Traffic side-by-side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue Breakdown by Category */}
            <div
              className={`p-4 rounded-3xl border space-y-3 ${
                dark ? 'bg-zinc-800/80 border-zinc-700/60 text-white' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Kontribusi Pendapatan Layanan
                </h4>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                  4 Kategori Aktif
                </span>
              </div>

              <div className="space-y-2.5">
                {analytics.revenueBreakdown.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-800 dark:text-zinc-200 truncate pr-2">
                        {item.category}
                      </span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white shrink-0">
                        Rp {item.amount.toLocaleString('id-ID')} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          idx === 0
                            ? 'bg-blue-600'
                            : idx === 1
                            ? 'bg-indigo-500'
                            : idx === 2
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Traffic Bar Chart */}
            <div
              className={`p-4 rounded-3xl border space-y-3 ${
                dark ? 'bg-zinc-800/80 border-zinc-700/60 text-white' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                    Distribusi Trafik Jam Operasional
                  </h4>
                  <p className="text-[10px] text-zinc-400">Peak hours pada 10:00 & 14:00 - 15:00</p>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">08:00 - 17:00</span>
              </div>

              <div className="flex items-end justify-between h-28 pt-4 px-1">
                {analytics.hourlyTraffic.map((slot) => {
                  const heightPercent = (slot.count / 6) * 100;
                  const isPeak = slot.count >= 4;

                  return (
                    <div key={slot.hour} className="flex flex-col items-center gap-1.5 flex-1">
                      <span className="text-[9px] font-mono text-zinc-400">{slot.count}</span>
                      <div className="w-4 md:w-6 bg-zinc-100 dark:bg-zinc-700 rounded-t h-20 relative flex items-end">
                        <div
                          className={`w-full rounded-t transition-all duration-500 ${
                            isPeak ? 'bg-blue-600' : 'bg-blue-300 dark:bg-blue-800'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-zinc-400">{slot.hour.split(':')[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: REAL-TIME BAYS / PITS MONITOR */}
      {activeSubTab === 'bays' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold tracking-tight">Status Fasilitas Bay & Booth</h3>
              <p className="text-xs text-zinc-500">Kapasitas 4 slot pengerjaan simultan</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              ● Live Status
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {bays.map((bay) => {
              const isOccupied = bay.status === 'pengerjaan';

              return (
                <div
                  key={bay.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isOccupied
                      ? 'border-blue-500/50 bg-blue-50/40 dark:bg-blue-950/20'
                      : dark
                      ? 'bg-zinc-800/80 border-zinc-700/60'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold leading-tight">{bay.name}</h4>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                            bay.status === 'tersedia'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {bay.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Kendaraan: <strong className="text-slate-800 dark:text-zinc-200">{bay.currentVehicle || 'Tidak Ada'}</strong>
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Teknisi Jaga: {bay.technician}
                      </p>
                    </div>

                    {isOccupied && bay.timerMinutesRemaining && (
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-amber-500">
                          {bay.timerMinutesRemaining} mnt
                        </span>
                        <p className="text-[9px] text-zinc-400">Sisa Waktu</p>
                      </div>
                    )}
                  </div>

                  {/* Toggle Bay Quick Action */}
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-700/60">
                    <span className="text-[10px] text-zinc-400">Tipe: {bay.type}</span>
                    <button
                      type="button"
                      onClick={() => {
                        playIosTap();
                        onUpdateBayStatus(
                          bay.id,
                          bay.status === 'tersedia' ? 'pengerjaan' : 'tersedia'
                        );
                      }}
                      className={`text-[11px] font-semibold py-1 px-3 rounded-lg border transition-colors cupertino-press ${
                        isOccupied
                          ? 'border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                          : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-500'
                      }`}
                    >
                      {isOccupied ? 'Set Menjadi Kosong' : 'Isi Antrian Manual'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: TRANSACTION & QUEUE MANAGEMENT */}
      {activeSubTab === 'orders' && (
        <div className="space-y-3">
          {/* Search & Filter Bar */}
          <div className="space-y-2">
            <div
              className={`flex items-center gap-2 p-2 rounded-xl border ${
                dark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-200'
              }`}
            >
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari plat nomor / pelanggan / mobil..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-transparent focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'in_progress', label: 'Pengerjaan' },
                { id: 'queue', label: 'Antrian' },
                { id: 'completed', label: 'Selesai' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    playIosTap();
                    setOrderStatusFilter(f.id);
                  }}
                  className={`py-1 px-3 rounded-full text-[11px] font-medium whitespace-nowrap transition-all cupertino-press ${
                    orderStatusFilter === f.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : dark
                      ? 'bg-zinc-800 text-zinc-300'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  dark
                    ? 'bg-zinc-800/80 border-zinc-700/60 text-white'
                    : 'bg-white border-slate-200 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded">
                        {ord.vehiclePlate}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                          ord.status === 'selesai'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : ord.status === 'menunggu_antrian'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {ord.status.replace('_', ' ')} ({ord.progressPercentage}%)
                      </span>
                    </div>

                    <h4 className="text-xs font-bold tracking-tight mt-1">
                      {ord.vehicleModel}
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      {ord.customerName} · {ord.timeSlot}
                    </p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                      {ord.packageName}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold">
                      Rp {ord.totalAmount.toLocaleString('id-ID')}
                    </span>
                    <span className="block text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                      {ord.paymentStatus} · {ord.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-100 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden mt-3">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${ord.progressPercentage}%` }}
                  />
                </div>

                {/* Admin Action Buttons */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-700/60 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      playIosTap();
                      onOpenReceipt(ord);
                    }}
                    className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-[11px] font-medium"
                  >
                    Buka Struk Digital
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAdvanceOrderStatus(ord)}
                    className="py-1 px-3 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-500 cupertino-press"
                  >
                    {ord.status === 'menunggu_antrian'
                      ? 'Mulai Pengerjaan'
                      : ord.status === 'dicuci'
                      ? 'Masuk Detailing'
                      : ord.status === 'detailing'
                      ? 'Quality Control'
                      : ord.status === 'quality_check'
                      ? 'Tandai Selesai'
                      : 'Ulangi Status'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
