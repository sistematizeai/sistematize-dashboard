'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Category, Service } from '@/types';
import api from '@/lib/api-client';

const PRICE_TYPES = [
  { value: 'fixed', label: 'Fixo' },
  { value: 'starting_at', label: 'A partir de' },
  { value: 'on_request', label: 'Sob consulta' },
];

export function ServiceEditModal({
  service,
  categories,
  onClose,
  onSaved,
}: {
  service: Service | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ name: '', category_id: '', price_type: 'fixed', duration_minutes: 30, price: 0, description: '', is_active: true });

  useEffect(() => {
    if (service) {
      setForm({
        name: service.name,
        category_id: service.category_id,
        price_type: service.price_type,
        duration_minutes: service.duration_minutes,
        price: service.price,
        description: service.description || '',
        is_active: service.is_active,
      });
    }
  }, [service]);

  if (!service) return null;

  const handleSave = async () => {
    await api.put(`/api/services/${service.id}`, form);
    onSaved();
    onClose();
  };

  const handleDelete = async () => {
    if (!confirm('Excluir este servico?')) return;
    await api.delete(`/api/services/${service.id}`);
    onSaved();
    onClose();
  };

  const input = 'w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all';

  return (
    <Modal open={!!service} onClose={onClose} maxWidth="580px">
      <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-6">Editar Servico</h2>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">Nome</label>
          <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">Categoria</label>
          <select className={input} value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">Tipo de Preco</label>
            <select className={input} value={form.price_type} onChange={(e) => setForm({ ...form, price_type: e.target.value })}>
              {PRICE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">Duracao (min)</label>
            <input type="number" className={input} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">Valor (R$)</label>
            <input type="number" step="0.01" className={input} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">Descricao</label>
          <textarea className={`${input} resize-none`} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded accent-[var(--color-accent)]" />
          <span className="text-sm text-[var(--color-text-primary)]">Servico ativo</span>
        </label>
      </div>

      <div className="flex items-center justify-between mt-7 pt-5 border-t border-[var(--color-border)]">
        <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-[var(--color-rose)] text-sm font-medium hover:bg-[var(--color-rose-soft)] transition-all cursor-pointer">
          Excluir
        </button>
        <div className="flex gap-2.5">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold hover:bg-[#6d28d9] transition-all cursor-pointer">
            Atualizar
          </button>
        </div>
      </div>
    </Modal>
  );
}
