'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import type { DailyAppointmentPoint } from '@/types';

export function DailyAppointmentsChart({ data }: { data: DailyAppointmentPoint[] }) {
  const totalWeek = data.reduce((s, d) => s + d.total, 0);

  const chartData = data.map((d) => ({
    ...d,
    other: Math.max(0, d.total - d.completed - d.cancelled),
  }));

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Agendamentos Diarios</h2>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Ultimos 7 dias</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold text-[var(--color-text-primary)]">{totalWeek}</span>
          <p className="text-[10px] text-[var(--color-text-muted)]">na semana</p>
        </div>
      </div>

      {totalWeek === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Sem agendamentos no periodo</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-[240px]">
            O historico de agendamentos diarios aparecera aqui.
          </p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#9098ad', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#9098ad' }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 12,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  fontSize: 12,
                }}
                formatter={(value: unknown, name: unknown) => {
                  const labels: Record<string, string> = { completed: 'Finalizados', other: 'Agendados', cancelled: 'Cancelados' };
                  return [Number(value), labels[String(name)] || String(name)];
                }}
                labelFormatter={(_label: unknown, payload: readonly { payload?: DailyAppointmentPoint }[]) => {
                  const p = payload?.[0]?.payload;
                  if (!p) return '';
                  const d = new Date(p.date + 'T00:00:00');
                  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', weekday: 'short' });
                }}
              />
              <Bar dataKey="completed" stackId="a" fill="#10b981" maxBarSize={36} name="completed" />
              <Bar dataKey="other" stackId="a" maxBarSize={36} name="other">
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.is_today ? '#4F5AE5' : 'rgba(74,108,247,0.35)'} />
                ))}
              </Bar>
              <Bar dataKey="cancelled" stackId="a" fill="#ef4444" maxBarSize={36} radius={[4, 4, 0, 0]} name="cancelled" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-5 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span className="text-[11px] text-[var(--color-text-muted)]">Finalizados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#4A6CF7]" />
              <span className="text-[11px] text-[var(--color-text-muted)]">Agendados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              <span className="text-[11px] text-[var(--color-text-muted)]">Cancelados</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
