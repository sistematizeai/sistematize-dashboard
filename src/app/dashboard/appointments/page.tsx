'use client';

import { useState, useEffect, useCallback } from 'react';
import { Appointment, AppointmentStatus, Client, Collaborator, Service } from '@/types';
import api from '@/lib/api-client';
import { KpiCard } from '@/components/ui/kpi-card';
import { AppointmentFilters } from '@/components/appointments/appointment-filters';
import { AppointmentCard } from '@/components/appointments/appointment-card';
import { AppointmentDetailModal } from '@/components/appointments/appointment-detail-modal';
import { AppointmentFormModal } from '@/components/appointments/appointment-form-modal';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function toDateString(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateDisplay(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [date, setDate] = useState(() => toDateString(new Date()));
  const [filters, setFilters] = useState<{ statuses: AppointmentStatus[]; collaborator_id: string | null }>({
    statuses: [],
    collaborator_id: null,
  });
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // Reference data
  const [clients, setClients] = useState<Client[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Fetch reference data once
  useEffect(() => {
    Promise.all([
      api.get('/api/clients'),
      api.get('/api/collaborators'),
      api.get('/api/services'),
    ]).then(([cRes, colRes, sRes]) => {
      setClients(cRes.data);
      setCollaborators(colRes.data);
      setServices(sRes.data);
    });
  }, []);

  // Fetch appointments when date or filters change
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ date });
      if (filters.statuses.length > 0) {
        params.set('status', filters.statuses.join(','));
      }
      if (filters.collaborator_id) {
        params.set('collaborator_id', filters.collaborator_id);
      }
      const res = await api.get(`/api/appointments?${params.toString()}`);
      setAppointments(res.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [date, filters]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Date navigation
  const goDay = (offset: number) => {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    setDate(toDateString(d));
  };

  // Status change
  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      await api.patch(`/api/appointments/${id}/status`, { status });
      setSelectedAppointment(null);
      fetchAppointments();
    } catch {
      // handled by interceptor
    }
  };

  // KPI calculations
  const totalCount = appointments.length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const inProgressCount = appointments.filter((a) => a.status === 'in_progress').length;
  const dayRevenue = appointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + a.total_price, 0);

  const isToday = date === toDateString(new Date());

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-5">
          <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            Agenda
          </h1>
          <div className="flex items-center gap-1 bg-white rounded-xl border border-[var(--color-border)] p-1">
            <button
              onClick={() => goDay(-1)}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 stroke-[var(--color-text-secondary)] stroke-2 fill-none" viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={() => !isToday && setDate(toDateString(new Date()))}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer min-w-[180px] text-center ${
                isToday
                  ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]'
              }`}
            >
              {isToday ? 'Hoje' : ''} {formatDateDisplay(date)}
            </button>
            <button
              onClick={() => goDay(1)}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 stroke-[var(--color-text-secondary)] stroke-2 fill-none" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold hover:bg-[#6d28d9] transition-all cursor-pointer flex items-center gap-2"
        >
          <svg className="w-4 h-4 stroke-white stroke-2 fill-none" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo Agendamento
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Agendamentos"
          value={totalCount}
          iconBg="var(--color-accent-soft)"
          icon={
            <svg className="w-5 h-5 stroke-[var(--color-accent)] stroke-2 fill-none" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
        <KpiCard
          label="Confirmados"
          value={confirmedCount}
          iconBg="var(--color-green-soft)"
          icon={
            <svg className="w-5 h-5 stroke-[var(--color-green)] stroke-2 fill-none" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
        />
        <KpiCard
          label="Em Atendimento"
          value={inProgressCount}
          iconBg="var(--color-amber-soft)"
          icon={
            <svg className="w-5 h-5 stroke-[var(--color-amber)] stroke-2 fill-none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <KpiCard
          label="Receita do Dia"
          value={formatCurrency(dayRevenue)}
          iconBg="var(--color-blue-soft)"
          icon={
            <svg className="w-5 h-5 stroke-[var(--color-blue)] stroke-2 fill-none" viewBox="0 0 24 24">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
      </div>

      {/* Main layout: sidebar + card grid */}
      <div className="flex gap-6">
        <AppointmentFilters
          filters={filters}
          onChange={setFilters}
          collaborators={collaborators}
        />

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-[var(--color-accent-soft)] border-t-[var(--color-accent)] rounded-full animate-spin" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center mb-4">
                <svg className="w-7 h-7 stroke-[var(--color-text-muted)] stroke-[1.5] fill-none" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Nenhum agendamento encontrado
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Nao ha agendamentos para esta data com os filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {appointments.map((a) => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  onClick={setSelectedAppointment}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onStatusChange={handleStatusChange}
      />

      {/* New appointment form modal */}
      {showNewForm && (
        <AppointmentFormModal
          clients={clients}
          collaborators={collaborators}
          services={services}
          onClose={() => setShowNewForm(false)}
          onCreated={() => {
            setShowNewForm(false);
            fetchAppointments();
          }}
        />
      )}
    </div>
  );
}
