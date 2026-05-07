'use client';

import { Appointment, AppointmentStatus } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  in_progress: 'Em Atendimento',
  completed: 'Concluido',
  cancelled: 'Cancelado',
  no_show: 'Nao Compareceu',
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function formatTime(time: string) {
  return time.slice(0, 5);
}

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  onClose: () => void;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
}

export function AppointmentDetailModal({
  appointment,
  onClose,
  onStatusChange,
}: AppointmentDetailModalProps) {
  if (!appointment) return null;

  const services = appointment.appointment_services || [];

  return (
    <Modal open={!!appointment} onClose={onClose} maxWidth="780px">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pr-10">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--color-text-primary)] mb-1">
            {appointment.client?.name || 'Cliente'}
          </h2>
          <div className="flex items-center gap-3">
            {appointment.client?.phone && (
              <span className="text-sm text-[var(--color-text-muted)]">
                {appointment.client.phone}
              </span>
            )}
            {appointment.client?.email && (
              <span className="text-sm text-[var(--color-text-muted)]">
                {appointment.client.email}
              </span>
            )}
          </div>
        </div>
        <Badge variant={appointment.status}>{STATUS_LABELS[appointment.status]}</Badge>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-[var(--color-bg-surface)] rounded-xl p-4">
          <div className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Total
          </div>
          <div className="text-lg font-extrabold text-[var(--color-text-primary)]">
            {formatCurrency(appointment.total_price)}
          </div>
        </div>
        <div className="bg-[var(--color-bg-surface)] rounded-xl p-4">
          <div className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Duracao
          </div>
          <div className="text-lg font-extrabold text-[var(--color-text-primary)]">
            {appointment.total_duration} min
          </div>
        </div>
        <div className="bg-[var(--color-bg-surface)] rounded-xl p-4">
          <div className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Pagamento
          </div>
          <div className="text-lg font-extrabold text-[var(--color-text-primary)]">
            {appointment.payment_method || 'Pendente'}
          </div>
        </div>
        <div className="bg-[var(--color-bg-surface)] rounded-xl p-4">
          <div className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Fonte
          </div>
          <div className="text-lg font-extrabold text-[var(--color-text-primary)] capitalize">
            {appointment.source || '-'}
          </div>
        </div>
      </div>

      {/* Date / Time / Collaborator */}
      <div className="flex items-center gap-4 mb-6 text-sm text-[var(--color-text-secondary)]">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 stroke-[var(--color-text-muted)] stroke-2 fill-none" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="font-medium">
            {new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 stroke-[var(--color-text-muted)] stroke-2 fill-none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="font-medium">
            {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center text-[9px] font-bold text-white">
            {appointment.collaborator?.name?.charAt(0)?.toUpperCase() || 'C'}
          </div>
          <span className="font-medium">{appointment.collaborator?.name || 'Colaborador'}</span>
        </div>
      </div>

      {/* Services list */}
      {services.length > 0 && (
        <div className="mb-6">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
            Servicos
          </h3>
          <div className="bg-[var(--color-bg-surface)] rounded-xl overflow-hidden">
            {services.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center justify-between px-4 py-3 ${
                  i < services.length - 1 ? 'border-b border-[var(--color-border-light)]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {s.service?.name || 'Servico'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {s.duration_minutes} min
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {formatCurrency(s.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {appointment.notes && (
        <div className="mb-6">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
            Observacoes
          </h3>
          <div className="bg-[var(--color-bg-surface)] rounded-xl p-4">
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {appointment.notes}
            </p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {renderActions(appointment, onStatusChange)}
    </Modal>
  );
}

function renderActions(
  appointment: Appointment,
  onStatusChange: (id: string, status: AppointmentStatus) => void,
) {
  const { status, id } = appointment;

  if (status === 'completed' || status === 'cancelled' || status === 'no_show') {
    return null;
  }

  return (
    <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-border-light)]">
      {status === 'scheduled' && (
        <>
          <button
            onClick={() => onStatusChange(id, 'confirmed')}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-green)] text-white text-sm font-semibold hover:opacity-90 transition-all cursor-pointer"
          >
            Confirmar
          </button>
          <button
            onClick={() => onStatusChange(id, 'cancelled')}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-rose)] text-white text-sm font-semibold hover:opacity-90 transition-all cursor-pointer"
          >
            Cancelar
          </button>
        </>
      )}

      {status === 'confirmed' && (
        <>
          <button
            onClick={() => onStatusChange(id, 'in_progress')}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-blue)] text-white text-sm font-semibold hover:opacity-90 transition-all cursor-pointer"
          >
            Iniciar Atendimento
          </button>
          <button
            onClick={() => onStatusChange(id, 'cancelled')}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-rose)] text-white text-sm font-semibold hover:opacity-90 transition-all cursor-pointer"
          >
            Cancelar
          </button>
        </>
      )}

      {status === 'in_progress' && (
        <>
          <button
            onClick={() => onStatusChange(id, 'completed')}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-green)] text-white text-sm font-semibold hover:opacity-90 transition-all cursor-pointer"
          >
            Finalizar
          </button>
          <button
            onClick={() => onStatusChange(id, 'no_show')}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-amber)] text-white text-sm font-semibold hover:opacity-90 transition-all cursor-pointer"
          >
            Nao Compareceu
          </button>
        </>
      )}
    </div>
  );
}
