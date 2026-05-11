'use client';

import { useEffect, useRef, useCallback } from 'react';

export const modalInputClass = 'w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all';
export const modalLabelClass = 'block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5';

export function Modal({
  open,
  onClose,
  title,
  maxWidth = '860px',
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open, handleEsc]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] bg-[rgba(15,23,42,0.55)] backdrop-blur-[6px] flex items-center justify-center p-6 md:p-8"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="rounded-[22px] p-[2px] bg-gradient-to-br from-[#4A6CF7] to-[#6C5CE7] shadow-[0_24px_80px_rgba(15,23,42,0.25)] animate-[modalIn_0.25s_ease] w-full flex flex-col"
        style={{ maxWidth, maxHeight: 'calc(100vh - 48px)' }}
      >
        <div className="bg-white rounded-[20px] w-full flex flex-col overflow-hidden relative" style={{ maxHeight: 'calc(100vh - 52px)' }}>
          {/* Header */}
          <div className="shrink-0 px-7 pt-7 pb-4 border-b border-[rgba(226,232,240,0.8)]">
            {title ? (
              <div className="flex items-center justify-between pr-10">
                <h2 className="text-xl font-extrabold text-[var(--color-text-primary)] tracking-tight">{title}</h2>
              </div>
            ) : (
              <div className="pr-10" />
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center justify-center cursor-pointer hover:bg-[var(--color-rose-soft)] hover:border-[rgba(239,68,68,0.2)] z-10 transition-all group"
          >
            <svg className="w-4 h-4 stroke-[var(--color-text-secondary)] stroke-2 fill-none group-hover:stroke-[var(--color-rose)]" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto px-7 py-6">
            <div className="space-y-4">{children}</div>
          </div>

          {/* Footer — fixed */}
          {footer && (
            <div className="shrink-0 px-7 py-4 border-t border-[rgba(226,232,240,0.8)] bg-white flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
