import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Car,
  CarFront,
  Truck,
  Sparkles,
  Check,
  Calendar,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  QrCode,
  Smartphone,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  VehicleSize,
  ServicePackage,
  ServiceAddOn,
  PaymentMethod,
  BookingOrder,
  LoyaltyProfile,
} from '../../types';
import { VEHICLE_TYPES, SERVICE_ADDONS, TIME_SLOTS } from '../../data/mockData';
import { playIosTap, playPaymentSuccessSound, playIosNotification } from '../../utils/audio';

interface BookingTabProps {
  packages: ServicePackage[];
  selectedPackage?: ServicePackage | null;
  loyalty: LoyaltyProfile;
  onCreateBooking: (newOrder: BookingOrder) => void;
  onOpenReceipt: (order: BookingOrder) => void;
  onNavigateToTracking: () => void;
  dark?: boolean;
}

export const BookingTab: React.FC<BookingTabProps> = ({
  packages,
  selectedPackage,
  loyalty,
  onCreateBooking,
  onOpenReceipt,
  onNavigateToTracking,
  dark = false,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<VehicleSize>('compact');
  const [chosenPackage, setChosenPackage] = useState<ServicePackage>(
    selectedPackage || packages[1] || packages[0]
  );
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Dates: Next 5 days
  const today = new Date();
  const availableDates = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
    ];
    return {
      iso: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Hari Ini' : dayNames[d.getDay()],
      dateNumber: d.getDate(),
      month: monthNames[d.getMonth()],
    };
  });

  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0].iso);
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[1]);

  // Form Details
  const [customerName, setCustomerName] = useState(loyalty.name || 'Rian Hendrawan');
  const [customerPhone, setCustomerPhone] = useState(loyalty.phone || '0812-9844-3321');
  const [vehiclePlate, setVehiclePlate] = useState('B 1889 RFS');
  const [vehicleModel, setVehicleModel] = useState('Porsche 911 Carrera');
  const [vehicleColor, setVehicleColor] = useState('Gentian Blue Metallic');
  const [notes, setNotes] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentCompleteOrder, setPaymentCompleteOrder] = useState<BookingOrder | null>(null);

  // Price calculations
  const currentVehicleType = VEHICLE_TYPES.find((v) => v.id === selectedSize)!;
  const packageBasePrice = chosenPackage.priceBase;
  const packageCalculatedPrice = Math.round(packageBasePrice * currentVehicleType.priceMultiplier);

  const addonsTotalPrice = selectedAddons.reduce((acc, id) => {
    const addon = SERVICE_ADDONS.find((a) => a.id === id);
    return acc + (addon ? addon.price : 0);
  }, 0);

  const subtotal = packageCalculatedPrice + addonsTotalPrice;
  // Loyalty member discount (e.g. 50.000 for Gold)
  const discount = loyalty.tier === 'Platinum' ? 100000 : loyalty.tier === 'Gold' ? 50000 : 25000;
  const tax = Math.round((subtotal - discount) * 0.11);
  const totalAmount = Math.max(0, subtotal - discount + tax);

  const toggleAddon = (id: string) => {
    playIosTap();
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNextStep = () => {
    playIosTap();
    if (step < 6) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    playIosTap();
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const triggerPaymentSuccess = () => {
    setIsProcessingPayment(true);
    playIosTap();

    setTimeout(() => {
      playPaymentSuccessSound();
      playIosNotification();

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      const newBooking: BookingOrder = {
        id: `GL-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName,
        customerPhone,
        vehiclePlate: vehiclePlate.toUpperCase(),
        vehicleModel,
        vehicleSize: selectedSize,
        vehicleColor: vehicleColor || 'Hitam Glossy',
        packageId: chosenPackage.id,
        packageName: chosenPackage.name,
        addOnIds: selectedAddons,
        bookingDate: selectedDate,
        timeSlot: selectedSlot,
        bayId: 'bay-3',
        bayName: chosenPackage.category === 'coating' ? 'Coating Studio Alpha (Hex-LED)' : 'Cuci Hidrolik Bay 1',
        status: 'menunggu_antrian',
        paymentStatus: 'lunas',
        paymentMethod,
        subtotal,
        discount,
        tax,
        totalAmount,
        notes,
        createdAt: new Date().toISOString(),
        progressPercentage: 10,
        technicianName: chosenPackage.category === 'coating' ? 'Bagus Pratama (Master Detailer)' : 'Deni Setiawan',
        inspectionSteps: [
          {
            id: 'step-1',
            title: 'Reservasi Diterima & Terjadwal',
            description: `Slot berhasil dipesan untuk ${selectedDate} pukul ${selectedSlot}.`,
            completed: true,
            time: 'Baru saja',
          },
          {
            id: 'step-2',
            title: 'Inspeksi & Cuci Bodi / Kolong',
            description: 'Pembersihan bodi dengan foam pH-netral dan semprot sasis.',
            completed: false,
          },
          {
            id: 'step-3',
            title: 'Pengerjaan Layanan Utama',
            description: chosenPackage.tagline,
            completed: false,
          },
          {
            id: 'step-4',
            title: 'Quality Check & Serah Terima',
            description: 'Inspeksi pencahayaan LED dan wewangian interior.',
            completed: false,
          },
        ],
      };

      onCreateBooking(newBooking);
      setPaymentCompleteOrder(newBooking);
      setIsProcessingPayment(false);
    }, 1200);
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Top Header & Breadcrumb Step Indicator */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2">
          {step > 1 && !paymentCompleteOrder ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 cupertino-press"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
          ) : (
            <span className="text-[11px] font-semibold tracking-wide uppercase text-blue-500">
              SISTEM RESERVASI JADWAL
            </span>
          )}

          <span className="text-xs font-medium text-zinc-400">
            {paymentCompleteOrder ? 'Selesai' : `Langkah ${step} dari 6`}
          </span>
        </div>

        {/* Progress step bar */}
        {!paymentCompleteOrder && (
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* SUCCESS SCREEN */}
      {paymentCompleteOrder ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
              Pembayaran Berhasil Diverifikasi
            </span>
            <h3 className="text-xl font-bold tracking-tight mt-1">
              Reservasi Anda Telah Dikonfirmasi!
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              ID Booking: <strong className="font-mono text-slate-800 dark:text-zinc-200">{paymentCompleteOrder.id}</strong>. Tim GlossLab siap menyambut kedatangan Anda.
            </p>
          </div>

          {/* Booking Summary Ticket */}
          <div
            className={`p-4 rounded-2xl border text-left text-xs space-y-2 ${
              dark
                ? 'bg-zinc-800/90 border-zinc-700/80 text-white'
                : 'bg-white border-slate-200 text-slate-900 shadow-sm'
            }`}
          >
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-700">
              <span className="text-zinc-400">Jadwal Kedatangan</span>
              <span className="font-semibold">{paymentCompleteOrder.bookingDate} · {paymentCompleteOrder.timeSlot}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Kendaraan</span>
              <span className="font-bold">{paymentCompleteOrder.vehiclePlate} ({paymentCompleteOrder.vehicleModel})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Paket</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">{paymentCompleteOrder.packageName}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-zinc-200 dark:border-zinc-700 font-bold">
              <span>Total Lunas</span>
              <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                Rp {paymentCompleteOrder.totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => {
                playIosTap();
                onNavigateToTracking();
              }}
              className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-semibold text-sm shadow-md hover:bg-blue-500 cupertino-press"
            >
              Pantau Status Pengerjaan Real-Time
            </button>

            <button
              type="button"
              onClick={() => {
                playIosTap();
                onOpenReceipt(paymentCompleteOrder);
              }}
              className={`w-full py-3 rounded-2xl text-xs font-semibold border transition-colors cupertino-press ${
                dark
                  ? 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
                  : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Lihat & Bagikan Struk Resmi
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* STEP 1: VEHICLE TYPE */}
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold tracking-tight">Pilih Tipe Kendaraan</h3>
                <p className="text-xs text-zinc-500">
                  Dimensi kendaraan mempengaruhi volume bahan sampo & lama pengerjaan
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {VEHICLE_TYPES.map((type) => {
                  const isSelected = selectedSize === type.id;
                  return (
                    <div
                      key={type.id}
                      onClick={() => {
                        playIosTap();
                        setSelectedSize(type.id);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all cupertino-press flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/30 text-blue-950 dark:text-blue-100 ring-2 ring-blue-500/20'
                          : dark
                          ? 'bg-zinc-800/80 border-zinc-700/70 text-zinc-200'
                          : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : dark
                              ? 'bg-zinc-700 text-zinc-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {type.id === 'compact' && <Car className="w-5 h-5" />}
                          {type.id === 'medium' && <CarFront className="w-5 h-5" />}
                          {type.id === 'large' && <Truck className="w-5 h-5" />}
                          {type.id === 'luxury' && <Sparkles className="w-5 h-5" />}
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold leading-tight">{type.name}</h4>
                        <p className="text-[10px] text-zinc-500 line-clamp-2 mt-1">
                          {type.examples}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 text-[10px] text-zinc-400">
                        Multiplier: {type.priceMultiplier}x
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: SERVICE PACKAGE */}
          {step === 2 && (
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold tracking-tight">Pilih Paket Salon & Cuci</h3>
                <p className="text-xs text-zinc-500">
                  Estimasi harga untuk tipe: <strong className="text-blue-600">{currentVehicleType.name}</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {packages.map((pkg) => {
                  const isSelected = chosenPackage.id === pkg.id;
                  const price = Math.round(pkg.priceBase * currentVehicleType.priceMultiplier);

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => {
                        playIosTap();
                        setChosenPackage(pkg);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all cupertino-press ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                          : dark
                          ? 'bg-zinc-800/80 border-zinc-700/70'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-zinc-200">
                          <img
                            src={pkg.image}
                            alt={pkg.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="text-xs font-bold tracking-tight">{pkg.name}</h4>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 ml-1">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                            {pkg.tagline}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-zinc-400">
                              ⏱️ {pkg.durationMinutes} Menit
                            </span>
                            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                              Rp {price.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Feature check pill preview if selected */}
                      {isSelected && (
                        <div className="mt-3 pt-2.5 border-t border-blue-200/50 dark:border-blue-900/50 space-y-1">
                          {pkg.features.slice(0, 3).map((feat, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-300">
                              <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: ADD-ONS */}
          {step === 3 && (
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold tracking-tight">Add-on Ekstra (Opsional)</h3>
                <p className="text-xs text-zinc-500">
                  Tingkatkan kenyamanan dan proteksi bagian mobil tertentu
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {SERVICE_ADDONS.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);

                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all cupertino-press flex items-center justify-between ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30'
                          : dark
                          ? 'bg-zinc-800/80 border-zinc-700/70'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border ${
                            isChecked
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : dark
                              ? 'border-zinc-600 bg-zinc-700'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div>
                          <h4 className="text-xs font-bold leading-tight">{addon.name}</h4>
                          <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
                            {addon.description}
                          </p>
                          <span className="text-[10px] text-zinc-400 mt-1 inline-block">
                            +{addon.durationMinutes} Menit pengerjaan
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-2">
                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                          +Rp {addon.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: DATE & TIME */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold tracking-tight">Pilih Jadwal Kedatangan</h3>
                <p className="text-xs text-zinc-500">Pilih tanggal dan slot waktu pengerjaan</p>
              </div>

              {/* Horizontal Date Picker */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {availableDates.map((item) => {
                  const isDateSelected = selectedDate === item.iso;
                  return (
                    <button
                      key={item.iso}
                      type="button"
                      onClick={() => {
                        playIosTap();
                        setSelectedDate(item.iso);
                      }}
                      className={`flex flex-col items-center justify-center min-w-[62px] py-2.5 px-2 rounded-2xl border transition-all cupertino-press ${
                        isDateSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : dark
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                      }`}
                    >
                      <span className="text-[10px] font-medium opacity-80">{item.dayName}</span>
                      <span className="text-base font-bold my-0.5 tabular-nums">{item.dateNumber}</span>
                      <span className="text-[9px] uppercase font-semibold opacity-70">{item.month}</span>
                    </button>
                  );
                })}
              </div>

              {/* Time Slots */}
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-2">
                  Pilih Jam (Slot Kuota Bay)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot, idx) => {
                    const isSlotSelected = selectedSlot === slot;
                    const isBusy = idx === 0; // Simulate 1 full slot
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          playIosTap();
                          setSelectedSlot(slot);
                        }}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-all cupertino-press ${
                          isBusy
                            ? 'opacity-40 cursor-not-allowed bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                            : isSlotSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : dark
                            ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-mono tabular-nums">{slot}</span>
                        <span className="text-[10px] opacity-80">
                          {isBusy ? 'Penuh' : 'Tersedia'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: VEHICLE & CUSTOMER DETAILS */}
          {step === 5 && (
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold tracking-tight">Detail Kendaraan & Pemesan</h3>
                <p className="text-xs text-zinc-500">
                  Data ini digunakan teknisi untuk check-in dan serah terima
                </p>
              </div>

              {/* Indonesian License Plate Badge */}
              <div className="flex justify-center my-1">
                <div className="bg-black text-white px-5 py-2 rounded-xl border-2 border-zinc-600 shadow-md font-mono font-bold tracking-widest text-base flex items-center gap-2">
                  <span>{vehiclePlate || 'B 1234 SFE'}</span>
                  <span className="text-[9px] text-zinc-400 tracking-normal border-l border-zinc-600 pl-2">
                    11·28
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="font-semibold block mb-1 text-zinc-600 dark:text-zinc-300">
                    Nomor Plat Kendaraan *
                  </label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                    placeholder="Contoh: B 1889 RFS"
                    className={`w-full p-2.5 rounded-xl border font-mono uppercase tracking-wider text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      dark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold block mb-1 text-zinc-600 dark:text-zinc-300">
                      Merk & Model Mobil *
                    </label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="Contoh: Honda Civic RS"
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                        dark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1 text-zinc-600 dark:text-zinc-300">
                      Warna Cat
                    </label>
                    <input
                      type="text"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      placeholder="Contoh: Putih Pearl"
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                        dark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold block mb-1 text-zinc-600 dark:text-zinc-300">
                      Nama Pemesan
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                        dark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1 text-zinc-600 dark:text-zinc-300">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                        dark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-zinc-600 dark:text-zinc-300">
                    Catatan Khusus untuk Teknisi (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Bagian karpet bagasi mohon di-steam ekstra, ada bekas tumpahan susu."
                    className={`w-full p-2.5 rounded-xl border text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      dark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: DIGITAL PAYMENT CHECKOUT */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold tracking-tight">Pembayaran Digital Instan</h3>
                <p className="text-xs text-zinc-500">
                  Transaksi aman terenkripsi dengan QRIS & E-Wallet resmi
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Order Breakdown Card */}
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-2 h-fit ${
                    dark
                      ? 'bg-zinc-800/80 border-zinc-700/70 text-white'
                      : 'bg-white border-slate-200 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-700">
                    <div>
                      <p className="font-bold">{chosenPackage.name}</p>
                      <p className="text-[11px] text-zinc-400">
                        {vehiclePlate} · {currentVehicleType.name}
                      </p>
                    </div>
                    <span className="font-mono font-semibold">
                      Rp {packageCalculatedPrice.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {addonsTotalPrice > 0 && (
                    <div className="flex justify-between text-zinc-500 text-[11px]">
                      <span>Add-ons ({selectedAddons.length} item)</span>
                      <span className="font-mono">+Rp {addonsTotalPrice.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-emerald-500 text-[11px]">
                    <span>Voucher Diskon {loyalty.tier} VIP</span>
                    <span className="font-mono">-Rp {discount.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex justify-between text-zinc-500 text-[11px]">
                    <span>PPN (11%)</span>
                    <span className="font-mono">+Rp {tax.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-zinc-200 dark:border-zinc-700 font-bold text-sm">
                    <span>TOTAL PEMBAYARAN</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">
                      Rp {totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-2">
                    Metode Pembayaran Digital
                  </label>

                <div className="space-y-2">
                  {/* QRIS */}
                  <div
                    onClick={() => {
                      playIosTap();
                      setPaymentMethod('qris');
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all cupertino-press flex items-center justify-between ${
                      paymentMethod === 'qris'
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                        : dark
                        ? 'bg-zinc-800/80 border-zinc-700/60'
                        : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center font-bold text-xs">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold">QRIS Dinamis</h4>
                          <span className="text-[9px] bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 font-bold px-1.5 py-0.2 rounded">
                            Instan
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500">
                          Scan via BCA, Mandiri, GoPay, OVO, ShopeePay
                        </p>
                      </div>
                    </div>
                    {paymentMethod === 'qris' && (
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* E-Wallets */}
                  <div
                    onClick={() => {
                      playIosTap();
                      setPaymentMethod('gopay');
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all cupertino-press flex items-center justify-between ${
                      paymentMethod === 'gopay'
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                        : dark
                        ? 'bg-zinc-800/80 border-zinc-700/60'
                        : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center font-bold text-xs">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold">E-Wallet (GoPay / DANA / OVO)</h4>
                        <p className="text-[11px] text-zinc-500">Direct debit tanpa biaya admin</p>
                      </div>
                    </div>
                    {paymentMethod === 'gopay' && (
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Virtual Account BCA */}
                  <div
                    onClick={() => {
                      playIosTap();
                      setPaymentMethod('bca_va');
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all cupertino-press flex items-center justify-between ${
                      paymentMethod === 'bca_va'
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                        : dark
                        ? 'bg-zinc-800/80 border-zinc-700/60'
                        : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold">BCA Virtual Account</h4>
                        <p className="text-[11px] text-zinc-500">Verifikasi otomatis 24 jam</p>
                      </div>
                    </div>
                    {paymentMethod === 'bca_va' && (
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Apple Pay */}
                  <div
                    onClick={() => {
                      playIosTap();
                      setPaymentMethod('apple_pay');
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all cupertino-press flex items-center justify-between ${
                      paymentMethod === 'apple_pay'
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                        : dark
                        ? 'bg-zinc-800/80 border-zinc-700/60'
                        : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs">
                        
                      </div>
                      <div>
                        <h4 className="text-xs font-bold">Apple Pay</h4>
                        <p className="text-[11px] text-zinc-500">One-tap Face ID checkout</p>
                      </div>
                    </div>
                    {paymentMethod === 'apple_pay' && (
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* QRIS Interactive Box if QRIS chosen */}
                {paymentMethod === 'qris' && (
                    <div
                      className={`p-4 rounded-2xl border text-center space-y-2.5 mt-3 ${
                        dark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                        QRIS RESMI GLOSSLAB AUTO
                      </span>
                      {/* Generated QR Code preview */}
                      <div className="w-36 h-36 mx-auto bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                        <div className="w-full h-full border-2 border-black p-1 flex flex-col justify-between">
                          <div className="flex justify-between">
                            <div className="w-6 h-6 bg-black p-1">
                              <div className="w-full h-full bg-white p-0.5">
                                <div className="w-full h-full bg-black" />
                              </div>
                            </div>
                            <div className="w-6 h-6 bg-black p-1">
                              <div className="w-full h-full bg-white p-0.5">
                                <div className="w-full h-full bg-black" />
                              </div>
                            </div>
                          </div>
                          <div className="text-[8px] font-mono font-bold text-black tracking-widest text-center">
                            GLOSSLAB QRIS
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="w-6 h-6 bg-black p-1">
                              <div className="w-full h-full bg-white p-0.5">
                                <div className="w-full h-full bg-black" />
                              </div>
                            </div>
                            <div className="w-4 h-4 bg-black" />
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        Scan via BCA, Mandiri, GoPay, OVO, ShopeePay
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sticky Bottom Next / Submit Button */}
          <div className="pt-3">
            {step < 6 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-semibold text-xs shadow-md flex items-center justify-center gap-2 hover:bg-blue-500 cupertino-press"
              >
                <span>Lanjut ke Langkah {step + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={triggerPaymentSuccess}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 hover:bg-emerald-500 disabled:opacity-50 cupertino-press"
              >
                {isProcessingPayment ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Pembayaran...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi & Bayar Rp {totalAmount.toLocaleString('id-ID')}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
