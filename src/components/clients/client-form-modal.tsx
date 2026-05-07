'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Client } from '@/types';
import api from '@/lib/api-client';

const SOURCE_OPTIONS = [
  { value: '', label: 'Selecione...' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Indicacao', label: 'Indicacao' },
  { value: 'Google', label: 'Google' },
  { value: 'Outro', label: 'Outro' },
];

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all';

export function ClientFormModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (client: Client) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    birth_date: '',
    source: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Nome e obrigatorio.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body: Record<string, string> = { name: form.name.trim() };
      if (form.phone.trim()) body.phone = form.phone.trim();
      if (form.email.trim()) body.email = form.email.trim();
      if (form.birth_date) body.birth_date = form.birth_date;
      if (form.source) body.source = form.source;
      if (form.notes.trim()) body.notes = form.notes.trim();

      const { data } = await api.post('/api/clients', body);
      onCreated(data);
    } catch {
      setError('Erro ao criar cliente. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} maxWidth="560px">
      <h2 className="text-xl font-extrabold text-[var(--color-text-primary)] mb-6">
        Novo Cliente
      </h2>

      <div className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
            Nome *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Nome completo"
            className={inputClass}
          />
        </div>

        {/* Telefone & Email */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
              Telefone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="(00) 00000-0000"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="email@exemplo.com"
              className={inputClass}
            />
          </div>
        </div>

        {/* Nascimento & Como Conheceu */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
              Data de Nascimento
            </label>
            <input
              type="date"
              value={form.birth_date}
              onChange={(e) => update('birth_date', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
              Como Conheceu
            </label>
            <select
              value={form.source}
              onChange={(e) => update('source', e.target.value)}
              className={inputClass}
            >
              {SOURCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Observacoes */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
            Observacoes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Anotacoes sobre o cliente..."
            rows={3}
            className={inputClass + ' resize-none'}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-[var(--color-rose)] font-medium mt-3">{error}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-[var(--color-border)]">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold hover:bg-[#6d28d9] transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Criar Cliente'}
        </button>
      </div>
    </Modal>
  );
}
