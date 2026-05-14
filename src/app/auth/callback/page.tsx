'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api-client';

function CallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setErrorMsg('Link de confirmacao invalido.');
      return;
    }

    api.post('/api/auth/confirm-email', { token })
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err.response?.data?.message || 'Link expirado ou invalido. Solicite um novo.');
      });
  }, [searchParams]);

  return (
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 text-center">
      <div className="mb-6">
        <img src="/logo-sistematize.png" alt="Sistematize" className="h-7 mx-auto" draggable={false} />
      </div>

      {status === 'loading' && (
        <>
          <div className="w-12 h-12 mx-auto mb-5 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-text-secondary)]">Confirmando seu email...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[var(--color-green-soft)] flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--color-green)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Email confirmado!</h1>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Sua conta esta ativa. Faca login para comecar a usar o Sistematize.
          </p>
          <a
            href="/login"
            className="inline-block w-full rounded-xl py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] hover:brightness-110 transition-all"
          >
            Ir para o login
          </a>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[var(--color-rose-soft)] flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--color-rose)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Erro na confirmacao</h1>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">{errorMsg}</p>
          <a
            href="/login"
            className="inline-block w-full rounded-xl py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] hover:brightness-110 transition-all"
          >
            Ir para o login
          </a>
        </>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg-deep)] px-4">
      <Suspense fallback={
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-5 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-text-secondary)]">Carregando...</p>
        </div>
      }>
        <CallbackContent />
      </Suspense>
    </main>
  );
}
