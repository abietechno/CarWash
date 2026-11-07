import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X } from 'lucide-react';
import { playIosTap } from '../../utils/audio';

export interface IosNotification {
  id: string;
  title: string;
  body: string;
  time?: string;
  icon?: string;
}

interface IosNotificationBannerProps {
  notification: IosNotification | null;
  onDismiss: () => void;
  onTap?: () => void;
  dark?: boolean;
}

export const IosNotificationBanner: React.FC<IosNotificationBannerProps> = ({
  notification,
  onDismiss,
  onTap,
  dark = false,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ y: -80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          className="fixed top-12 left-3 right-3 max-w-sm mx-auto z-50 cursor-pointer select-none"
          onClick={() => {
            playIosTap();
            onTap?.();
            onDismiss();
          }}
        >
          <div
            className={`p-3 rounded-2xl shadow-xl cupertino-blur border flex items-start gap-3 ${
              dark
                ? 'bg-zinc-900/90 border-zinc-700/60 text-white'
                : 'bg-white/90 border-slate-200/80 text-slate-900'
            }`}
          >
            {/* App icon badge */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500">
                  GLOSSLAB AUTO
                </span>
                <span className="text-[10px] text-zinc-400">
                  {notification.time || 'baru saja'}
                </span>
              </div>
              <h5 className="text-xs font-semibold tracking-tight mt-0.5 truncate">
                {notification.title}
              </h5>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                {notification.body}
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
