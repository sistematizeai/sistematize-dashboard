'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ServiceRevenue } from '@/types';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const BAR_COLORS = [
  '#4F5AE5', '#4A6CF7', '#10b981', '#f59e0b',
  '#ef4444', '#7B8AF2', '#06b6d4', '#ec4899',
];

export function ServiceRevenueChart({ data }: { data: ServiceRevenue[] }) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
      <div className="mb-5">
        <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Receita por Servico</h2>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Top servicos do periodo</p>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="20" x2="12" y2="10" />
              <line x1="18" y1="20" x2="18" y2="4" />
              <line x1="6" y1="20" x2="6" y2="16" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Sem dados de receita</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-[240px]">
            A receita por servico sera exibida quando houver agendamentos concluidos.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(data.length * 44, 160)}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <XAxis
              type="number"
              tickFormatter={(v) => `R$${v}`}
              tick={{ fontSize: 11, fill: '#9098ad' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: '#374151' }}
              axisLine={false}
              tickLine={false}
              width={120}
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
              cursor={{ fill: 'rgba(79,90,229,0.04)' }}
            />
            <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={24}>
              {data.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
