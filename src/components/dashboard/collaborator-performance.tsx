'use client';

import type { CollaboratorPerformanceData } from '@/types';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const AVATAR_COLORS = [
  'linear-gradient(135deg, #4F5AE5, #7B8AF2)',
  'linear-gradient(135deg, #4A6CF7, #7B9CFA)',
  'linear-gradient(135deg, #059669, #34d399)',
  'linear-gradient(135deg, #d97706, #fbbf24)',
  'linear-gradient(135deg, #e11d48, #fb7185)',
];

export function CollaboratorPerformance({ data }: { data: CollaboratorPerformanceData[] }) {
  const maxRevenue = Math.max(...data.map((c) => c.revenue), 1);

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
      <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-5">
        Desempenho dos Colaboradores
      </h2>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Sem dados de desempenho</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-[240px]">
            O desempenho dos colaboradores sera exibido quando houver agendamentos concluidos.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((collab, idx) => {
            const barWidth = (collab.revenue / maxRevenue) * 100;
            const initial = collab.name?.charAt(0).toUpperCase() || '?';
            const gradient = AVATAR_COLORS[idx % AVATAR_COLORS.length];

            return (
              <div key={collab.id} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: gradient }}
                  >
                    {initial}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                        {collab.name}
                      </span>
                      <span className="text-sm font-bold text-[var(--color-text-primary)] ml-3 shrink-0">
                        {formatCurrency(collab.revenue)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        {collab.appointments_count} agendamento{collab.appointments_count !== 1 ? 's' : ''}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        Ticket medio: {formatCurrency(collab.ticket_medio)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-1.5 bg-[var(--color-bg-surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%`, background: 'var(--color-accent)' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
