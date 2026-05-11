'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { PopularService } from '@/types';

const COLORS = ['#4F5AE5', '#4A6CF7', '#7B8AF2', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#9ca3af'];

export function PopularServicesChart({ data }: { data: PopularService[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const chartData = data.map((d, i) => ({
    name: d.name,
    value: d.count,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Servicos Populares</h2>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Por numero de agendamentos</p>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Sem dados suficientes</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-[240px]">
            Os servicos mais populares aparecerão aqui quando houver agendamentos concluidos.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-[160px] h-[160px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: 12,
                  }}
                  formatter={(value: unknown) => { const v = Number(value); return [`${v} agendamento${v !== 1 ? 's' : ''} (${Math.round((v / total) * 100)}%)`, '']; }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 space-y-2">
            {chartData.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
                  <span className="text-xs text-[var(--color-text-secondary)] truncate">{entry.name}</span>
                </div>
                <span className="text-xs font-bold text-[var(--color-text-primary)] shrink-0 ml-2">{entry.value}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--color-text-muted)]">Total</span>
                <span className="text-sm font-extrabold text-[var(--color-text-primary)]">{total}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
