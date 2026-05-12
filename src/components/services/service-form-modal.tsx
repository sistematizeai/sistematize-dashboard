'use client';

import { useState, useRef } from 'react';
import { Modal, modalInputClass, modalLabelClass } from '@/components/ui/modal';
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
    requires_payment: false,
    payment_type: 'none' as string,
    deposit_amount: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.category_id) return;
    setSaving(true);
    setError('');
    try {
      const { data: created } = await api.post('/api/services', form);
      if (imageFile) {
        const fd = new FormData();
        fd.append('file', imageFile);
        await api.post(`/api/services/${created.id}/image`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      onCreated();
      onClose();
    } catch {
      setError('Erro ao criar servico. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      maxWidth="560px"
      title="Novo Servico"
      footer={
        <>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer disabled:opacity-50">
            {saving ? 'Salvando...' : 'Criar Servico'}
          </button>
        </>
      }
    >
      <div>
        <label className={modalLabelClass}>Nome *</label>
        <input className={modalInputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Corte feminino" />
      </div>

      <div>
        <label className={modalLabelClass}>Categoria</label>
        <select className={modalInputClass} value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={modalLabelClass}>Tipo de Preco</label>
          <select className={modalInputClass} value={form.price_type} onChange={(e) => setForm({ ...form, price_type: e.target.value })}>
            {PRICE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className={modalLabelClass}>Duracao (min)</label>
          <input type="number" className={modalInputClass} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
        </div>
        <div>
          <label className={modalLabelClass}>Valor (R$)</label>
          <input type="number" step="0.01" className={modalInputClass} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        </div>
      </div>

      <div>
        <label className={modalLabelClass}>Descricao</label>
        <textarea className={`${modalInputClass} resize-none`} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      <div>
        <label className={modalLabelClass}>Imagem</label>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
        {imagePreview ? (
          <div className="relative group w-full h-36 rounded-xl overflow-hidden border border-[var(--color-border)]">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button type="button" onClick={() => fileRef.current?.click()} className="px-3 py-1.5 rounded-lg bg-white text-xs font-medium text-[var(--color-text-primary)] hover:bg-gray-100 transition-all cursor-pointer">
                Trocar
              </button>
              <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="px-3 py-1.5 rounded-lg bg-white text-xs font-medium text-[var(--color-rose)] hover:bg-gray-100 transition-all cursor-pointer">
                Remover
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} className="w-full h-28 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer">
            <svg className="w-6 h-6 stroke-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
            <span className="text-xs text-[var(--color-text-muted)]">Clique para selecionar imagem</span>
            <span className="text-[10px] text-[var(--color-text-muted)]">JPG, PNG ou WebP - max 5MB</span>
          </button>
        )}
      </div>

      {/* Payment section */}
      <div className="border-t border-[var(--color-border)] pt-4 mt-2">
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input type="checkbox" checked={form.requires_payment} onChange={(e) => setForm({ ...form, requires_payment: e.target.checked, payment_type: e.target.checked ? 'full_payment' : 'none' })} className="w-4 h-4 rounded accent-[var(--color-accent)]" />
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Exigir pagamento para confirmar agendamento</span>
        </label>

        {form.requires_payment && (
          <div className="space-y-3 pl-6">
            <div>
              <label className={modalLabelClass}>Tipo de pagamento</label>
              <select className={modalInputClass} value={form.payment_type} onChange={(e) => setForm({ ...form, payment_type: e.target.value })}>
                <option value="full_payment">Cobrar valor total</option>
                <option value="deposit">Cobrar sinal</option>
                <option value="manual">Confirmacao manual</option>
              </select>
            </div>
            {form.payment_type === 'deposit' && (
              <div>
                <label className={modalLabelClass}>Valor do sinal (R$)</label>
                <input type="number" step="0.01" className={modalInputClass} value={form.deposit_amount} onChange={(e) => setForm({ ...form, deposit_amount: Number(e.target.value) })} />
              </div>
            )}
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded accent-[var(--color-accent)]" />
        <span className="text-sm text-[var(--color-text-primary)]">Servico ativo</span>
      </label>

      {error && (
        <p className="text-xs text-[var(--color-rose)] font-medium">{error}</p>
      )}
    </Modal>
  );
}
