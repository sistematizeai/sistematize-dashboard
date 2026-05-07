'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import api from '@/lib/api-client';

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [needs2FA, setNeeds2FA] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setError(err.response?.data?.message || 'Erro ao fazer login');
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
      localStorage.setItem('token', res.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Codigo 2FA invalido');
    } finally {
      setLoading(false);
    }
  };

  if (needs2FA) {
    return (
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">Verificacao 2FA</h2>
        <form onSubmit={handle2FA} className="space-y-4">
          <div>
            <label htmlFor="totp" className="block text-sm font-medium">Codigo do autenticador</label>
            <input id="totp" value={totpCode} onChange={(e) => setTotpCode(e.target.value)}
              placeholder="000000" maxLength={6}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50" disabled={loading}>
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">Senha</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        Nao tem conta? <a href="/register" className="font-medium text-black underline">Cadastre-se</a>
      </p>
    </div>
  );
}
