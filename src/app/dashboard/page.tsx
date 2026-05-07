'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api-client';
import { KpiCard } from '@/components/ui/kpi-card';
import { CollaboratorPerformance } from '@/components/dashboard/collaborator-performance';
import { UpcomingAppointments } from '@/components/dashboard/upcoming-appointments';
import type { DashboardStats, Appointment, CollaboratorPerformanceData } from '@/types';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [performance, setPerformance] = useState<CollaboratorPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setError(null);
      const [statsRes, upcomingRes, perfRes] = await Promise.all([
        api.get<DashboardStats>('/api/dashboard/stats'),
        api.get<Appointment[]>('/api/dashboard/upcoming'),
        api.get<CollaboratorPerformanceData[]>('/api/dashboard/collaborator-performance'),
      ]);
      setStats(statsRes.data);
      setUpcoming(upcomingRes.data);
      setPerformance(perfRes.data);
    } catch {
      setError('Erro ao carregar dados do dashboard. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-[var(--color-rose-soft)] border border-[rgba(239,68,68,0.2)] rounded-xl text-[var(--color-rose)] text-sm font-medium flex items-center justify-between">
          {error}
          <button onClick={fetchData} className="ml-3 underline cursor-pointer">Tentar novamente</button>
        </div>
      )}
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Visao geral do seu negocio
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="Agendamentos"
          value={stats?.appointments ?? 0}
          iconBg="var(--color-accent-soft)"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
        <KpiCard
          label="Faturamento"
          value={formatCurrency(stats?.revenue ?? 0)}
          iconBg="var(--color-green-soft)"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <KpiCard
          label="Novos Clientes"
          value={stats?.new_clients ?? 0}
          iconBg="var(--color-blue-soft)"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          }
        />
        <KpiCard
          label="Taxa No-Show"
          value={`${stats?.no_show_rate ?? 0}%`}
          iconBg="var(--color-rose-soft)"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-rose)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CollaboratorPerformance data={performance} />
        <UpcomingAppointments appointments={upcoming} />
      </div>
    </div>
  );
}
