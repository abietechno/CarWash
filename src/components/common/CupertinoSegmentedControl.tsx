import React from 'react';
import { motion } from 'motion/react';
import { playIosTap } from '../../utils/audio';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  badge?: number | string;
}

interface CupertinoSegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  dark?: boolean;
}

export function CupertinoSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
  dark = false,
}: CupertinoSegmentedControlProps<T>) {
  return (
    <div
      className={`relative flex items-center p-1 rounded-xl select-none transition-colors ${
        dark ? 'bg-zinc-800/80 border border-zinc-700/60' : 'bg-slate-200/70 border border-slate-300/40'
      } ${className}`}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              if (!isActive) {
                playIosTap();
                onChange(option.value);
              }
            }}
            className={`relative flex-1 py-1.5 px-2 text-xs font-medium text-center rounded-lg transition-colors z-10 whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
              isActive
                ? dark
                  ? 'text-white'
                  : 'text-slate-900'
                : dark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-segmented-pill"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                className={`absolute inset-0 rounded-lg shadow-sm ${
                  dark ? 'bg-zinc-700 text-white' : 'bg-white text-slate-900 shadow-slate-300/50'
                }`}
                style={{ zIndex: -1 }}
              />
            )}
            <span>{option.label}</span>
            {option.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : dark
                    ? 'bg-zinc-700 text-zinc-300'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
