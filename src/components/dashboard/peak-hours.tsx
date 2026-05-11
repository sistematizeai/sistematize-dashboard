'use client';

import type { PeakHourDay } from '@/types';

function getColor(pct: number): string {
  if (pct === 0) return 'var(--color-bg-surface)';
  if (pct <= 20) return 'rgba(74,108,247,0.12)';
  if (pct <= 40) return 'rgba(74,108,247,0.25)';
  if (pct <= 60) return 'rgba(74,108,247,0.45)';
  if (pct <= 80) return 'rgba(108,92,231,0.6)';
  return 'rgba(108,92,231,0.85)';
}

export function PeakHours({ data }: { data: PeakHourDay[] }) {
  const hasData = data.length > 0 && data.some((d) => d.hours.some((h) => h.count > 0));

  if (!data.length) return null;

  const hours = data[0]?.hours.map((h) => h.hour) || [];

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Horarios de Pico</h2>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
          Concentracao de agendamentos por dia e horario (ultimos 30 dias)
        </p>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Sem dados suficientes</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-[240px]">
            Os horarios de pico serao exibidos quando houver agendamentos suficientes.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex items-center gap-[3px] mb-1 pl-10">
              {hours.map((h) => (
                <div key={h} className="flex-1 text-[10px] text-[var(--color-text-muted)] text-center">
                  {h.replace(':00', 'h')}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-[3px]">
              {data.map((row) => (
                <div key={row.day} className="flex items-center gap-[3px]">
                  <span className="w-8 text-[11px] font-semibold text-[var(--color-text-secondary)] shrink-0 text-right mr-1">
                    {row.day}
                  </span>
                  {row.hours.map((slot) => (
                    <div
                      key={slot.hour}
                      className="flex-1 h-7 rounded-[4px] transition-colors relative group cursor-default"
                      style={{ backgroundColor: getColor(slot.percentage) }}
                    >
                      {slot.count > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[9px] font-bold text-white bg-[var(--color-text-primary)] rounded px-1.5 py-0.5 shadow-lg whitespace-nowrap z-10">
                            {slot.count} agend.
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 mt-3">
              <span className="text-[10px] text-[var(--color-text-muted)]">Menos</span>
              {[0, 20, 40, 60, 80, 100].map((pct) => (
                <div key={pct} className="w-4 h-4 rounded-[3px]" style={{ backgroundColor: getColor(pct) }} />
              ))}
              <span className="text-[10px] text-[var(--color-text-muted)]">Mais</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
