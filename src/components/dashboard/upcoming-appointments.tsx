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

function formatTime(time: string): string {
  return time.slice(0, 5);
}

export function UpcomingAppointments({ appointments }: { appointments: Appointment[] }) {
  const items = appointments.slice(0, 10);

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
      <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-5">
        Proximos Agendamentos
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] py-8 text-center">
          Nenhum agendamento para hoje
        </p>
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
                className="flex items-center gap-4 py-3.5 border-b border-[var(--color-border-light)] last:border-b-0"
              >
                {/* Time */}
                <div className="w-14 shrink-0">
                  <span className="text-sm font-semibold text-[var(--color-accent)]">
                    {formatTime(appt.start_time)}
                  </span>
                </div>

                {/* Client + services */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {appt.client?.name ?? 'Cliente'}
                  </div>
                  {services && (
                    <div className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
                      {services}
                    </div>
                  )}
                </div>

                {/* Collaborator */}
                <div className="hidden sm:block shrink-0">
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {appt.collaborator?.name}
                  </span>
                </div>

                {/* Status */}
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
