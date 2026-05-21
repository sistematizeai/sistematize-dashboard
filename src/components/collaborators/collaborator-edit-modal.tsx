'use client';

import { useState, useEffect } from 'react';
import { Modal, modalInputClass, modalLabelClass } from '@/components/ui/modal';
import { Collaborator, Service } from '@/types';
import api from '@/lib/api-client';
import { CollaboratorScheduleEditor } from './collaborator-schedule';
import { maskPhone, maskCPF } from '@/lib/masks';
import { getApiErrorMessage } from '@/lib/errors';

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
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [rightTab, setRightTab] = useState<'services' | 'schedule'>('services');

  useEffect(() => {
    if (!collaborator) return;
    queueMicrotask(() => {
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
    });
  }, [collaborator, allServices]);

  if (!collaborator) return null;

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Nome e obrigatorio.'); return; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Email invalido.'); return; }
    if (form.base_commission < 0 || form.base_commission > 100) { setError('Comissao deve ser entre 0 e 100.'); return; }
    if (form.work_start >= form.work_end) { setError('Inicio da jornada deve ser antes do fim.'); return; }
    setSaving(true);
    setError('');
    try {
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
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao atualizar colaborador. Tente novamente.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Desativar este colaborador? Ele nao aparecera mais para agendamentos.')) return;
    setDeleting(true);
    try {
      await api.put(`/api/collaborators/${collaborator.id}`, { is_active: false });
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao desativar colaborador. Tente novamente.'));
    } finally {
      setDeleting(false);
    }
  };

  const toggleService = (id: string) => {
    setServiceMap((prev) => ({ ...prev, [id]: { ...prev[id], enabled: !prev[id]?.enabled } }));
  };

  const setCommission = (id: string, val: string) => {
    setServiceMap((prev) => ({ ...prev, [id]: { ...prev[id], commission: val } }));
  };

  return (
    <Modal
      open={!!collaborator}
      onClose={onClose}
      maxWidth="920px"
      title="Editar Colaborador"
      footer={
        <>
          <button onClick={handleDeactivate} disabled={deleting} className="mr-auto px-4 py-2 rounded-xl text-[var(--color-rose)] text-sm font-medium hover:bg-[var(--color-rose-soft)] transition-all cursor-pointer disabled:opacity-50">
            {deleting ? 'Desativando...' : 'Desativar'}
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
      <div className="flex gap-6">
        {/* Left: Base Data */}
        <div className="flex-1 space-y-3.5">
          <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Dados do Colaborador</h3>
          <div>
            <label className={modalLabelClass}>Nome *</label>
            <input className={modalInputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={modalLabelClass}>Telefone</label>
              <input className={modalInputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })} />
            </div>
            <div>
              <label className={modalLabelClass}>Email</label>
              <input className={modalInputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={modalLabelClass}>CPF</label>
              <input className={modalInputClass} value={form.cpf} onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })} />
            </div>
            <div>
              <label className={modalLabelClass}>Nascimento</label>
              <input type="date" className={modalInputClass} value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={modalLabelClass}>Comissao Base (%)</label>
              <input type="number" min={0} max={100} className={modalInputClass} value={form.base_commission} onChange={(e) => setForm({ ...form, base_commission: Number(e.target.value) })} />
            </div>
            <div>
              <label className={modalLabelClass}>Inicio Jornada</label>
              <input type="time" className={modalInputClass} value={form.work_start} onChange={(e) => setForm({ ...form, work_start: e.target.value })} />
            </div>
            <div>
              <label className={modalLabelClass}>Fim Jornada</label>
              <input type="time" className={modalInputClass} value={form.work_end} onChange={(e) => setForm({ ...form, work_end: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={modalLabelClass}>Endereco</label>
            <input className={modalInputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <label className={modalLabelClass}>Observacoes</label>
            <textarea className={`${modalInputClass} resize-none`} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded accent-[var(--color-accent)]" />
            <span className="text-sm text-[var(--color-text-primary)]">Colaborador ativo</span>
          </label>
        </div>

        {/* Right: Centro Quantico */}
        <div className="w-[400px] shrink-0 rounded-2xl p-5 bg-gradient-to-br from-[#fdf6e3] to-[#fef3cd] border border-[rgba(245,158,11,0.2)]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600/70">Centro Quantico</span>
          <h3 className="text-lg font-extrabold text-[var(--color-text-primary)] mt-1">{form.name || 'Colaborador'}</h3>

          {/* Mini KPIs */}
          <div className="grid grid-cols-3 gap-2 my-3">
            <div className="bg-white/70 rounded-xl px-3 py-2 text-center">
              <span className="text-lg font-extrabold text-[var(--color-text-primary)]">
                {new Set(allServices.filter((s) => serviceMap[s.id]?.enabled).map((s) => s.category_id)).size}
              </span>
              <p className="text-[9px] text-[var(--color-text-muted)] font-medium">Categorias</p>
            </div>
            <div className="bg-white/70 rounded-xl px-3 py-2 text-center">
              <span className="text-lg font-extrabold text-[var(--color-text-primary)]">
                {Object.values(serviceMap).filter((v) => v.enabled).length}
              </span>
              <p className="text-[9px] text-[var(--color-text-muted)] font-medium">Servicos Ativos</p>
            </div>
            <div className="bg-white/70 rounded-xl px-3 py-2 text-center">
              <span className="text-lg font-extrabold text-[var(--color-text-primary)]">
                {form.base_commission}%
              </span>
              <p className="text-[9px] text-[var(--color-text-muted)] font-medium">Comissao Base</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setRightTab('services')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                rightTab === 'services' ? 'bg-amber-500 text-white' : 'bg-white/60 text-amber-700 hover:bg-white/80'
              }`}
            >
              Servicos
            </button>
            <button
              onClick={() => setRightTab('schedule')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                rightTab === 'schedule' ? 'bg-amber-500 text-white' : 'bg-white/60 text-amber-700 hover:bg-white/80'
              }`}
            >
              Agenda Semanal
            </button>
          </div>

          {rightTab === 'services' ? (
            <div className="max-h-[320px] overflow-y-auto space-y-1.5">
              {allServices.map((s) => (
                <div key={s.id} className="flex items-center gap-2.5 bg-white/80 rounded-lg px-3 py-2 border border-white/50">
                  <input
                    type="checkbox"
                    checked={serviceMap[s.id]?.enabled || false}
                    onChange={() => toggleService(s.id)}
                    className="w-4 h-4 rounded accent-amber-500 shrink-0"
                  />
                  <span className="text-[13px] text-[var(--color-text-primary)] flex-1 truncate">{s.name}</span>
                  <input
                    type="number"
                    placeholder="%"
                    value={serviceMap[s.id]?.commission || ''}
                    onChange={(e) => setCommission(s.id, e.target.value)}
                    disabled={!serviceMap[s.id]?.enabled}
                    className="w-14 px-2 py-1 rounded-lg border border-amber-200 bg-white text-xs text-center disabled:opacity-30 focus:outline-none focus:border-amber-400"
                  />
                </div>
              ))}
              {allServices.length === 0 && (
                <p className="text-xs text-[var(--color-text-muted)] text-center py-4">Nenhum servico cadastrado</p>
              )}
            </div>
          ) : (
            <CollaboratorScheduleEditor collaboratorId={collaborator.id} />
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-[var(--color-rose)] font-medium">{error}</p>
      )}
    </Modal>
  );
}
