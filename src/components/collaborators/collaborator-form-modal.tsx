'use client';

import { useState } from 'react';
import { Modal, modalInputClass, modalLabelClass } from '@/components/ui/modal';
import { Service } from '@/types';
import api from '@/lib/api-client';
import { maskPhone, maskCPF } from '@/lib/masks';

export function CollaboratorFormModal({
  allServices,
  onClose,
  onCreated,
}: {
  allServices: Service[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', cpf: '', birth_date: '',
    base_commission: 0, work_start: '08:00', work_end: '18:00',
    address: '', notes: '',
  });
  const [serviceMap, setServiceMap] = useState<Record<string, { enabled: boolean; commission: string }>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleService = (id: string) => {
    setServiceMap((prev) => ({ ...prev, [id]: { ...prev[id], enabled: !prev[id]?.enabled } }));
  };

  const setCommission = (id: string, val: string) => {
    setServiceMap((prev) => ({ ...prev, [id]: { ...prev[id], commission: val } }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Nome e obrigatorio.'); return; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Email invalido.'); return; }
    if (form.base_commission < 0 || form.base_commission > 100) { setError('Comissao deve ser entre 0 e 100.'); return; }
    if (form.work_start >= form.work_end) { setError('Inicio da jornada deve ser antes do fim.'); return; }
    setSaving(true);
    setError('');
    try {
      const { data: created } = await api.post('/api/collaborators', {
        name: form.name, phone: form.phone || null, email: form.email || null,
        cpf: form.cpf || null, birth_date: form.birth_date || null,
        base_commission: form.base_commission, work_start: form.work_start, work_end: form.work_end,
        address: form.address || null, notes: form.notes || null,
      });

      const services = Object.entries(serviceMap)
        .filter(([, v]) => v.enabled)
        .map(([service_id, v]) => ({ service_id, commission: v.commission ? Number(v.commission) : null }));
      if (services.length > 0) {
        await api.put(`/api/collaborators/${created.id}/services`, { services });
      }

      onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao criar colaborador. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      maxWidth="920px"
      title="Novo Colaborador"
      footer={
        <>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer disabled:opacity-50">
            {saving ? 'Salvando...' : 'Criar Colaborador'}
          </button>
        </>
      }
    >
      <div className="flex gap-6">
        <div className="flex-1 space-y-3.5">
          <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Dados do Colaborador</h3>
          <div>
            <label className={modalLabelClass}>Nome *</label>
            <input className={modalInputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={modalLabelClass}>Telefone</label>
              <input className={modalInputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label className={modalLabelClass}>Email</label>
              <input className={modalInputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={modalLabelClass}>CPF</label>
              <input className={modalInputClass} value={form.cpf} onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })} placeholder="000.000.000-00" />
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
        </div>

        {/* Right: Centro Quantico */}
        <div className="w-[360px] shrink-0 rounded-2xl p-5 bg-gradient-to-br from-[#fdf6e3] to-[#fef3cd] border border-[rgba(245,158,11,0.2)]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600/70">Centro Quantico</span>
          <h3 className="text-lg font-extrabold text-[var(--color-text-primary)] mt-1">{form.name || 'Novo colaborador'}</h3>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 mb-4">
            Gerencie categorias, servicos ativos e comissao individual por atendimento.
          </p>

          {/* Mini KPIs */}
          <div className="grid grid-cols-3 gap-2 mb-4">
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

          {/* Services list */}
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600/70">Servicos & Comissoes</span>
          <div className="mt-2 max-h-[320px] overflow-y-auto space-y-1.5">
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
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-[var(--color-rose)] font-medium">{error}</p>
      )}
    </Modal>
  );
}
