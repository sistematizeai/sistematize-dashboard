'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { RevenueChartPoint } from '@/types';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function formatDay(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function RevenueChart({ data }: { data: RevenueChartPoint[] }) {
  const total = data.reduce((sum, d) => sum + d.revenue, 0);
  const periodLabel = data.length <= 10 ? 'Ultimos 7 dias' : 'Ultimos 30 dias';

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Faturamento</h2>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{periodLabel}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold text-[var(--color-text-primary)]">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {data.length === 0 || total === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Sem dados de faturamento</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-[240px]">
            O faturamento sera exibido quando houver agendamentos concluidos.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4F5AE5" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#4F5AE5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDay}
              tick={{ fontSize: 11, fill: '#9098ad' }}
              axisLine={false}
              tickLine={false}
              interval={Math.max(Math.floor(data.length / 7) - 1, 0)}
            />
            <YAxis
              tickFormatter={(v) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`}
              tick={{ fontSize: 11, fill: '#9098ad' }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 12,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                fontSize: 13,
              }}
              formatter={(value: unknown) => [formatCurrency(Number(value)), 'Receita']}
              labelFormatter={(label: unknown) => formatDay(String(label))}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#4F5AE5"
              strokeWidth={2.5}
              fill="url(#revenueGrad)"
              dot={false}
              activeDot={{ r: 5, fill: '#4F5AE5', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
