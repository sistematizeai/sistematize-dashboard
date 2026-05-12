'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import api from '@/lib/api-client';
import { KpiCard } from '@/components/ui/kpi-card';
import { CollaboratorPerformance } from '@/components/dashboard/collaborator-performance';
import { UpcomingAppointments } from '@/components/dashboard/upcoming-appointments';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { StatusList } from '@/components/dashboard/status-donut';
import { ServiceRevenueChart } from '@/components/dashboard/service-revenue-chart';
import { RecentClients } from '@/components/dashboard/recent-clients';
import { PeakHours } from '@/components/dashboard/peak-hours';
import { DailyAppointmentsChart } from '@/components/dashboard/daily-appointments-chart';
import { PopularServicesChart } from '@/components/dashboard/popular-services-chart';
import type {
  Client,
  DashboardStats,
  Appointment,
  CollaboratorPerformanceData,
  RevenueChartPoint,
  StatusCount,
  ServiceRevenue,
  PopularService,
  PeakHourDay,
  DailyAppointmentPoint,
} from '@/types';

type Period = 'today' | '7d' | '30d';

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Resumo de hoje',
  '7d': 'Ultimos 7 dias',
  '30d': 'Ultimos 30 dias',
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function formatTrend(value: number | null | undefined): string | undefined {
  if (value == null) return undefined;
  return `${value > 0 ? '+' : ''}${value}%`;
}

function trendColor(value: number | null | undefined, inverted = false): string {
  if (value == null) return 'var(--color-text-muted)';
  const positive = inverted ? value <= 0 : value >= 0;
  return positive ? 'var(--color-green)' : 'var(--color-rose)';
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [performance, setPerformance] = useState<CollaboratorPerformanceData[]>([]);
  const [revenueChart, setRevenueChart] = useState<RevenueChartPoint[]>([]);
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [serviceRevenue, setServiceRevenue] = useState<ServiceRevenue[]>([]);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHourDay[]>([]);
  const [dailyAppts, setDailyAppts] = useState<DailyAppointmentPoint[]>([]);
  const [popularServices, setPopularServices] = useState<PopularService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const periodRef = useRef(period);

  useEffect(() => {
    periodRef.current = period;
    loadData(period);
  }, [period]);

  async function loadData(p: Period) {
    try {
      setRefreshing(true);
      setError(null);
      const params = { period: p };
      const [statsRes, upcomingRes, perfRes, revenueRes, statusRes, svcRevenueRes, clientsRes, peakRes, dailyRes, popRes] =
        await Promise.all([
          api.get<DashboardStats>('/api/dashboard/stats', { params }),
          api.get<Appointment[]>('/api/dashboard/upcoming'),
          api.get<CollaboratorPerformanceData[]>('/api/dashboard/collaborator-performance', { params }),
          api.get<RevenueChartPoint[]>('/api/dashboard/revenue-chart', { params }),
          api.get<StatusCount[]>('/api/dashboard/appointments-by-status', { params }),
          api.get<ServiceRevenue[]>('/api/dashboard/revenue-by-service', { params }),
          api.get<{ data: Client[] }>('/api/clients'),
          api.get<PeakHourDay[]>('/api/dashboard/peak-hours'),
          api.get<DailyAppointmentPoint[]>('/api/dashboard/daily-appointments'),
          api.get<PopularService[]>('/api/dashboard/popular-services', { params }),
        ]);
      if (periodRef.current !== p) return;
      setStats(statsRes.data);
      setUpcoming(upcomingRes.data);
      setPerformance(perfRes.data);
      setRevenueChart(revenueRes.data);
      setStatusData(statusRes.data);
      setServiceRevenue(svcRevenueRes.data);
      setRecentClients(clientsRes.data?.data || []);
      setPeakHours(peakRes.data);
      setDailyAppts(dailyRes.data);
      setPopularServices(popRes.data);
    } catch {
      setError('Erro ao carregar dados do dashboard. Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handleRefresh = () => loadData(period);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-[var(--color-rose-soft)] border border-[rgba(239,68,68,0.2)] rounded-xl text-[var(--color-rose)] text-sm font-medium flex items-center justify-between">
          {error}
          <button onClick={handleRefresh} className="ml-3 underline cursor-pointer">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Hero Panel */}
      <div className="bg-white -mx-7 -mt-6 px-7 pt-4 pb-5 border-b border-[var(--color-border)] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Dashboard</h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{PERIOD_LABELS[period]}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Period filter */}
            <div className="flex items-center bg-[var(--color-bg-surface)] rounded-lg p-0.5">
              {(['today', '7d', '30d'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    period === p
                      ? 'bg-white text-[var(--color-accent)] shadow-sm'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {p === 'today' ? 'Hoje' : p === '7d' ? '7 dias' : '30 dias'}
                </button>
              ))}
            </div>
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className={refreshing ? 'animate-spin' : ''} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>
            {/* Novo Agendamento */}
            <Link
              href="/dashboard/appointments?modal=new-appointment"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Novo Agendamento
            </Link>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
          <KpiCard
            label="Agendamentos"
            value={stats?.appointments ?? 0}
            trend={formatTrend(stats?.trends?.appointments)}
            trendColor={trendColor(stats?.trends?.appointments)}
            iconBg="var(--color-accent-soft)"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
          />
          <KpiCard
            label="Faturamento"
            value={formatCurrency(stats?.revenue ?? 0)}
            trend={formatTrend(stats?.trends?.revenue)}
            trendColor={trendColor(stats?.trends?.revenue)}
            iconBg="var(--color-green-soft)"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />
          <KpiCard
            label="Novos Clientes"
            value={stats?.new_clients ?? 0}
            trend={formatTrend(stats?.trends?.new_clients)}
            trendColor={trendColor(stats?.trends?.new_clients)}
            iconBg="var(--color-blue-soft)"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            trend={formatTrend(stats?.trends?.no_show_rate)}
            trendColor={trendColor(stats?.trends?.no_show_rate, true)}
            iconBg="var(--color-rose-soft)"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-rose)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            }
          />
          <KpiCard
            label="Ticket Medio"
            value={formatCurrency(stats?.ticket_medio ?? 0)}
            trend={formatTrend(stats?.trends?.ticket_medio)}
            trendColor={trendColor(stats?.trends?.ticket_medio)}
            iconBg="rgba(139,92,246,0.08)"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Charts section */}
      <div className="space-y-6 mt-6">
        {/* Upcoming + Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingAppointments appointments={upcoming} />
          <StatusList data={statusData} />
        </div>

        {/* Revenue + Collaborators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={revenueChart} />
          <CollaboratorPerformance data={performance} />
        </div>

        {/* Daily Appointments + Peak Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyAppointmentsChart data={dailyAppts} />
          <PeakHours data={peakHours} />
        </div>

        {/* Popular Services + Service Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PopularServicesChart data={popularServices} />
          <ServiceRevenueChart data={serviceRevenue} />
        </div>

        {/* Recent Clients - full width */}
        <RecentClients clients={recentClients} />
      </div>
    </div>
  );
}
