'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Collaborator, Service } from '@/types';
import api from '@/lib/api-client';

export function CollaboratorEditModal({
  collaborator,
  allServices,
  onClose,
  onSaved,
}: {
  collaborator: Collaborator | null;
  allServices: Service[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', cpf: '', birth_date: '',
    base_commission: 0, work_start: '08:00', work_end: '18:00',
    address: '', notes: '', is_active: true,
  });
  const [serviceMap, setServiceMap] = useState<Record<string, { enabled: boolean; commission: string }>>({});

  useEffect(() => {
    if (!collaborator) return;
    setForm({
      name: collaborator.name,
      phone: collaborator.phone || '',
      email: collaborator.email || '',
      cpf: collaborator.cpf || '',
      birth_date: collaborator.birth_date || '',
      base_commission: collaborator.base_commission,
      work_start: collaborator.work_start?.slice(0, 5) || '08:00',
      work_end: collaborator.work_end?.slice(0, 5) || '18:00',
      address: collaborator.address || '',
      notes: collaborator.notes || '',
      is_active: collaborator.is_active,
    });

    const map: Record<string, { enabled: boolean; commission: string }> = {};
    allServices.forEach((s) => {
      const match = collaborator.collaborator_services?.find((entry) => entry.service_id === s.id);
      map[s.id] = { enabled: !!match, commission: match?.commission?.toString() || '' };
    });
    setServiceMap(map);
  }, [collaborator, allServices]);

  if (!collaborator) return null;

  const handleSave = async () => {
    await api.put(`/api/collaborators/${collaborator.id}`, {
      name: form.name, phone: form.phone || null, email: form.email || null,
      cpf: form.cpf || null, birth_date: form.birth_date || null,
      base_commission: form.base_commission, work_start: form.work_start, work_end: form.work_end,
      address: form.address || null, notes: form.notes || null, is_active: form.is_active,
    });

    const services = Object.entries(serviceMap)
      .filter(([, v]) => v.enabled)
      .map(([service_id, v]) => ({ service_id, commission: v.commission ? Number(v.commission) : null }));
    await api.put(`/api/collaborators/${collaborator.id}/services`, { services });

    onSaved();
    onClose();
  };

  const handleDelete = async () => {
    if (!confirm('Excluir este colaborador?')) return;
    await api.delete(`/api/collaborators/${collaborator.id}`);
    onSaved();
    onClose();
  };

  const toggleService = (id: string) => {
    setServiceMap((prev) => ({ ...prev, [id]: { ...prev[id], enabled: !prev[id]?.enabled } }));
  };

  const setCommission = (id: string, val: string) => {
    setServiceMap((prev) => ({ ...prev, [id]: { ...prev[id], commission: val } }));
  };

  const input = 'w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all';

  return (
    <Modal open={!!collaborator} onClose={onClose} maxWidth="920px">
      <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-6">Editar Colaborador</h2>

      <div className="flex gap-6">
        {/* Left: Base Data */}
        <div className="flex-1 space-y-3.5">
          <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Dados do Colaborador</h3>
          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Nome *</label>
            <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Telefone</label>
              <input className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Email</label>
              <input className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">CPF</label>
              <input className={input} value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Nascimento</label>
              <input type="date" className={input} value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Comissao Base (%)</label>
              <input type="number" className={input} value={form.base_commission} onChange={(e) => setForm({ ...form, base_commission: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Inicio Jornada</label>
              <input type="time" className={input} value={form.work_start} onChange={(e) => setForm({ ...form, work_start: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Fim Jornada</label>
              <input type="time" className={input} value={form.work_end} onChange={(e) => setForm({ ...form, work_end: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Endereco</label>
            <input className={input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Observacoes</label>
            <textarea className={`${input} resize-none`} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded accent-[var(--color-accent)]" />
            <span className="text-sm text-[var(--color-text-primary)]">Colaborador ativo</span>
          </label>
        </div>

        {/* Right: Services & Commissions */}
        <div className="w-[340px] shrink-0">
          <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Servicos & Comissoes</h3>
          <div className="bg-[var(--color-bg-surface)] rounded-xl p-4 max-h-[480px] overflow-y-auto space-y-2">
            {allServices.map((s) => (
              <div key={s.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2.5 border border-[var(--color-border)]">
                <input
                  type="checkbox"
                  checked={serviceMap[s.id]?.enabled || false}
                  onChange={() => toggleService(s.id)}
                  className="w-4 h-4 rounded accent-[var(--color-accent)] shrink-0"
                />
                <span className="text-sm text-[var(--color-text-primary)] flex-1 truncate">{s.name}</span>
                <input
                  type="number"
                  placeholder="%"
                  value={serviceMap[s.id]?.commission || ''}
                  onChange={(e) => setCommission(s.id, e.target.value)}
                  disabled={!serviceMap[s.id]?.enabled}
                  className="w-16 px-2 py-1.5 rounded-lg border border-[var(--color-border)] text-xs text-center disabled:opacity-40 focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>
            ))}
            {allServices.length === 0 && (
              <p className="text-xs text-[var(--color-text-muted)] text-center py-4">Nenhum servico cadastrado</p>
            )}
          </div>
        </div>
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
