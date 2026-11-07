import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { playIosTap } from '../../utils/audio';

interface IosBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
  dark?: boolean;
}

export const IosBottomSheet: React.FC<IosBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = 'max-h-[88vh]',
  dark = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleClose = () => {
    playIosTap();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            className={`relative z-10 w-full max-w-lg mx-auto rounded-t-[32px] overflow-hidden flex flex-col cupertino-card-shadow ${
              maxHeight
            } ${
              dark
                ? 'bg-zinc-900/95 text-zinc-100 border-t border-zinc-700/60'
                : 'bg-white/95 text-slate-900 border-t border-slate-200'
            } cupertino-blur`}
          >
            {/* Grab handle */}
            <div className="w-full pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
              <div
                className={`w-11 h-1.5 rounded-full ${
                  dark ? 'bg-zinc-700' : 'bg-slate-300'
                }`}
              />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-100 dark:border-zinc-800/80">
                <h3 className="text-base font-semibold tracking-tight">{title}</h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    dark
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto px-5 py-4 overscroll-contain flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
