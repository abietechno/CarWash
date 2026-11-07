import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { BookingOrder } from '../../types';
import { playIosTap } from '../../utils/audio';

interface IosDynamicIslandProps {
  activeOrder?: BookingOrder | null;
  onOpenTracking?: () => void;
}

export const IosDynamicIsland: React.FC<IosDynamicIslandProps> = ({
  activeOrder,
  onOpenTracking,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    playIosTap();
    setIsExpanded((prev) => !prev);
  };

  const hasActiveJob = activeOrder && activeOrder.status !== 'selesai' && activeOrder.status !== 'diambil';

  return (
    <div className="relative flex justify-center w-full z-40 select-none px-4">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        onClick={toggleExpand}
        className={`bg-black text-white cursor-pointer overflow-hidden shadow-2xl flex items-center justify-between ${
          isExpanded
            ? 'w-[96%] rounded-3xl p-4 min-h-[96px]'
            : hasActiveJob
            ? 'w-[75%] rounded-full py-1.5 px-3 min-h-[34px]'
            : 'w-28 rounded-full py-1 px-3 min-h-[28px]'
        }`}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between w-full"
            >
              {hasActiveJob ? (
                <>
                  <div className="flex items-center gap-1.5 truncate">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3 h-3 animate-spin text-blue-400" />
                    </div>
                    <span className="text-[11px] font-medium tracking-tight text-zinc-200 truncate">
                      {activeOrder.vehiclePlate} · {activeOrder.progressPercentage}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-zinc-400 font-medium">Live</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center w-full gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                  <div className="w-2 h-2 rounded-full bg-zinc-900 border border-zinc-700/50" />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="w-full flex flex-col gap-2"
            >
              {hasActiveJob ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-500/30 text-blue-400 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white tracking-tight">
                          {activeOrder.vehicleModel}
                        </h4>
                        <p className="text-[10px] text-zinc-400">
                          {activeOrder.packageName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-400 tabular-nums">
                        {activeOrder.progressPercentage}%
                      </span>
                      <p className="text-[9px] text-zinc-400">Progres</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${activeOrder.progressPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800/80">
                    <div className="flex items-center gap-1 text-zinc-300">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{activeOrder.bayName.split('(')[0]}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(false);
                        onOpenTracking?.();
                      }}
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium active:opacity-70 transition-opacity"
                    >
                      Buka Detail
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">GlossLab Studio</p>
                      <p className="text-[10px] text-zinc-400">Semua bay beroperasi normal</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(false);
                    }}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
