'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api-client';

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

export function CategoryFormModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', color: COLORS[0], description: '' });

  const handleSave = async () => {
    if (!form.name.trim()) return;
    await api.post('/api/categories', form);
    onCreated();
    onClose();
  };

  const input = 'w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all';

  return (
    <Modal open onClose={onClose} maxWidth="480px">
      <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-6">Nova Categoria</h2>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">Nome *</label>
          <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Cabelo" />
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-2 block">Cor</label>
          <div className="flex gap-2.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setForm({ ...form, color: c })}
                className={`w-9 h-9 rounded-xl cursor-pointer transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-[var(--color-accent)] scale-110' : 'hover:scale-105'}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">Descricao</label>
          <textarea className={`${input} resize-none`} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </div>

      <div className="flex justify-end gap-2.5 mt-7 pt-5 border-t border-[var(--color-border)]">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer">
          Cancelar
        </button>
        <button onClick={handleSave} className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold hover:bg-[#6d28d9] transition-all cursor-pointer">
          Criar Categoria
        </button>
      </div>
    </Modal>
  );
}
