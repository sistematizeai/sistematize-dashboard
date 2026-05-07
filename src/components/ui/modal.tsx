'use client';

import { useEffect, useRef } from 'react';

export function Modal({
  open,
  onClose,
  maxWidth = '860px',
  children,
}: {
  open: boolean;
  onClose: () => void;
  maxWidth?: string;
  children: React.ReactNode;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-[4px] flex items-center justify-center p-8"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="bg-white rounded-[20px] w-full overflow-y-auto p-7 shadow-[0_24px_48px_rgba(0,0,0,0.15)] relative animate-[modalIn_0.25s_ease]"
        style={{ maxWidth, maxHeight: 'calc(100vh - 64px)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-[10px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center justify-center cursor-pointer hover:bg-[var(--color-rose-soft)] hover:border-[rgba(239,68,68,0.2)] z-10 transition-all group"
        >
          <svg className="w-4 h-4 stroke-[var(--color-text-secondary)] stroke-2 fill-none group-hover:stroke-[var(--color-rose)]" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        {children}
      </div>
    </div>
  );
}
