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

const SOURCE_LABELS: Record<string, string> = {
  manual: 'Manual',
  whatsapp: 'WhatsApp',
  public_page: 'Pagina Publica',
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function formatTime(time: string) {
  return time.slice(0, 5);
}

interface AppointmentCardProps {
  appointment: Appointment;
  onClick: (appointment: Appointment) => void;
  onStatusChange?: (id: string, status: AppointmentStatus) => void;
  compact?: boolean;
}

export function AppointmentCard({ appointment, onClick, onStatusChange, compact }: AppointmentCardProps) {
  const services = appointment.appointment_services || [];
  const totalDuration = services.reduce((sum, s) => sum + s.duration_minutes, 0) || appointment.total_duration;

  const quickActions = getQuickActions(appointment.status);

  return (
    <div
      onClick={() => onClick(appointment)}
      className="bg-white rounded-2xl border border-[var(--color-border)] p-5 cursor-pointer hover:border-[var(--color-accent-light)] hover:shadow-[0_4px_16px_rgba(79,90,229,0.08)] transition-all group"
    >
      {/* Time + Duration + Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--color-text-primary)]">
            {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
          </span>
          <span className="text-[11px] text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] px-1.5 py-0.5 rounded-md">
            {totalDuration}min
          </span>
        </div>
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

      {/* Footer: collaborator + source + price */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-light)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7B8AF2] to-[#4F5AE5] flex items-center justify-center text-[10px] font-bold text-white">
            {appointment.collaborator?.name?.charAt(0)?.toUpperCase() || 'C'}
          </div>
          <span className="text-xs text-[var(--color-text-secondary)] font-medium">
            {appointment.collaborator?.name || 'Colaborador'}
          </span>
          {appointment.source && (
            <>
              <span className="text-[var(--color-text-muted)]">·</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                {SOURCE_LABELS[appointment.source] || appointment.source}
              </span>
            </>
          )}
        </div>
        <span className="text-sm font-bold text-[var(--color-text-primary)]">
          {formatCurrency(appointment.total_price)}
        </span>
      </div>

      {/* Quick Actions */}
      {!compact && onStatusChange && quickActions.length > 0 && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border-light)]">
          {quickActions.map((action) => (
            <button
              key={action.status}
              onClick={(e) => { e.stopPropagation(); onStatusChange(appointment.id, action.status); }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${action.className}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getQuickActions(status: AppointmentStatus): { label: string; status: AppointmentStatus; className: string }[] {
  switch (status) {
    case 'scheduled':
      return [
        { label: 'Confirmar', status: 'confirmed', className: 'bg-[var(--color-green-soft)] text-[var(--color-green)] hover:bg-[var(--color-green)] hover:text-white' },
        { label: 'Cancelar', status: 'cancelled', className: 'bg-[var(--color-rose-soft)] text-[var(--color-rose)] hover:bg-[var(--color-rose)] hover:text-white' },
      ];
    case 'confirmed':
      return [
        { label: 'Iniciar', status: 'in_progress', className: 'bg-[var(--color-blue-soft)] text-[var(--color-blue)] hover:bg-[var(--color-blue)] hover:text-white' },
        { label: 'Cancelar', status: 'cancelled', className: 'bg-[var(--color-rose-soft)] text-[var(--color-rose)] hover:bg-[var(--color-rose)] hover:text-white' },
      ];
    case 'in_progress':
      return [
        { label: 'Concluir', status: 'completed', className: 'bg-[var(--color-green-soft)] text-[var(--color-green)] hover:bg-[var(--color-green)] hover:text-white' },
        { label: 'No-show', status: 'no_show', className: 'bg-[var(--color-amber-soft)] text-[var(--color-amber)] hover:bg-[var(--color-amber)] hover:text-white' },
      ];
    default:
      return [];
  }
}
