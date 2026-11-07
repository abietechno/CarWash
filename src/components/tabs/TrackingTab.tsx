import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  Phone,
  Camera,
  FileText,
  RotateCw,
  AlertCircle,
  Shield,
  Layers,
} from 'lucide-react';
import { BookingOrder, InspectionStep } from '../../types';
import { playIosTap, playIosNotification } from '../../utils/audio';

interface TrackingTabProps {
  orders: BookingOrder[];
  selectedOrderId?: string;
  onSelectOrder: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, nextStageStep: number) => void;
  onOpenReceipt: (order: BookingOrder) => void;
  dark?: boolean;
}

export const TrackingTab: React.FC<TrackingTabProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  onUpdateOrderStatus,
  onOpenReceipt,
  dark = false,
}) => {
  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];
  const [photoModalUrl, setPhotoModalUrl] = useState<string | null>(null);

  if (!activeOrder) {
    return (
      <div className="text-center py-16 space-y-3">
        <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
          <Clock className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold">Belum Ada Kendaraan Dikerjakan</h3>
        <p className="text-xs text-zinc-500 max-w-xs mx-auto">
          Silakan buat reservasi cuci atau salon mobil terlebih dahulu di tab Booking.
        </p>
      </div>
    );
  }

  const steps = activeOrder.inspectionSteps || [];
  const currentStepIndex = steps.findIndex((s) => !s.completed);
  const activeStep = currentStepIndex !== -1 ? steps[currentStepIndex] : steps[steps.length - 1];

  const handleSimulateNextStep = () => {
    playIosTap();
    if (currentStepIndex !== -1) {
      onUpdateOrderStatus(activeOrder.id, currentStepIndex);
    } else {
      // Loop or re-activate
      onUpdateOrderStatus(activeOrder.id, 0);
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Top Header & Car Switcher */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold tracking-wide uppercase text-blue-500">
            LIVE TRACKING STUDIO
          </span>
          <span className="text-[11px] font-mono text-zinc-400">ID: {activeOrder.id}</span>
        </div>

        {/* Multi-vehicle picker if user has multiple bookings */}
        {orders.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-2">
            {orders.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  playIosTap();
                  onSelectOrder(o.id);
                }}
                className={`py-1.5 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all cupertino-press ${
                  o.id === activeOrder.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : dark
                    ? 'bg-zinc-800 text-zinc-300'
                    : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {o.vehiclePlate} · {o.vehicleModel.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Column: Vehicle Status & Action */}
        <div className="space-y-4">
          {/* Main Vehicle Status Card with Live Progress Ring */}
          <div
            className={`p-5 rounded-3xl border relative overflow-hidden ${
              dark
                ? 'bg-gradient-to-b from-zinc-800 to-zinc-900 border-zinc-700/80 text-white'
                : 'bg-white border-slate-200/90 text-slate-900 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                  <span>{activeOrder.bayName}</span>
                </div>
                <h3 className="text-base md:text-lg font-bold tracking-tight">{activeOrder.vehicleModel}</h3>
                <p className="text-xs font-mono font-medium text-zinc-400 tracking-wider">
                  {activeOrder.vehiclePlate} · {activeOrder.vehicleColor}
                </p>
              </div>

              {/* Radial progress badge */}
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-zinc-200 dark:text-zinc-700"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-600 transition-all duration-700"
                    strokeDasharray={`${activeOrder.progressPercentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs md:text-sm font-bold font-mono">
                  {activeOrder.progressPercentage}%
                </span>
              </div>
            </div>

            {/* Current Stage Indicator */}
            <div
              className={`mt-4 p-3.5 rounded-2xl border ${
                dark ? 'bg-zinc-800/60 border-zinc-700/60' : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-zinc-500">Tahap Sedang Berjalan:</span>
                <span className="font-mono text-[10px] text-zinc-400">
                  Est. Selesai: {activeOrder.timeSlot.split('-')[1]?.trim() || '15:00'}
                </span>
              </div>
              <h4 className="text-xs md:text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
                {activeStep ? activeStep.title : 'Semua Tahap Selesai'}
              </h4>
              <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5">
                {activeStep?.description}
              </p>
            </div>

            {/* Technician info strip */}
            <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  BP
                </div>
                <div>
                  <p className="font-semibold text-xs leading-none">{activeOrder.technicianName.split('(')[0]}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Master Detailer Bersertifikat</p>
                </div>
              </div>

              <a
                href="https://wa.me/6281288990011"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full cupertino-press"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Tanya Progres</span>
              </a>
            </div>
          </div>

          {/* Quick Action Simulation Button */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              dark ? 'bg-zinc-900 border-zinc-800' : 'bg-blue-50/70 border-blue-200/70'
            }`}
          >
            <div className="flex items-center gap-2 text-xs">
              <RotateCw className="w-4 h-4 text-blue-600 animate-spin" />
              <div>
                <p className="font-bold text-xs">Simulasi Pengerjaan</p>
                <p className="text-[10px] text-zinc-500">Klik untuk simulasikan update pengerjaan</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSimulateNextStep}
              className="py-1.5 px-3.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-500 cupertino-press"
            >
              {activeOrder.progressPercentage >= 100 ? 'Reset Alur' : 'Selesaikan Tahap'}
            </button>
          </div>

          {/* Struk Digital Button */}
          <button
            type="button"
            onClick={() => {
              playIosTap();
              onOpenReceipt(activeOrder);
            }}
            className={`w-full py-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 cupertino-press ${
              dark
                ? 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-500" />
            <span>Lihat Struk Digital & Bukti Bayar</span>
          </button>
        </div>

        {/* Right Column: Step-by-Step Inspection Timeline */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold tracking-tight">Timeline Pengerjaan Real-Time</h3>

          <div className="space-y-2.5">
            {steps.map((step, idx) => {
              const isCompleted = step.completed;
              const isCurrent = !step.completed && (idx === 0 || steps[idx - 1].completed);

              return (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                      : isCompleted
                      ? dark
                        ? 'bg-zinc-800/80 border-zinc-700/60'
                        : 'bg-white border-slate-200/80'
                      : dark
                      ? 'bg-zinc-900/50 border-zinc-800 text-zinc-500'
                      : 'bg-slate-50 border-slate-200/50 text-slate-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Step status icon */}
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center animate-pulse">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                            dark ? 'border-zinc-700 text-zinc-600' : 'border-slate-300 text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4
                          className={`text-xs md:text-sm font-bold leading-tight ${
                            isCompleted
                              ? 'text-slate-900 dark:text-white'
                              : isCurrent
                              ? 'text-blue-600 dark:text-blue-400'
                              : ''
                          }`}
                        >
                          {step.title}
                        </h4>
                        {step.time && (
                          <span className="text-[10px] font-mono text-zinc-400 ml-2 shrink-0">
                            {step.time}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-zinc-500 mt-0.5">{step.description}</p>

                      {/* Technician note */}
                      {step.technicianNote && (
                        <div
                          className={`mt-2 p-2 rounded-xl text-[10px] leading-relaxed border ${
                            dark
                              ? 'bg-zinc-900/90 border-zinc-700 text-zinc-300'
                              : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            Catatan Teknisi:{' '}
                          </span>
                          {step.technicianNote}
                        </div>
                      )}

                      {/* Inspection photo thumbnail */}
                      {step.photo && (
                        <div className="mt-2 flex items-center gap-2">
                          <div
                            onClick={() => setPhotoModalUrl(step.photo!)}
                            className="relative w-20 h-14 rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 cursor-pointer hover:opacity-90 transition-opacity"
                          >
                            <img
                              src={step.photo}
                              alt="Inspection"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Camera className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-400">
                            Foto bukti inspeksi pengerjaan
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Photo Preview Modal */}
      {photoModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={() => setPhotoModalUrl(null)}
        >
          <div className="max-w-md w-full bg-zinc-900 rounded-3xl overflow-hidden p-2">
            <img
              src={photoModalUrl}
              alt="Live Inspection"
              className="w-full h-auto rounded-2xl object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="p-3 text-center text-white">
              <p className="text-xs font-semibold">Foto Dokumentasi Pengerjaan Studio</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Ketuk di mana saja untuk menutup</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
