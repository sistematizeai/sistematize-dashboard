'use client';

import { useState } from 'react';
import { Modal, modalInputClass, modalLabelClass } from '@/components/ui/modal';
import api from '@/lib/api-client';
import type { Category } from '@/types';

const COLORS = ['#4F5AE5', '#4A6CF7', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#7B8AF2', '#06b6d4'];

export function CategoryFormModal({ category, onClose, onCreated }: {
  category?: Category | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const isEdit = !!category;
  const [form, setForm] = useState({
    name: category?.name || '',
    color: category?.color || COLORS[0],
    description: category?.description || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/api/categories/${category!.id}`, form);
      } else {
        await api.post('/api/categories', form);
      }
      onCreated();
      onClose();
    } catch {
      setError(isEdit ? 'Erro ao atualizar categoria.' : 'Erro ao criar categoria. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      maxWidth="480px"
      title={isEdit ? 'Editar Categoria' : 'Nova Categoria'}
      footer={
        <>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer disabled:opacity-50">
            {saving ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar Categoria'}
          </button>
        </>
      }
    >
      <div>
        <label className={modalLabelClass}>Nome *</label>
        <input className={modalInputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Cabelo" />
      </div>

      <div>
        <label className={`${modalLabelClass} mb-2`}>Cor</label>
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
        <label className={modalLabelClass}>Descricao</label>
        <textarea className={`${modalInputClass} resize-none`} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      {error && (
        <p className="text-xs text-[var(--color-rose)] font-medium">{error}</p>
      )}
    </Modal>
  );
}
