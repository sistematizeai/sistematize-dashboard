'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Category } from '@/types';
import api from '@/lib/api-client';

const PRICE_TYPES = [
  { value: 'fixed', label: 'Fixo' },
  { value: 'starting_at', label: 'A partir de' },
  { value: 'on_request', label: 'Sob consulta' },
];

export function ServiceFormModal({
  categories,
  defaultCategoryId,
  onClose,
  onCreated,
}: {
  categories: Category[];
  defaultCategoryId?: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    name: '',
    category_id: defaultCategoryId || categories[0]?.id || '',
    price: 0,
    price_type: 'fixed',
    duration_minutes: 30,
    description: '',
    is_active: true,
  });

  const handleSave = async () => {
    if (!form.name.trim() || !form.category_id) return;
    await api.post('/api/services', form);
    onCreated();
    onClose();
  };

  const input = 'w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all';

  return (
    <Modal open onClose={onClose} maxWidth="560px">
      <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-6">Novo Servico</h2>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">Nome *</label>
          <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Corte feminino" />
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

      <div className="flex justify-end gap-2.5 mt-7 pt-5 border-t border-[var(--color-border)]">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer">
          Cancelar
        </button>
        <button onClick={handleSave} className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold hover:bg-[#6d28d9] transition-all cursor-pointer">
          Criar Servico
        </button>
      </div>
    </Modal>
  );
}
