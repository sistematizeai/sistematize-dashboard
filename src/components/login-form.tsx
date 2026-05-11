'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import api from '@/lib/api-client';

const inputClass =
  'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-deep)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all';

const btnPrimary =
  'w-full rounded-xl py-3 text-sm font-semibold text-white transition-all bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] hover:brightness-110 disabled:opacity-50 cursor-pointer';

export function LoginForm() {
  const { login, loginWithToken } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [needs2FA, setNeeds2FA] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.requires_2fa) {
        setNeeds2FA(true);
        setTempToken(result.temp_token || '');
      } else if (result.blocked) {
        router.push('/blocked');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message
        || err?.message
        || 'Erro ao fazer login';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/verify-2fa', {
        temp_token: tempToken,
        totp_code: totpCode,
      });
      await loginWithToken(res.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Codigo 2FA invalido');
    } finally {
      setLoading(false);
    }
  };

  if (needs2FA) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="mb-8">
          <img src="/logo-sistematize.png" alt="Sistematize" className="h-7 mb-10" draggable={false} />
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center mb-5">
            <svg className="w-6 h-6 stroke-[var(--color-accent)] fill-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">Verificacao em duas etapas</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Insira o codigo do seu aplicativo autenticador
          </p>
        </div>

        <form onSubmit={handle2FA} className="space-y-5">
          <div>
            <label htmlFor="totp" className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
              Codigo
            </label>
            <input
              id="totp"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              maxLength={6}
              autoFocus
              autoComplete="one-time-code"
              className={`${inputClass} text-center text-lg tracking-[0.3em] font-semibold`}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--color-rose-soft)] border border-red-100">
              <svg className="w-4 h-4 stroke-[var(--color-rose)] flex-shrink-0" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-xs text-[var(--color-rose)] font-medium">{error}</p>
            </div>
          )}

          <button type="submit" className={btnPrimary} disabled={loading || totpCode.length < 6}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verificando...
              </span>
            ) : 'Verificar'}
          </button>

          <button
            type="button"
            onClick={() => { setNeeds2FA(false); setTotpCode(''); setError(''); }}
            className="w-full text-center text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
          >
            Voltar ao login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Logo */}
      <div className="mb-10">
        <img src="/logo-sistematize.png" alt="Sistematize" className="h-7" draggable={false} />
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">Bem-vindo de volta!</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Entre na sua conta para continuar</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
            Email
          </label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] stroke-[var(--color-text-muted)] fill-none pointer-events-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="3"/>
              <polyline points="22,7 12,14 2,7"/>
            </svg>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              autoComplete="email"
              className={`${inputClass} pl-11`}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
              Senha
            </label>
            <a href="/forgot-password" className="text-xs font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors">
              Esqueceu a senha?
            </a>
          </div>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] stroke-[var(--color-text-muted)] fill-none pointer-events-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="3"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Sua senha"
              autoComplete="current-password"
              className={`${inputClass} pl-11 pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-[18px] h-[18px] stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg className="w-[18px] h-[18px] stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--color-rose-soft)] border border-red-100">
            <svg className="w-4 h-4 stroke-[var(--color-rose)] flex-shrink-0" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-xs text-[var(--color-rose)] font-medium">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button type="submit" className={btnPrimary} disabled={loading || !hydrated}>
          {!hydrated ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </span>
          ) : loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Entrando...
            </span>
          ) : 'Entrar'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <span className="text-xs text-[var(--color-text-muted)]">ou</span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Nao tem uma conta?{' '}
        <a href="/register" className="font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors">
          Cadastre-se gratis
        </a>
      </p>
    </div>
  );
}
