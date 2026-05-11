'use client';

import { Badge } from '@/components/ui/badge';
import type { Appointment, AppointmentStatus } from '@/types';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  in_progress: 'Em Andamento',
  completed: 'Concluido',
  cancelled: 'Cancelado',
  no_show: 'No-Show',
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function formatTime(time: string): string {
  return time.slice(0, 5);
}

export function UpcomingAppointments({ appointments }: { appointments: Appointment[] }) {
  const items = appointments.slice(0, 10);

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Proximos Agendamentos</h2>
        <span className="text-[11px] font-medium text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] px-2.5 py-1 rounded-lg">
          Hoje
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Nenhum agendamento para hoje</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-[240px]">
            Agendamentos confirmados ou agendados para hoje aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {items.map((appt) => {
            const services = appt.appointment_services
              ?.map((s) => s.service?.name)
              .filter(Boolean)
              .join(', ');

            return (
              <div
                key={appt.id}
                className="flex items-center gap-3 py-3 border-b border-[var(--color-border-light)] last:border-b-0"
              >
                <div className="w-14 shrink-0">
                  <span className="text-sm font-bold text-[var(--color-accent)]">
                    {formatTime(appt.start_time)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {appt.client?.name ?? 'Cliente'}
                  </div>
                  {services && (
                    <div className="text-[11px] text-[var(--color-text-muted)] truncate mt-0.5">
                      {services}
                    </div>
                  )}
                </div>

                <div className="hidden sm:block shrink-0">
                  <span className="text-[11px] text-[var(--color-text-secondary)]">
                    {appt.collaborator?.name}
                  </span>
                </div>

                <div className="hidden md:block shrink-0">
                  <span className="text-xs font-semibold text-[var(--color-green)]">
                    {formatCurrency(Number(appt.total_price) || 0)}
                  </span>
                </div>

                <div className="shrink-0">
                  <Badge variant={appt.status}>
                    {STATUS_LABELS[appt.status] ?? appt.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
