'use client';

import { useState, useEffect, useRef } from 'react';
import { Modal, modalInputClass, modalLabelClass } from '@/components/ui/modal';
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
      setImagePreview(service.image_url);
    }
  }, [service]);

  if (!service) return null;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put(`/api/services/${service.id}`, form);
      onSaved();
      onClose();
    } catch {
      setError('Erro ao atualizar servico. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post(`/api/services/${service!.id}/image`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImagePreview(data.image_url);
    } catch {
      setError('Erro ao enviar imagem. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Excluir este servico?')) return;
    try {
      await api.delete(`/api/services/${service.id}`);
      onSaved();
      onClose();
    } catch {
      setError('Erro ao excluir servico. Tente novamente.');
    }
  };

  return (
    <Modal
      open={!!service}
      onClose={onClose}
      maxWidth="580px"
      title="Editar Servico"
      footer={
        <>
          <button onClick={handleDelete} className="mr-auto px-4 py-2 rounded-xl text-[var(--color-rose)] text-sm font-medium hover:bg-[var(--color-rose-soft)] transition-all cursor-pointer">
            Excluir
          </button>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer disabled:opacity-50">
            {saving ? 'Salvando...' : 'Atualizar'}
          </button>
        </>
      }
    >
      <div>
        <label className={modalLabelClass}>Nome</label>
        <input className={modalInputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
        {imagePreview ? (
          <div className="relative group w-full h-36 rounded-xl overflow-hidden border border-[var(--color-border)]">
            <img src={imagePreview} alt={form.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="px-3 py-1.5 rounded-lg bg-white text-xs font-medium text-[var(--color-text-primary)] hover:bg-gray-100 transition-all cursor-pointer">
                {uploading ? 'Enviando...' : 'Trocar'}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full h-28 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer">
            <svg className="w-6 h-6 stroke-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
            <span className="text-xs text-[var(--color-text-muted)]">{uploading ? 'Enviando...' : 'Clique para enviar imagem'}</span>
            <span className="text-[10px] text-[var(--color-text-muted)]">JPG, PNG ou WebP - max 5MB</span>
          </button>
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
