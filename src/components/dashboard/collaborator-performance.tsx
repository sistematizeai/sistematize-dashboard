'use client';

interface CollaboratorPerformanceData {
  collaborator_id: string;
  collaborator_name: string;
  total_appointments: number;
  total_revenue: number;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const AVATAR_COLORS = [
  'linear-gradient(135deg, #7c3aed, #a78bfa)',
  'linear-gradient(135deg, #2563eb, #60a5fa)',
  'linear-gradient(135deg, #059669, #34d399)',
  'linear-gradient(135deg, #d97706, #fbbf24)',
  'linear-gradient(135deg, #e11d48, #fb7185)',
];

export function CollaboratorPerformance({ data }: { data: CollaboratorPerformanceData[] }) {
  const maxRevenue = Math.max(...data.map((c) => c.total_revenue), 1);

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
      <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-5">
        Desempenho dos Colaboradores
      </h2>

      {data.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] py-8 text-center">
          Nenhum dado de desempenho disponivel
        </p>
      ) : (
        <div className="space-y-5">
          {data.map((collab, idx) => {
            const barWidth = (collab.total_revenue / maxRevenue) * 100;
            const initial = collab.collaborator_name.charAt(0).toUpperCase();
            const gradient = AVATAR_COLORS[idx % AVATAR_COLORS.length];

            return (
              <div key={collab.collaborator_id} className="space-y-2.5">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: gradient }}
                  >
                    {initial}
                  </div>

                  {/* Name + stats */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {collab.collaborator_name}
                      </span>
                      <span className="text-sm font-semibold text-[var(--color-text-primary)] ml-3 shrink-0">
                        {formatCurrency(collab.total_revenue)}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {collab.total_appointments} agendamento{collab.total_appointments !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-[var(--color-bg-surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${barWidth}%`,
                      background: 'var(--color-accent)',
                    }}
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
