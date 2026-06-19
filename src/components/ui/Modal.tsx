'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-[calc(100%-2rem)] sm:max-w-sm md:max-w-md',
  md: 'max-w-[calc(100%-2rem)] sm:max-w-md md:max-w-lg',
  lg: 'max-w-[calc(100%-2rem)] sm:max-w-lg md:max-w-2xl',
  xl: 'max-w-[calc(100%-2rem)] sm:max-w-2xl md:max-w-4xl',
};

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const portalRef = useRef<HTMLDivElement | null>(null);

  // Create portal container once on client
  useEffect(() => {
    const el = document.createElement('div');
    el.id = 'modal-portal';
    document.body.appendChild(el);
    portalRef.current = el;
    setMounted(true);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setClosing(false);
      setVisible(true);
    } else if (visible) {
      setClosing(true);
      const t = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (visible) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [visible, onClose]);

  if (!mounted || !visible || !portalRef.current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${closing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
        onClick={onClose}
      />

      {/* Panel — portal-rendered so position:fixed is always relative to viewport */}
      <div
        className={`
          relative w-full ${sizeClasses[size]}
          bg-white shadow-2xl
          rounded-2xl flex flex-col
          ${closing ? 'animate-scale-out' : 'animate-scale-in'}
        `}
        style={{ maxHeight: 'calc(100dvh - 2rem)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-150"
            style={{ transition: 'transform 0.2s cubic-bezier(0.34,1.4,0.64,1), background 0.15s ease, color 0.15s ease' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto p-5 flex-1" style={{ maxHeight: 'calc(100dvh - 2rem - 65px)' }}>
          {children}
        </div>
      </div>
    </div>,
    portalRef.current,
  );
}
