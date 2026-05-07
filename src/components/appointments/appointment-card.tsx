'use client';

import { Appointment, AppointmentStatus } from '@/types';
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
  // time comes as "HH:MM:SS" or "HH:MM"
  return time.slice(0, 5);
}

interface AppointmentCardProps {
  appointment: Appointment;
  onClick: (appointment: Appointment) => void;
}

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  const services = appointment.appointment_services || [];

  return (
    <div
      onClick={() => onClick(appointment)}
      className="bg-white rounded-2xl border border-[var(--color-border)] p-5 cursor-pointer hover:border-[var(--color-accent-light)] hover:shadow-[0_4px_16px_rgba(124,58,237,0.08)] transition-all group"
    >
      {/* Time + Status */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-[var(--color-text-primary)]">
          {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
        </span>
        <Badge variant={appointment.status}>{STATUS_LABELS[appointment.status]}</Badge>
      </div>

      {/* Client */}
      <div className="mb-3">
        <div className="text-[15px] font-semibold text-[var(--color-text-primary)] leading-tight">
          {appointment.client?.name || 'Cliente'}
        </div>
        {appointment.client?.phone && (
          <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {appointment.client.phone}
          </div>
        )}
      </div>

      {/* Services */}
      {services.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {services.map((s) => (
            <span
              key={s.id}
              className="px-2.5 py-1 rounded-lg bg-[var(--color-bg-surface)] text-[11px] font-medium text-[var(--color-text-secondary)]"
            >
              {s.service?.name || 'Servico'}
            </span>
          ))}
        </div>
      )}

      {/* Footer: collaborator + price */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-light)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center text-[10px] font-bold text-white">
            {appointment.collaborator?.name?.charAt(0)?.toUpperCase() || 'C'}
          </div>
          <span className="text-xs text-[var(--color-text-secondary)] font-medium">
            {appointment.collaborator?.name || 'Colaborador'}
          </span>
        </div>
        <span className="text-sm font-bold text-[var(--color-text-primary)]">
          {formatCurrency(appointment.total_price)}
        </span>
      </div>

      {/* Notes preview */}
      {appointment.notes && (
        <div className="mt-3 pt-3 border-t border-[var(--color-border-light)]">
          <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 italic">
            {appointment.notes}
          </p>
        </div>
      )}
    </div>
  );
}
