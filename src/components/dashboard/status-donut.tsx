'use client';

import type { StatusCount } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  scheduled: { label: 'Agendado', color: '#4F5AE5', bg: 'rgba(79,90,229,0.07)' },
  confirmed: { label: 'Confirmado', color: '#4A6CF7', bg: 'rgba(74,108,247,0.08)' },
  in_progress: { label: 'Em Andamento', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  completed: { label: 'Concluido', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  cancelled: { label: 'Cancelado', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
  no_show: { label: 'No-Show', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
};

export function StatusList({ data }: { data: StatusCount[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const items = Object.entries(STATUS_CONFIG).map(([key, config]) => {
    const found = data.find((d) => d.status === key);
    return { status: key, ...config, count: found?.count ?? 0 };
  });

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Status dos Agendamentos</h2>
        <span className="text-2xl font-extrabold text-[var(--color-text-primary)]">{total}</span>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <line x1="9" y1="12" x2="15" y2="12" />
              <line x1="9" y1="16" x2="13" y2="16" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Sem agendamentos no periodo</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-[240px]">
            Os status dos agendamentos aparecerão aqui quando houver dados.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items
            .filter((s) => s.count > 0)
            .map((s) => (
              <div
                key={s.status}
                className="flex items-center justify-between py-2.5 px-3.5 rounded-xl transition-all hover:scale-[1.01]"
                style={{ background: s.bg }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-sm font-medium" style={{ color: s.color }}>
                    {s.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--color-text-primary)]">{s.count}</span>
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    ({Math.round((s.count / total) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
