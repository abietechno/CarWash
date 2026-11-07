/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Home,
  Calendar,
  Sparkles,
  Award,
  ShieldCheck,
  Moon,
  Sun,
  Droplets,
} from 'lucide-react';
import { IosDynamicIsland } from './components/common/IosDynamicIsland';
import { IosNotificationBanner, IosNotification } from './components/common/IosNotificationBanner';
import { ReceiptModal } from './components/common/ReceiptModal';
import { HomeTab } from './components/tabs/HomeTab';
import { BookingTab } from './components/tabs/BookingTab';
import { TrackingTab } from './components/tabs/TrackingTab';
import { LoyaltyTab } from './components/tabs/LoyaltyTab';
import { AdminTab } from './components/tabs/AdminTab';
import {
  SERVICE_PACKAGES,
  INITIAL_BOOKINGS,
  INITIAL_BAYS,
  INITIAL_REVIEWS,
  INITIAL_LOYALTY,
} from './data/mockData';
import {
  BookingOrder,
  ServicePackage,
  CustomerReview,
  LoyaltyProfile,
  BayMonitor,
  BookingStatus,
} from './types';
import { playIosTap, playIosNotification } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'booking' | 'tracking' | 'loyalty' | 'admin'>('home');
  const [darkTheme, setDarkTheme] = useState<boolean>(false);

  // Core App Data
  const [orders, setOrders] = useState<BookingOrder[]>(INITIAL_BOOKINGS);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(INITIAL_BOOKINGS[0].id);
  const [selectedPackageForBooking, setSelectedPackageForBooking] = useState<ServicePackage | null>(null);
  const [bays, setBays] = useState<BayMonitor[]>(INITIAL_BAYS);
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [loyalty, setLoyalty] = useState<LoyaltyProfile>(INITIAL_LOYALTY);

  // Notification Banner
  const [activeNotification, setActiveNotification] = useState<IosNotification | null>(null);

  // Receipt Modal
  const [receiptOrder, setReceiptOrder] = useState<BookingOrder | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Sync theme with document element
  useEffect(() => {
    if (darkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkTheme]);

  // Initial welcome notification
  useEffect(() => {
    const timer = setTimeout(() => {
      showNotification(
        'Pengerjaan Porsche 911',
        'Tahap 3 Paint Correction sedang berjalan di Booth 1 Hex-LED.'
      );
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const showNotification = (title: string, body: string) => {
    playIosNotification();
    setActiveNotification({
      id: `notif-${Date.now()}`,
      title,
      body,
      time: 'baru saja',
    });
  };

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0] || null;

  // Handlers
  const handleCreateBooking = (newOrder: BookingOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    setSelectedOrderId(newOrder.id);
    handleAddStamp();
    showNotification(
      'Reservasi Berhasil!',
      `${newOrder.vehiclePlate} (${newOrder.vehicleModel}) telah dijadwalkan.`
    );
  };

  const handleUpdateOrderStatus = (orderId: string, nextStepIndex: number) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const updatedSteps = order.inspectionSteps.map((step, idx) => {
          if (idx <= nextStepIndex) {
            return {
              ...step,
              completed: true,
              time: step.time || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            };
          }
          return step;
        });

        const isAllDone = nextStepIndex >= order.inspectionSteps.length - 1;
        const progress = Math.min(100, Math.round(((nextStepIndex + 1) / order.inspectionSteps.length) * 100));
        const newStatus: BookingStatus = isAllDone
          ? 'selesai'
          : nextStepIndex >= 2
          ? 'quality_check'
          : nextStepIndex >= 1
          ? 'detailing'
          : 'dicuci';

        return {
          ...order,
          status: newStatus,
          progressPercentage: progress,
          inspectionSteps: updatedSteps,
        };
      })
    );

    const targetOrder = orders.find((o) => o.id === orderId);
    showNotification(
      'Update Pengerjaan Studio',
      `${targetOrder?.vehiclePlate}: Tahap telah diperbarui oleh master detailer.`
    );
  };

  const handleAdminUpdateOrderStatus = (orderId: string, newStatus: BookingStatus, progress: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, progressPercentage: progress } : o))
    );
    const targetOrder = orders.find((o) => o.id === orderId);
    showNotification(
      'Status Kendaraan Berubah',
      `${targetOrder?.vehiclePlate} kini berstatus: ${newStatus.replace('_', ' ').toUpperCase()}`
    );
  };

  const handleUpdateBayStatus = (bayId: string, newStatus: 'tersedia' | 'pengerjaan' | 'maintenance') => {
    setBays((prev) =>
      prev.map((b) =>
        b.id === bayId
          ? {
              ...b,
              status: newStatus,
              currentVehicle: newStatus === 'tersedia' ? 'Siap menerima mobil' : 'Honda HR-V (Antrian)',
            }
          : b
      )
    );
  };

  const handleAddStamp = () => {
    setLoyalty((prev) => {
      const nextStamp = prev.stamps + 1;
      if (nextStamp >= 5) {
        showNotification(
          '🎉 Voucher Gratis Didapatkan!',
          'Anda telah mengumpulkan 5 stamp! 1x Cuci Signature Gratis siap diklaim.'
        );
        return {
          ...prev,
          stamps: 0,
          freeWashAvailable: prev.freeWashAvailable + 1,
          points: prev.points + 150,
          totalWashesCompleted: prev.totalWashesCompleted + 1,
        };
      }
      showNotification(
        'Stamp Loyalitas Ditambahkan',
        `Stamp ke-${nextStamp} dari 5 berhasil dicap. Sisa ${5 - nextStamp} lagi untuk reward.`
      );
      return {
        ...prev,
        stamps: nextStamp,
        points: prev.points + 50,
        totalWashesCompleted: prev.totalWashesCompleted + 1,
      };
    });
  };

  const handleAddReview = (newReview: CustomerReview) => {
    setReviews((prev) => [newReview, ...prev]);
    setLoyalty((prev) => ({
      ...prev,
      points: prev.points + 100,
    }));
    showNotification(
      'Ulasan Diterbitkan (+100 Poin)',
      'Terima kasih atas ulasan berharga Anda untuk teknisi GlossLab!'
    );
  };

  const handleOpenReceipt = (order: BookingOrder) => {
    setReceiptOrder(order);
    setIsReceiptOpen(true);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        darkTheme ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Clean Responsive Top Navigation Bar (Mobile, Tablet & PC) */}
      <header className="sticky top-0 z-40 w-full cupertino-blur bg-white/85 dark:bg-zinc-950/85 border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <div
            onClick={() => {
              playIosTap();
              setActiveTab('home');
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Droplets className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight">GLOSSLAB</span>
                <span className="text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.2 rounded">
                  Studio
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 -mt-0.5 hidden sm:block">
                Cuci Mobil Hidrolik & Auto Detailing
              </p>
            </div>
          </div>

          {/* Zone 3: Active Order Dynamic Island Pill & Quick Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Dynamic Island: compact trigger */}
            <IosDynamicIsland
              activeOrder={activeOrder}
              onOpenTracking={() => {
                playIosTap();
                setActiveTab('tracking');
              }}
            />

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => {
                playIosTap();
                setDarkTheme((prev) => !prev);
              }}
              className={`p-2 rounded-xl border transition-colors cupertino-press ${
                darkTheme
                  ? 'bg-zinc-800 border-zinc-700 text-amber-400 hover:bg-zinc-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
              }`}
              title="Ganti Mode Terang / Gelap"
            >
              {darkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* iOS Notification Dropdown Banner */}
      <IosNotificationBanner
        notification={activeNotification}
        onDismiss={() => setActiveNotification(null)}
        onTap={() => setActiveTab('tracking')}
        dark={darkTheme}
      />

      {/* Main Content Viewport: Fully Responsive across HP, Tablet, and PC */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 pb-28 md:pb-32">
        {activeTab === 'home' && (
          <HomeTab
            packages={SERVICE_PACKAGES}
            activeOrder={activeOrder}
            loyalty={loyalty}
            bays={bays}
            onSelectPackageForBooking={(pkg) => {
              setSelectedPackageForBooking(pkg);
              setActiveTab('booking');
            }}
            onNavigateToTab={(tab) => {
              playIosTap();
              setActiveTab(tab);
            }}
            dark={darkTheme}
          />
        )}

        {activeTab === 'booking' && (
          <BookingTab
            packages={SERVICE_PACKAGES}
            selectedPackage={selectedPackageForBooking}
            loyalty={loyalty}
            onCreateBooking={handleCreateBooking}
            onOpenReceipt={handleOpenReceipt}
            onNavigateToTracking={() => setActiveTab('tracking')}
            dark={darkTheme}
          />
        )}

        {activeTab === 'tracking' && (
          <TrackingTab
            orders={orders}
            selectedOrderId={selectedOrderId}
            onSelectOrder={(id) => setSelectedOrderId(id)}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenReceipt={handleOpenReceipt}
            dark={darkTheme}
          />
        )}

        {activeTab === 'loyalty' && (
          <LoyaltyTab
            loyalty={loyalty}
            reviews={reviews}
            onAddStamp={handleAddStamp}
            onAddReview={handleAddReview}
            dark={darkTheme}
          />
        )}

        {activeTab === 'admin' && (
          <AdminTab
            orders={orders}
            bays={bays}
            onUpdateOrderStatus={handleAdminUpdateOrderStatus}
            onUpdateBayStatus={handleUpdateBayStatus}
            onOpenReceipt={handleOpenReceipt}
            dark={darkTheme}
          />
        )}
      </main>

      {/* Sticky Bottom Tab Bar (Stays pinned at bottom with prominent elevation shadow when scrolling) */}
      <nav
        aria-label="Navigasi Bawah Utama"
        className={`fixed bottom-0 left-0 right-0 z-50 w-full cupertino-blur border-t transition-all select-none shadow-[0_-8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.65)] ${
          darkTheme
            ? 'bg-zinc-950/95 border-zinc-800/90 text-zinc-400'
            : 'bg-white/95 border-slate-200/90 text-slate-500'
        }`}
      >
        <div className="max-w-2xl mx-auto px-3 sm:px-6 pt-2 pb-3 sm:pb-3.5 flex items-center justify-between gap-1">
          {/* Home */}
          <button
            type="button"
            onClick={() => {
              playIosTap();
              setActiveTab('home');
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cupertino-press ${
              activeTab === 'home'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${activeTab === 'home' ? 'bg-blue-50 dark:bg-blue-950/50' : ''}`}>
              <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            </div>
            <span className="text-[10px] sm:text-[11px] tracking-tight mt-0.5">Beranda</span>
          </button>

          {/* Booking */}
          <button
            type="button"
            onClick={() => {
              playIosTap();
              setActiveTab('booking');
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cupertino-press relative ${
              activeTab === 'booking'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${activeTab === 'booking' ? 'bg-blue-50 dark:bg-blue-950/50' : ''}`}>
              <Calendar className={`w-5 h-5 ${activeTab === 'booking' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            </div>
            <span className="text-[10px] sm:text-[11px] tracking-tight mt-0.5">Reservasi</span>
          </button>

          {/* Live Tracking */}
          <button
            type="button"
            onClick={() => {
              playIosTap();
              setActiveTab('tracking');
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cupertino-press relative ${
              activeTab === 'tracking'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <div className={`relative p-1 rounded-xl transition-colors ${activeTab === 'tracking' ? 'bg-blue-50 dark:bg-blue-950/50' : ''}`}>
              <Sparkles className={`w-5 h-5 ${activeTab === 'tracking' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              {activeOrder && activeOrder.status !== 'selesai' && (
                <span className="absolute 0 top-0.5 right-0.5 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] tracking-tight mt-0.5">Live Status</span>
          </button>

          {/* Loyalty & Reviews */}
          <button
            type="button"
            onClick={() => {
              playIosTap();
              setActiveTab('loyalty');
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cupertino-press relative ${
              activeTab === 'loyalty'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${activeTab === 'loyalty' ? 'bg-blue-50 dark:bg-blue-950/50' : ''}`}>
              <Award className={`w-5 h-5 ${activeTab === 'loyalty' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            </div>
            <span className="text-[10px] sm:text-[11px] tracking-tight mt-0.5">Loyalitas</span>
          </button>

          {/* Admin Console */}
          <button
            type="button"
            onClick={() => {
              playIosTap();
              setActiveTab('admin');
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cupertino-press relative ${
              activeTab === 'admin'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${activeTab === 'admin' ? 'bg-blue-50 dark:bg-blue-950/50' : ''}`}>
              <ShieldCheck className={`w-5 h-5 ${activeTab === 'admin' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            </div>
            <span className="text-[10px] sm:text-[11px] tracking-tight mt-0.5">Admin</span>
          </button>
        </div>
      </nav>

      {/* Global Digital Receipt Modal */}
      <ReceiptModal
        order={receiptOrder}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        dark={darkTheme}
      />
    </div>
  );
}
