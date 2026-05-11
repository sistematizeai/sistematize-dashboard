'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)]">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-rose-soft)] flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 stroke-[var(--color-rose)]" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Algo deu errado</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">Ocorreu um erro inesperado. Tente novamente.</p>
        <button onClick={reset} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer">
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
