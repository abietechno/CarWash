import React, { useState } from 'react';
import { CheckCircle2, Share2, Printer, Check } from 'lucide-react';
import { BookingOrder } from '../../types';
import { IosBottomSheet } from './IosBottomSheet';
import { playIosTap } from '../../utils/audio';

interface ReceiptModalProps {
  order: BookingOrder | null;
  isOpen: boolean;
  onClose: () => void;
  dark?: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
  dark = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const handleShare = () => {
    playIosTap();
    const text = `*STRUK DIGITAL GLOSSLAB STUDIO*\nNo: ${order.id}\nKendaraan: ${order.vehicleModel} (${order.vehiclePlate})\nLayanan: ${order.packageName}\nTotal: Rp ${order.totalAmount.toLocaleString('id-ID')}\nStatus: LUNAS ✅`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    playIosTap();
    window.print();
  };

  return (
    <IosBottomSheet isOpen={isOpen} onClose={onClose} title="Struk Transaksi Digital" dark={dark}>
      <div className="space-y-4">
        {/* Receipt card with paper serrated edge feel */}
        <div
          className={`p-5 rounded-2xl border ${
            dark
              ? 'bg-zinc-800/80 border-zinc-700/80 text-white'
              : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}
        >
          {/* Header */}
          <div className="text-center pb-4 border-b border-dashed border-zinc-300 dark:border-zinc-700">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold tracking-tight">GLOSSLAB AUTO STUDIO</h4>
            <p className="text-[11px] text-zinc-500">
              Jl. Boulevard Artha Gading No. 88, Jakarta Utara
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              WhatsApp CS: 0812-8899-0011 · NPWP: 03.948.112.4-012.000
            </p>
          </div>

          {/* Meta Info */}
          <div className="py-3 text-xs space-y-1.5 border-b border-dashed border-zinc-300 dark:border-zinc-700">
            <div className="flex justify-between">
              <span className="text-zinc-500">ID Transaksi</span>
              <span className="font-mono font-medium">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Tanggal & Waktu</span>
              <span>{order.bookingDate} · {order.timeSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Pelanggan</span>
              <span className="font-medium">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Kendaraan</span>
              <span className="font-semibold">{order.vehiclePlate} ({order.vehicleModel})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Teknisi Detailer</span>
              <span>{order.technicianName.split('(')[0]}</span>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="py-3 space-y-2 border-b border-dashed border-zinc-300 dark:border-zinc-700">
            <div className="flex justify-between items-start text-xs">
              <div className="pr-4">
                <p className="font-semibold">{order.packageName}</p>
                <p className="text-[11px] text-zinc-500">Tipe {order.vehicleSize.toUpperCase()}</p>
              </div>
              <span className="font-mono tabular-nums text-xs font-medium">
                Rp {order.subtotal.toLocaleString('id-ID')}
              </span>
            </div>

            {order.addOnIds.length > 0 && (
              <div className="text-[11px] text-zinc-500 pl-2 border-l border-zinc-300 dark:border-zinc-700">
                <p className="font-medium text-zinc-700 dark:text-zinc-300">Add-ons Tambahan:</p>
                <p>Engine Bay & Glass Treatment</p>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="pt-3 pb-2 text-xs space-y-1.5">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">
                Rp {order.subtotal.toLocaleString('id-ID')}
              </span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-500">
                <span>Diskon Loyalty Member VIP</span>
                <span className="font-mono tabular-nums">
                  - Rp {order.discount.toLocaleString('id-ID')}
                </span>
              </div>
            )}

            <div className="flex justify-between text-zinc-500">
              <span>PPN (11%)</span>
              <span className="font-mono tabular-nums">
                Rp {order.tax.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex justify-between text-sm font-bold pt-2 border-t border-zinc-200 dark:border-zinc-700">
              <span>TOTAL PEMBAYARAN</span>
              <span className="font-mono tabular-nums text-blue-600 dark:text-blue-400">
                Rp {order.totalAmount.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex justify-between text-xs pt-1 text-zinc-500">
              <span>Metode Bayar</span>
              <span className="uppercase font-semibold text-zinc-700 dark:text-zinc-300">
                {order.paymentMethod.replace('_', ' ')} · LUNAS
              </span>
            </div>
          </div>

          {/* Barcode & Footer Note */}
          <div className="pt-4 text-center">
            <div className="inline-block p-1 bg-white rounded border border-zinc-200">
              <div className="h-8 w-44 flex items-center justify-between gap-1 px-2 bg-white">
                {[4, 2, 5, 1, 3, 2, 4, 1, 3, 5, 2, 4, 1, 3, 2, 5, 1, 4].map((w, idx) => (
                  <div
                    key={idx}
                    className="bg-black h-full"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 font-mono tracking-wider">
              *{order.id}*
            </p>
            <p className="text-[10px] text-zinc-400 mt-2">
              Terima kasih telah mempercayakan perawatan kendaraan Anda kepada GlossLab Auto Studio.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleShare}
            className={`py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cupertino-press ${
              copied
                ? 'bg-emerald-600 text-white'
                : dark
                ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Bagikan Struk'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="py-3 px-4 rounded-xl text-xs font-semibold bg-blue-600 text-white flex items-center justify-center gap-1.5 hover:bg-blue-500 cupertino-press"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>
    </IosBottomSheet>
  );
};
