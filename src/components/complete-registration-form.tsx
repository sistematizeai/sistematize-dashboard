'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api-client';
import { getApiErrorMessage } from '@/lib/errors';

export function CompleteRegistrationForm() {
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const [form, setForm] = useState({ document: '', business_name: '', full_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/complete-registration', form);
      await loginWithToken(res.data.token);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao completar cadastro'));
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  return (
    <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">Complete seu Cadastro</h2>
      <p className="mb-4 text-sm text-gray-500">Para continuar, informe seu CPF/CNPJ e o nome do salao.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nome completo</label>
          <input value={form.full_name} onChange={update('full_name')}
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
          {loading ? 'Salvando...' : 'Completar Cadastro'}
        </button>
      </form>
    </div>
  );
}
