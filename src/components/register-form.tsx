'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api-client';

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', document: '', business_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', form);
      localStorage.setItem('token', res.data.token);
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
    <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">Criar Conta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nome completo</label>
          <input value={form.full_name} onChange={update('full_name')} required
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" value={form.email} onChange={update('email')} required
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Senha</label>
          <input type="password" value={form.password} onChange={update('password')} required minLength={8}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">CPF ou CNPJ</label>
          <input value={form.document} onChange={update('document')} required placeholder="000.000.000-00"
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Nome do salao</label>
          <input value={form.business_name} onChange={update('business_name')} required
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Conta'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        Ja tem conta? <a href="/login" className="font-medium text-black underline">Entre aqui</a>
      </p>
    </div>
  );
}
