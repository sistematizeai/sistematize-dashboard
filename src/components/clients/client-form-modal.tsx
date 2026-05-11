'use client';

import { useState } from 'react';
import { Modal, modalInputClass, modalLabelClass } from '@/components/ui/modal';
import { Client } from '@/types';
import api from '@/lib/api-client';
import { maskPhone } from '@/lib/masks';

const SOURCE_OPTIONS = [
  { value: '', label: 'Selecione...' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Indicacao', label: 'Indicacao' },
  { value: 'Google', label: 'Google' },
  { value: 'Outro', label: 'Outro' },
];

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
    <Modal
      open
      onClose={onClose}
      maxWidth="560px"
      title="Novo Cliente"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Criar Cliente'}
          </button>
        </>
      }
    >
      {/* Nome */}
      <div>
        <label className={modalLabelClass}>Nome *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Nome completo"
          className={modalInputClass}
        />
      </div>

      {/* Telefone & Email */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={modalLabelClass}>Telefone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', maskPhone(e.target.value))}
            placeholder="(00) 00000-0000"
            className={modalInputClass}
          />
        </div>
        <div>
          <label className={modalLabelClass}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="email@exemplo.com"
            className={modalInputClass}
          />
        </div>
      </div>

      {/* Nascimento & Como Conheceu */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={modalLabelClass}>Data de Nascimento</label>
          <input
            type="date"
            value={form.birth_date}
            onChange={(e) => update('birth_date', e.target.value)}
            className={modalInputClass}
          />
        </div>
        <div>
          <label className={modalLabelClass}>Como Conheceu</label>
          <select
            value={form.source}
            onChange={(e) => update('source', e.target.value)}
            className={modalInputClass}
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
        <label className={modalLabelClass}>Observacoes</label>
        <textarea
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Anotacoes sobre o cliente..."
          rows={3}
          className={modalInputClass + ' resize-none'}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-[var(--color-rose)] font-medium">{error}</p>
      )}
    </Modal>
  );
}
