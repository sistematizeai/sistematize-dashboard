'use client';

import { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Modal, modalInputClass, modalLabelClass } from '@/components/ui/modal';
import api from '@/lib/api-client';
import type { Service, Combo } from '@/types';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

type PriceMode = 'sum' | 'custom';

export function ComboFormModal({
  combo,
  services,
  onClose,
  onSaved,
}: {
  combo?: Combo | null;
  services: Service[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!combo;

  const [name, setName] = useState(combo?.name || '');
  const [description, setDescription] = useState(combo?.description || '');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    combo?.services?.map((s) => s.id) || []
  );
  const [priceMode, setPriceMode] = useState<PriceMode>(
    combo && combo.discount_percent === 0 && combo.price > 0 ? 'custom' : 'sum'
  );
  const [customPrice, setCustomPrice] = useState(combo?.price?.toString() || '');
  const [discountPercent, setDiscountPercent] = useState(combo?.discount_percent?.toString() || '0');
  const [isActive, setIsActive] = useState(combo?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(combo?.image_url || null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const sumPrice = useMemo(
    () => services.filter((s) => selectedServiceIds.includes(s.id)).reduce((sum, s) => sum + s.price, 0),
    [services, selectedServiceIds]
  );

  const totalDuration = useMemo(
    () => services.filter((s) => selectedServiceIds.includes(s.id)).reduce((sum, s) => sum + s.duration_minutes, 0),
    [services, selectedServiceIds]
  );

  const discount = Number(discountPercent) || 0;
  const finalPrice = priceMode === 'custom'
    ? Number(customPrice) || 0
    : sumPrice * (1 - discount / 100);

  function toggleService(id: string) {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  const handleFileSelect = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  async function uploadImage(comboId: string) {
    if (!imageFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', imageFile);
      await api.post(`/api/combos/${comboId}/image`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!name.trim()) { setError('Nome do combo e obrigatorio'); return; }
    if (selectedServiceIds.length < 2) { setError('Selecione pelo menos 2 servicos'); return; }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        price: Number(finalPrice.toFixed(2)),
        discount_percent: priceMode === 'sum' ? discount : 0,
        is_active: isActive,
        service_ids: selectedServiceIds,
      };

      if (isEdit) {
        await api.patch(`/api/combos/${combo!.id}`, payload);
        if (imageFile) await uploadImage(combo!.id);
      } else {
        const { data: created } = await api.post('/api/combos', payload);
        if (imageFile) await uploadImage(created.id);
      }
      onSaved();
    } catch {
      setError('Erro ao salvar combo. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir este combo?')) return;
    setSaving(true);
    try {
      await api.delete(`/api/combos/${combo!.id}`);
      onSaved();
    } catch {
      setError('Erro ao excluir combo.');
      setSaving(false);
    }
  }

  const activeServices = services.filter((s) => s.is_active);

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? 'Editar Combo' : 'Novo Combo'}
      maxWidth="680px"
      footer={
        <>
          {isEdit && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="mr-auto px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-rose)] hover:bg-[var(--color-rose-soft)] transition-all cursor-pointer disabled:opacity-50"
            >
              Excluir
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar Combo'}
          </button>
        </>
      }
    >
      {error && (
        <div className="p-3 rounded-xl bg-[var(--color-rose-soft)] border border-[rgba(239,68,68,0.2)] text-[var(--color-rose)] text-sm font-medium">
          {error}
        </div>
      )}

      {/* Name + Active toggle */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className={modalLabelClass}>Nome do Combo</label>
          <input
            className={modalInputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Pacote Noiva, Dia de Beleza..."
          />
        </div>
        <div className="pt-6">
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative w-11 h-6 rounded-full transition-all cursor-pointer ${
              isActive ? 'bg-[var(--color-green)]' : 'bg-[var(--color-border)]'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                isActive ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={modalLabelClass}>Descricao</label>
        <textarea
          className={`${modalInputClass} resize-none`}
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descricao opcional do combo..."
        />
      </div>

      {/* Image upload */}
      <div>
        <label className={modalLabelClass}>Imagem</label>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
        {imagePreview ? (
          <div className="relative group w-full h-36 rounded-xl overflow-hidden border border-[var(--color-border)]">
            <Image src={imagePreview} alt="Preview" fill sizes="(min-width: 640px) 480px, 100vw" className="object-cover" />
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
          <button type="button" onClick={() => fileRef.current?.click()} className="w-full h-24 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer">
            <svg className="w-6 h-6 stroke-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
            <span className="text-xs text-[var(--color-text-muted)]">Clique para selecionar imagem</span>
            <span className="text-[10px] text-[var(--color-text-muted)]">JPG, PNG ou WebP - max 5MB</span>
          </button>
        )}
      </div>

      {/* Service Selector */}
      <div>
        <label className={modalLabelClass}>
          Servicos ({selectedServiceIds.length} selecionado{selectedServiceIds.length !== 1 ? 's' : ''})
        </label>
        <div className="border border-[var(--color-border)] rounded-xl p-3 max-h-[200px] overflow-y-auto space-y-1">
          {activeServices.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-4">Nenhum servico ativo</p>
          ) : (
            activeServices.map((svc) => {
              const isSelected = selectedServiceIds.includes(svc.id);
              return (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => toggleService(svc.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--color-accent-soft)] border border-[var(--color-accent)] border-opacity-20'
                      : 'hover:bg-[var(--color-bg-surface)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
                          : 'border-[var(--color-border)]'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 stroke-white stroke-[3] fill-none" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">{svc.name}</span>
                      <span className="text-xs text-[var(--color-text-muted)] ml-2">{svc.duration_minutes}min</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {formatCurrency(svc.price)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Price Mode */}
      <div>
        <label className={modalLabelClass}>Precificacao</label>
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setPriceMode('sum')}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
              priceMode === 'sum'
                ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]'
            }`}
          >
            Soma dos servicos
          </button>
          <button
            type="button"
            onClick={() => setPriceMode('custom')}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
              priceMode === 'custom'
                ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]'
            }`}
          >
            Preco personalizado
          </button>
        </div>

        {priceMode === 'sum' ? (
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className={modalLabelClass}>Desconto (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className={modalInputClass}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
              />
            </div>
            <div className="pb-3 text-right">
              <div className="text-xs text-[var(--color-text-muted)]">Soma: {formatCurrency(sumPrice)}</div>
              {discount > 0 && (
                <div className="text-xs text-[var(--color-green)] font-semibold">-{discount}%</div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <label className={modalLabelClass}>Preco do Combo (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={modalInputClass}
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder="0,00"
            />
            {sumPrice > 0 && Number(customPrice) > 0 && Number(customPrice) < sumPrice && (
              <p className="text-xs text-[var(--color-green)] font-semibold mt-1">
                Economia de {formatCurrency(sumPrice - Number(customPrice))} ({Math.round((1 - Number(customPrice) / sumPrice) * 100)}% off)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      {selectedServiceIds.length > 0 && (
        <div className="bg-[var(--color-bg-surface)] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-[var(--color-text-muted)]">Duracao total</div>
              <div className="text-sm font-bold text-[var(--color-text-primary)]">{totalDuration} min</div>
            </div>
            <div className="w-px h-8 bg-[var(--color-border)]" />
            <div>
              <div className="text-xs text-[var(--color-text-muted)]">Servicos</div>
              <div className="text-sm font-bold text-[var(--color-text-primary)]">{selectedServiceIds.length}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[var(--color-text-muted)]">Preco final</div>
            <div className="text-xl font-extrabold text-[var(--color-accent)]">{formatCurrency(finalPrice)}</div>
          </div>
        </div>
      )}
    </Modal>
  );
}
