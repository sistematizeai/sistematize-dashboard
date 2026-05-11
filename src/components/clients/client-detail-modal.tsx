'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Client, Appointment, AppointmentStatus } from '@/types';
import api from '@/lib/api-client';

const SOURCE_OPTIONS = [
  { value: '', label: 'Selecione...' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Indicacao', label: 'Indicacao' },
  { value: 'Google', label: 'Google' },
  { value: 'Outro', label: 'Outro' },
];

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  in_progress: 'Em Andamento',
  completed: 'Concluido',
  cancelled: 'Cancelado',
  no_show: 'No-Show',
};

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all';

const currency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const formatDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');

export function ClientDetailModal({
  client,
  onClose,
  onSaved,
}: {
  client: Client;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: client.name,
    phone: client.phone || '',
    email: client.email || '',
    birth_date: client.birth_date || '',
    source: client.source || '',
    notes: client.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // KPI calculations
  const appointments = client.appointments || [];
  const completedAppointments = appointments.filter((a) => a.status === 'completed');
  const totalSpent = completedAppointments.reduce((sum, a) => sum + a.total_price, 0);
  const visits = completedAppointments.length;
  const averageTicket = visits > 0 ? totalSpent / visits : 0;
  const noShows = appointments.filter((a) => a.status === 'no_show').length;

  // Sorted appointments for timeline
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Nome e obrigatorio.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.put(`/api/clients/${client.id}`, {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        birth_date: form.birth_date || null,
        source: form.source || null,
        notes: form.notes.trim() || null,
      });
      onSaved();
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Tem certeza que deseja excluir este cliente? Esta acao nao pode ser desfeita.')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/clients/${client.id}`);
      onSaved();
    } catch {
      setError('Erro ao excluir. Tente novamente.');
      setDeleting(false);
    }
  }

  return (
    <Modal open onClose={onClose} maxWidth="860px">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7B8AF2] to-[#4F5AE5] flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-[0_4px_12px_rgba(79,90,229,0.25)]">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-[var(--color-text-primary)] truncate">
            {client.name}
          </h2>
          <div className="flex items-center gap-3 mt-0.5">
            {client.phone && (
              <span className="text-sm text-[var(--color-text-secondary)]">{client.phone}</span>
            )}
            {client.email && (
              <span className="text-sm text-[var(--color-text-muted)]">{client.email}</span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <KpiMini label="Total Gasto" value={currency(totalSpent)} color="var(--color-green)" bgColor="var(--color-green-soft)" />
        <KpiMini label="Visitas" value={String(visits)} color="var(--color-accent)" bgColor="var(--color-accent-soft)" />
        <KpiMini label="Ticket Medio" value={currency(averageTicket)} color="var(--color-blue)" bgColor="var(--color-blue-soft)" />
        <KpiMini label="No-Shows" value={String(noShows)} color="var(--color-rose)" bgColor="var(--color-rose-soft)" />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-[1fr_1fr] gap-6">
        {/* Left: Editable form */}
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">
            Dados do Cliente
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                Nome *
              </label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                Telefone
              </label>
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="(00) 00000-0000" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                Email
              </label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="email@exemplo.com" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                Nascimento
              </label>
              <input type="date" value={form.birth_date} onChange={(e) => update('birth_date', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                Como Conheceu
              </label>
              <select value={form.source} onChange={(e) => update('source', e.target.value)} className={inputClass}>
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                Observacoes
              </label>
              <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} placeholder="Anotacoes..." className={inputClass + ' resize-none'} />
            </div>
          </div>

          {error && (
            <p className="text-xs text-[var(--color-rose)] font-medium mt-3">{error}</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        {/* Right: Appointment history */}
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">
            Historico de Atendimentos
          </h3>

          {sortedAppointments.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 stroke-[var(--color-text-muted)] stroke-[1.5] fill-none" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">Nenhum atendimento registrado</p>
            </div>
          ) : (
            <div className="space-y-0 max-h-[420px] overflow-y-auto pr-1">
              {sortedAppointments.map((appt, idx) => (
                <AppointmentTimelineItem key={appt.id} appointment={appt} isLast={idx === sortedAppointments.length - 1} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-5 border-t border-[var(--color-border)] flex items-center justify-between">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-5 py-2.5 rounded-xl border border-[var(--color-rose)] text-[var(--color-rose)] text-sm font-semibold hover:bg-[var(--color-rose-soft)] transition-all cursor-pointer disabled:opacity-50"
        >
          {deleting ? 'Excluindo...' : 'Excluir Cliente'}
        </button>
        <div className="flex items-center gap-2">
          {client.phone && (
            <a
              href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#25d366] text-[#25d366] text-sm font-semibold hover:bg-[rgba(37,211,102,0.08)] transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#25d366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          )}
          <a
            href={`/dashboard/appointments?modal=new-appointment`}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 stroke-white stroke-2 fill-none" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agendar
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* --- Sub-components --- */

function KpiMini({
  label,
  value,
  color,
  bgColor,
}: {
  label: string;
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div
      className="rounded-xl p-3.5 border border-[var(--color-border)]"
      style={{ background: bgColor }}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color }}>
        {label}
      </div>
      <div className="text-lg font-extrabold text-[var(--color-text-primary)]">{value}</div>
    </div>
  );
}

function AppointmentTimelineItem({
  appointment,
  isLast,
}: {
  appointment: Appointment;
  isLast: boolean;
}) {
  const services =
    appointment.appointment_services
      ?.map((s) => s.service?.name)
      .filter(Boolean)
      .join(', ') || 'Servico nao especificado';

  const collaboratorName = appointment.collaborator?.name || '';

  return (
    <div className="flex gap-3">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center pt-1">
        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] shrink-0" />
        {!isLast && <div className="w-px flex-1 bg-[var(--color-border)] mt-1" />}
      </div>

      {/* Content */}
      <div className="pb-4 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-bold text-[var(--color-text-primary)]">
            {formatDate(appointment.date)}
          </span>
          <Badge variant={appointment.status as AppointmentStatus}>
            {STATUS_LABELS[appointment.status] || appointment.status}
          </Badge>
        </div>

        <p className="text-xs text-[var(--color-text-secondary)] truncate">{services}</p>

        <div className="flex items-center justify-between mt-1">
          {collaboratorName && (
            <span className="text-[11px] text-[var(--color-text-muted)]">
              com {collaboratorName}
            </span>
          )}
          <span className="text-xs font-bold text-[var(--color-text-primary)] ml-auto">
            {currency(appointment.total_price)}
          </span>
        </div>
      </div>
    </div>
  );
}
