'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api-client';
import { maskDocument, maskPhone } from '@/lib/masks';

const inputClass =
  'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-deep)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all';

const btnPrimary =
  'w-full rounded-xl py-3 text-sm font-semibold text-white transition-all bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] hover:brightness-110 disabled:opacity-50 cursor-pointer';

export function RegisterForm() {
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', document: '', business_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', form);
      await loginWithToken(res.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Logo */}
      <div className="mb-8">
        <img src="/logo-sistematize.png" alt="Sistematize" className="h-7" draggable={false} />
      </div>

      {/* Heading */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">Crie sua conta</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Preencha os dados para comecar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
            Nome completo
          </label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] stroke-[var(--color-text-muted)] fill-none pointer-events-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input
              value={form.full_name}
              onChange={update('full_name')}
              required
              placeholder="Seu nome"
              autoComplete="name"
              className={`${inputClass} pl-11`}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
            Email
          </label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] stroke-[var(--color-text-muted)] fill-none pointer-events-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="3"/>
              <polyline points="22,7 12,14 2,7"/>
            </svg>
            <input
              type="email"
              value={form.email}
              onChange={update('email')}
              required
              placeholder="seu@email.com"
              autoComplete="email"
              className={`${inputClass} pl-11`}
            />
          </div>
        </div>

        {/* Senha */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
            Senha
          </label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] stroke-[var(--color-text-muted)] fill-none pointer-events-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="3"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={update('password')}
              required
              minLength={8}
              placeholder="Minimo 8 caracteres"
              autoComplete="new-password"
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

        {/* CPF/CNPJ + Nome do salao — side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
              CPF ou CNPJ
            </label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] stroke-[var(--color-text-muted)] fill-none pointer-events-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2"/>
                <line x1="7" y1="9" x2="17" y2="9"/>
                <line x1="7" y1="13" x2="13" y2="13"/>
              </svg>
              <input
                value={form.document}
                onChange={(e) => setForm((prev) => ({ ...prev, document: maskDocument(e.target.value) }))}
                required
                placeholder="000.000.000-00"
                className={`${inputClass} pl-11`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
              Nome do negocio
            </label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] stroke-[var(--color-text-muted)] fill-none pointer-events-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              <input
                value={form.business_name}
                onChange={update('business_name')}
                required
                placeholder="Seu salao"
                className={`${inputClass} pl-11`}
              />
            </div>
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
        <button type="submit" className={btnPrimary} disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Criando conta...
            </span>
          ) : 'Criar conta gratis'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <span className="text-xs text-[var(--color-text-muted)]">ou</span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Ja tem uma conta?{' '}
        <a href="/login" className="font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors">
          Entre aqui
        </a>
      </p>
    </div>
  );
}
