'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
};

const styles = {
  success: {
    wrap: 'bg-white border-green-200',
    icon: 'text-green-500',
    text: 'text-gray-800',
    bar: 'bg-green-500',
    accent: 'bg-green-500',
  },
  error: {
    wrap: 'bg-white border-red-200',
    icon: 'text-red-500',
    text: 'text-gray-800',
    bar: 'bg-red-500',
    accent: 'bg-red-500',
  },
  info: {
    wrap: 'bg-white border-blue-200',
    icon: 'text-blue-500',
    text: 'text-gray-800',
    bar: 'bg-blue-500',
    accent: 'bg-blue-500',
  },
  warning: {
    wrap: 'bg-white border-yellow-200',
    icon: 'text-yellow-500',
    text: 'text-gray-800',
    bar: 'bg-yellow-500',
    accent: 'bg-yellow-500',
  },
};

export default function Toast({ message, type = 'info', onClose, duration = 4000 }: ToastProps) {
  const [phase, setPhase] = useState<'in' | 'idle' | 'out'>('in');
  const s = styles[type];
  const Icon = icons[type];

  const dismiss = () => {
    setPhase('out');
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    // After slide-in completes, switch to idle (so progress bar CSS can start)
    const inTimer = setTimeout(() => setPhase('idle'), 350);
    // Auto-dismiss after duration
    const outTimer = setTimeout(dismiss, duration);
    return () => {
      clearTimeout(inTimer);
      clearTimeout(outTimer);
    };
  }, [duration]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`
        relative flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl overflow-hidden
        ${s.wrap}
        ${phase === 'in'  ? 'animate-toast-in' : ''}
        ${phase === 'out' ? 'animate-toast-out' : ''}
      `}
      style={{ minWidth: '300px', maxWidth: '400px' }}
    >
      {/* Coloured left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${s.accent}`} />

      {/* Icon */}
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${s.icon}`} />

      {/* Message */}
      <p className={`flex-1 text-sm font-medium leading-snug ${s.text}`}>{message}</p>

      {/* Close */}
      <button
        onClick={dismiss}
        className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar — sweeps from full to empty over `duration` ms */}
      {phase === 'idle' && (
        <div
          className={`absolute bottom-0 left-0 h-[2px] ${s.bar} rounded-full`}
          style={{
            animation: `toast-progress ${duration - 350}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}

// ─── Toast Manager Hook ───────────────────────────────────────────────────────
import { create } from 'zustand';

interface ToastState {
  toasts: { id: string; message: string; type: ToastType }[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => removeToast(t.id)}
        />
      ))}
    </div>
  );
}
