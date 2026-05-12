'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Appointment, AppointmentStatus, Client, Collaborator, Service } from '@/types';
import api from '@/lib/api-client';
import { KpiCard } from '@/components/ui/kpi-card';
import { AppointmentFilters } from '@/components/appointments/appointment-filters';
import { AppointmentCard } from '@/components/appointments/appointment-card';
import { AppointmentDetailModal } from '@/components/appointments/appointment-detail-modal';
import { AppointmentFormModal } from '@/components/appointments/appointment-form-modal';
import { StatusConfirmationModal, PendingStatusChange } from '@/components/appointments/status-confirmation-modal';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

type ViewMode = 'day' | 'week' | 'month' | 'list';

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

function getWeekRange(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { from: toDateString(monday), to: toDateString(sunday) };
}

function getWeekDays(dateStr: string) {
  const { from } = getWeekRange(dateStr);
  const start = new Date(from + 'T00:00:00');
  const days: { date: string; label: string; dayNum: string; isToday: boolean }[] = [];
  const todayStr = toDateString(new Date());
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const ds = toDateString(d);
    days.push({
      date: ds,
      label: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
      dayNum: String(d.getDate()).padStart(2, '0'),
      isToday: ds === todayStr,
    });
  }
  return days;
}

function getMonthRange(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { from: toDateString(first), to: toDateString(last) };
}

function getMonthCalendarDays(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const year = d.getFullYear();
  const month = d.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const dow = firstDay.getDay();
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - (dow === 0 ? 6 : dow - 1));
  const end = new Date(lastDay);
  const ldow = lastDay.getDay();
  if (ldow !== 0) end.setDate(lastDay.getDate() + (7 - ldow));
  const todayStr = toDateString(new Date());
  const days: { date: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    days.push({
      date: toDateString(cur),
      dayNum: cur.getDate(),
      isCurrentMonth: cur.getMonth() === month,
      isToday: toDateString(cur) === todayStr,
    });
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

export default function AppointmentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [date, setDate] = useState(() => toDateString(new Date()));
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [filters, setFilters] = useState<{ statuses: AppointmentStatus[]; collaborator_id: string | null; search?: string }>({
    statuses: [],
    collaborator_id: null,
    search: '',
  });
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(() => toDateString(new Date()));
  const datePickerRef = useRef<HTMLDivElement>(null);

  const [pendingStatus, setPendingStatus] = useState<PendingStatusChange | null>(null);

  const [error, setError] = useState('');

  const [clients, setClients] = useState<Client[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/api/clients'),
      api.get('/api/collaborators'),
      api.get('/api/services'),
    ]).then(([cRes, colRes, sRes]) => {
      setClients(cRes.data?.data || cRes.data || []);
      setCollaborators(colRes.data || []);
      setServices(sRes.data || []);
    }).catch(() => {
      // failed to load auxiliary data
    });
  }, []);

  // Handle ?modal=new-appointment from dashboard
  useEffect(() => {
    if (searchParams.get('modal') === 'new-appointment') {
      setShowNewForm(true);
      router.replace('/dashboard/appointments', { scroll: false });
    }
  }, [searchParams, router]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (viewMode === 'day') {
        params.set('date', date);
      } else if (viewMode === 'month') {
        const range = getMonthRange(date);
        params.set('date_from', range.from);
        params.set('date_to', range.to);
      } else {
        const range = getWeekRange(date);
        params.set('date_from', range.from);
        params.set('date_to', range.to);
      }
      if (filters.statuses.length > 0) {
        params.set('status', filters.statuses.join(','));
      }
      if (filters.collaborator_id) {
        params.set('collaborator_id', filters.collaborator_id);
      }
      const res = await api.get(`/api/appointments?${params.toString()}`);
      setAppointments(res.data?.data || res.data || []);
    } catch {
      setError('Erro ao carregar agendamentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [date, filters, viewMode]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    if (!showDatePicker) return;
    const handleClick = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDatePicker]);

  const goDay = (offset: number) => {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    setDate(toDateString(d));
  };

  const goWeek = (offset: number) => {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + offset * 7);
    setDate(toDateString(d));
  };

  const goMonth = (offset: number) => {
    const d = new Date(date + 'T00:00:00');
    d.setMonth(d.getMonth() + offset);
    setDate(toDateString(d));
  };

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    const appt = appointments.find((a) => a.id === id);
    setPendingStatus({
      appointmentId: id,
      clientName: appt?.client?.name || 'Cliente',
      targetStatus: status,
      totalPrice: appt?.total_price || 0,
    });
  };

  const confirmStatusChange = async (extras?: { payment_method?: string; cancel_reason?: string }) => {
    if (!pendingStatus) return;
    try {
      const updatePayload: Record<string, string> = {};
      if (extras?.payment_method) updatePayload.payment_method = extras.payment_method;
      if (extras?.cancel_reason) updatePayload.cancel_reason = extras.cancel_reason;
      if (Object.keys(updatePayload).length > 0) {
        await api.put(`/api/appointments/${pendingStatus.appointmentId}`, updatePayload);
      }
      await api.patch(`/api/appointments/${pendingStatus.appointmentId}/status`, {
        status: pendingStatus.targetStatus,
      });
      setSelectedAppointment(null);
      setPendingStatus(null);
      fetchAppointments();
    } catch {
      setPendingStatus(null);
    }
  };

  const totalCount = appointments.length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const inProgressCount = appointments.filter((a) => a.status === 'in_progress').length;
  const cancelledCount = appointments.filter((a) => a.status === 'cancelled').length;
  const noShowCount = appointments.filter((a) => a.status === 'no_show').length;
  const dayRevenue = appointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + a.total_price, 0);

  const displayAppointments = useMemo(() => {
    if (!filters.search) return appointments;
    const q = filters.search.toLowerCase();
    return appointments.filter((a) =>
      a.client?.name?.toLowerCase().includes(q) ||
      a.client?.phone?.toLowerCase().includes(q) ||
      a.collaborator?.name?.toLowerCase().includes(q)
    );
  }, [appointments, filters.search]);

  const isToday = date === toDateString(new Date());

  const weekDays = useMemo(() => getWeekDays(date), [date]);
  const monthDays = useMemo(() => getMonthCalendarDays(date), [date]);

  const appointmentsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const a of appointments) {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    }
    return map;
  }, [appointments]);

  return (
    <div>
      {/* Hero Panel */}
      <div className="bg-white -mx-7 -mt-6 px-7 pt-2 pb-5 border-b border-[var(--color-border)] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Agenda</h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Gerencie seus agendamentos
            </p>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4 stroke-white stroke-2 fill-none" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Novo Agendamento
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-6 gap-3">
          <KpiCard
            label="Total"
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
            label="Cancelados"
            value={cancelledCount}
            iconBg="var(--color-rose-soft)"
            icon={
              <svg className="w-5 h-5 stroke-[var(--color-rose)] stroke-2 fill-none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            }
          />
          <KpiCard
            label="No-show"
            value={noShowCount}
            iconBg="rgba(139,92,246,0.08)"
            icon={
              <svg className="w-5 h-5 stroke-[#8b5cf6] stroke-2 fill-none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            }
          />
          <KpiCard
            label="Receita"
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
      </div>

      {/* View Mode + Date Navigation */}
      <div className="flex items-center justify-between mt-6">
        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          {([
            { key: 'day' as const, label: 'Dia' },
            { key: 'week' as const, label: 'Semana' },
            { key: 'month' as const, label: 'Mes' },
            { key: 'list' as const, label: 'Lista' },
          ]).map((v) => (
            <button
              key={v.key}
              onClick={() => setViewMode(v.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                viewMode === v.key
                  ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Date nav */}
        <div className="flex items-center gap-1 bg-white rounded-xl p-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <button
            onClick={() => {
              if (viewMode === 'month') goMonth(-1);
              else if (viewMode === 'week') goWeek(-1);
              else goDay(-1);
            }}
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 stroke-[var(--color-text-secondary)] stroke-2 fill-none" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Hoje button */}
          <button
            onClick={() => { setDate(toDateString(new Date())); }}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isToday
                ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]'
            }`}
          >
            Hoje
          </button>

          {/* Date label */}
          <span className="px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] min-w-[180px] text-center select-none">
            {viewMode === 'month' ? (
              new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
            ) : viewMode === 'week' ? (
              (() => {
                const range = getWeekRange(date);
                const from = new Date(range.from + 'T00:00:00');
                const to = new Date(range.to + 'T00:00:00');
                return `${from.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} — ${to.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;
              })()
            ) : (
              formatDateDisplay(date)
            )}
          </span>

          <button
            onClick={() => {
              if (viewMode === 'month') goMonth(1);
              else if (viewMode === 'week') goWeek(1);
              else goDay(1);
            }}
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 stroke-[var(--color-text-secondary)] stroke-2 fill-none" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-[var(--color-border)] mx-1" />

          {/* Calendar picker trigger */}
          <div className="relative" ref={datePickerRef}>
            <button
              onClick={() => { setPickerMonth(date); setShowDatePicker((v) => !v); }}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                showDatePicker
                  ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                  : 'hover:bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]'
              }`}
              title="Escolher data"
            >
              <svg className="w-4.5 h-4.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </button>

            {/* Date picker popup */}
            {showDatePicker && (
              <div className="absolute right-0 top-12 bg-white rounded-2xl border border-[var(--color-border)] shadow-[0_16px_48px_rgba(0,0,0,0.12)] p-5 z-50 w-[320px] animate-[modalIn_0.2s_ease]">
                {/* Picker header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => {
                      const d = new Date(pickerMonth + 'T00:00:00');
                      d.setMonth(d.getMonth() - 1);
                      setPickerMonth(toDateString(d));
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 stroke-[var(--color-text-secondary)] stroke-2 fill-none" viewBox="0 0 24 24">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <span className="text-sm font-bold text-[var(--color-text-primary)] capitalize">
                    {new Date(pickerMonth + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => {
                      const d = new Date(pickerMonth + 'T00:00:00');
                      d.setMonth(d.getMonth() + 1);
                      setPickerMonth(toDateString(d));
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 stroke-[var(--color-text-secondary)] stroke-2 fill-none" viewBox="0 0 24 24">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-1">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map((d) => (
                    <div key={d} className="text-center text-[10px] font-bold uppercase text-[var(--color-text-muted)] py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7">
                  {getMonthCalendarDays(pickerMonth).map((day) => {
                    const isSelected = day.date === date;
                    return (
                      <button
                        key={day.date}
                        onClick={() => { setDate(day.date); setShowDatePicker(false); }}
                        className={`w-9 h-9 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white shadow-[0_2px_8px_rgba(79,90,229,0.3)]'
                            : day.isToday
                              ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-bold'
                              : day.isCurrentMonth
                                ? 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]'
                                : 'text-[var(--color-text-muted)] opacity-40 hover:opacity-70'
                        }`}
                      >
                        {day.dayNum}
                      </button>
                    );
                  })}
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => { setDate(toDateString(new Date())); setShowDatePicker(false); }}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold text-[var(--color-accent)] bg-[var(--color-accent-soft)] hover:brightness-95 transition-all cursor-pointer text-center"
                  >
                    Ir para Hoje
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-6 mt-6">
        <AppointmentFilters
          filters={filters}
          onChange={setFilters}
          collaborators={collaborators}
        />

        <div className="flex-1 min-w-0">
          {error && (
            <div className="mb-4 bg-[var(--color-rose-soft)] border border-red-100 rounded-2xl p-5 flex items-center justify-between">
              <p className="text-sm text-[var(--color-rose)] font-medium">{error}</p>
              <button onClick={() => fetchAppointments()} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] cursor-pointer">Tentar novamente</button>
            </div>
          )}

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
              <p className="text-xs text-[var(--color-text-muted)] mb-4 max-w-[280px]">
                Nao ha agendamentos para {viewMode === 'month' ? 'este mes' : viewMode === 'week' ? 'esta semana' : 'esta data'} com os filtros selecionados.
              </p>
              <button
                onClick={() => setShowNewForm(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer"
              >
                Novo Agendamento
              </button>
            </div>
          ) : viewMode === 'week' ? (
            /* WEEK VIEW */
            <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
              {/* Week header */}
              <div className="grid grid-cols-7 border-b border-[var(--color-border)]">
                {weekDays.map((day) => (
                  <button
                    key={day.date}
                    onClick={() => { setDate(day.date); setViewMode('day'); }}
                    className={`py-3 text-center cursor-pointer transition-all hover:bg-[var(--color-bg-surface)] ${
                      day.isToday ? 'bg-[var(--color-accent-soft)]' : ''
                    } ${day.date === date ? 'border-b-2 border-[var(--color-accent)]' : ''}`}
                  >
                    <div className="text-[10px] font-bold uppercase text-[var(--color-text-muted)]">{day.label}</div>
                    <div className={`text-lg font-extrabold mt-0.5 ${day.isToday ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'}`}>
                      {day.dayNum}
                    </div>
                    {appointmentsByDate[day.date] && (
                      <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                        {appointmentsByDate[day.date].length} agend.
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Week body */}
              <div className="grid grid-cols-7 min-h-[400px]">
                {weekDays.map((day) => {
                  const dayAppts = appointmentsByDate[day.date] || [];
                  return (
                    <div
                      key={day.date}
                      className={`border-r border-[var(--color-border)] last:border-r-0 p-2 ${
                        day.isToday ? 'bg-[rgba(79,90,229,0.02)]' : ''
                      }`}
                    >
                      {dayAppts.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-[10px] text-[var(--color-text-muted)]">—</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {dayAppts.map((a) => (
                            <button
                              key={a.id}
                              onClick={() => setSelectedAppointment(a)}
                              className={`w-full text-left p-2 rounded-lg text-[11px] transition-all cursor-pointer hover:shadow-sm border ${getWeekCardStyle(a.status)}`}
                            >
                              <div className="font-bold">{formatTime(a.start_time)}</div>
                              <div className="font-medium truncate">{a.client?.name}</div>
                              <div className="text-[10px] opacity-70 truncate">
                                {a.appointment_services?.map(s => s.service?.name).filter(Boolean).join(', ')}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : viewMode === 'month' ? (
            /* MONTH VIEW */
            <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 border-b border-[var(--color-border)]">
                {['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo'].map((d) => (
                  <div key={d} className="py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                    {d}
                  </div>
                ))}
              </div>

              {/* Month grid */}
              <div className="grid grid-cols-7">
                {monthDays.map((day, i) => {
                  const dayAppts = appointmentsByDate[day.date] || [];
                  const scheduled = dayAppts.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length;
                  const active = dayAppts.filter(a => a.status === 'in_progress').length;
                  const done = dayAppts.filter(a => a.status === 'completed').length;
                  const cancelled = dayAppts.filter(a => a.status === 'cancelled' || a.status === 'no_show').length;
                  return (
                    <button
                      key={day.date}
                      onClick={() => { setDate(day.date); setViewMode('day'); }}
                      className={`min-h-[100px] p-2 border-b border-r border-[var(--color-border)] text-left transition-all cursor-pointer hover:bg-[var(--color-bg-surface)] ${
                        !day.isCurrentMonth ? 'bg-[rgba(0,0,0,0.015)]' : ''
                      } ${day.isToday ? 'bg-[rgba(79,90,229,0.03)]' : ''} ${
                        i % 7 === 6 ? 'border-r-0' : ''
                      }`}
                    >
                      <div className={`text-sm font-bold mb-1.5 ${
                        day.isToday
                          ? 'w-7 h-7 rounded-full bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white flex items-center justify-center text-xs'
                          : day.isCurrentMonth
                            ? 'text-[var(--color-text-primary)]'
                            : 'text-[var(--color-text-muted)] opacity-40'
                      }`}>
                        {day.dayNum}
                      </div>
                      {dayAppts.length > 0 && day.isCurrentMonth && (
                        <div className="space-y-0.5">
                          {dayAppts.length <= 3 ? (
                            dayAppts.map((a) => (
                              <div
                                key={a.id}
                                className={`text-[10px] font-medium truncate px-1.5 py-0.5 rounded ${getWeekCardStyle(a.status)}`}
                              >
                                {formatTime(a.start_time)} {a.client?.name}
                              </div>
                            ))
                          ) : (
                            <>
                              {dayAppts.slice(0, 2).map((a) => (
                                <div
                                  key={a.id}
                                  className={`text-[10px] font-medium truncate px-1.5 py-0.5 rounded ${getWeekCardStyle(a.status)}`}
                                >
                                  {formatTime(a.start_time)} {a.client?.name}
                                </div>
                              ))}
                              <div className="text-[10px] font-semibold text-[var(--color-accent)] px-1.5">
                                +{dayAppts.length - 2} mais
                              </div>
                            </>
                          )}
                          {/* Status dots summary */}
                          <div className="flex items-center gap-1 mt-1">
                            {scheduled > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" title={`${scheduled} agendados`} />}
                            {active > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-amber)]" title={`${active} em atendimento`} />}
                            {done > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-green)]" title={`${done} concluidos`} />}
                            {cancelled > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-rose)]" title={`${cancelled} cancelados`} />}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : viewMode === 'list' ? (
            /* LIST VIEW */
            <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left">
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Horario</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Cliente</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Servico</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Colaborador</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Valor</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Status</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {displayAppointments.map((a) => {
                    const svcNames = a.appointment_services?.map(s => s.service?.name).filter(Boolean).join(', ') || '—';
                    const quickActions = getListQuickActions(a.status);
                    return (
                      <tr
                        key={a.id}
                        onClick={() => setSelectedAppointment(a)}
                        className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-bg-surface)] cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-bold text-[var(--color-text-primary)] whitespace-nowrap">
                          {formatTime(a.start_time)} - {formatTime(a.end_time)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-[var(--color-text-primary)]">{a.client?.name}</div>
                          {a.client?.phone && <div className="text-[11px] text-[var(--color-text-muted)]">{a.client.phone}</div>}
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)] max-w-[200px] truncate">{svcNames}</td>
                        <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">{a.collaborator?.name}</td>
                        <td className="px-4 py-3 text-sm font-bold text-[var(--color-text-primary)]">{formatCurrency(a.total_price)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${getStatusStyle(a.status)}`}>
                            {getStatusLabel(a.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            {quickActions.map((qa) => (
                              <button
                                key={qa.status}
                                onClick={() => handleStatusChange(a.id, qa.status)}
                                className={`px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer transition-all ${qa.className}`}
                                title={qa.label}
                              >
                                {qa.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* DAY VIEW (cards) */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayAppointments.map((a) => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  onClick={setSelectedAppointment}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AppointmentDetailModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onStatusChange={handleStatusChange}
      />

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

      <StatusConfirmationModal
        pending={pendingStatus}
        onConfirm={confirmStatusChange}
        onCancel={() => setPendingStatus(null)}
      />
    </div>
  );
}

function getWeekCardStyle(status: AppointmentStatus): string {
  switch (status) {
    case 'scheduled': return 'bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)]';
    case 'confirmed': return 'bg-[var(--color-green-soft)] border-[var(--color-green)] text-[var(--color-green)]';
    case 'in_progress': return 'bg-[var(--color-amber-soft)] border-[var(--color-amber)] text-[var(--color-amber)]';
    case 'completed': return 'bg-[var(--color-bg-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]';
    case 'cancelled': return 'bg-[var(--color-rose-soft)] border-[var(--color-rose)] text-[var(--color-rose)] opacity-60';
    case 'no_show': return 'bg-[var(--color-rose-soft)] border-[var(--color-rose)] text-[var(--color-rose)] opacity-60';
  }
}

function getStatusStyle(status: AppointmentStatus): string {
  switch (status) {
    case 'scheduled': return 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]';
    case 'confirmed': return 'bg-[var(--color-green-soft)] text-[var(--color-green)]';
    case 'in_progress': return 'bg-[var(--color-amber-soft)] text-[var(--color-amber)]';
    case 'completed': return 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]';
    case 'cancelled': return 'bg-[var(--color-rose-soft)] text-[var(--color-rose)]';
    case 'no_show': return 'bg-[rgba(139,92,246,0.08)] text-[#8b5cf6]';
  }
}

function getStatusLabel(status: AppointmentStatus): string {
  const labels: Record<AppointmentStatus, string> = {
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    in_progress: 'Em Atendimento',
    completed: 'Concluido',
    cancelled: 'Cancelado',
    no_show: 'No-show',
  };
  return labels[status];
}

function getListQuickActions(status: AppointmentStatus): { label: string; status: AppointmentStatus; className: string }[] {
  switch (status) {
    case 'scheduled':
      return [
        { label: 'Confirmar', status: 'confirmed', className: 'bg-[var(--color-green-soft)] text-[var(--color-green)] hover:bg-[var(--color-green)] hover:text-white' },
      ];
    case 'confirmed':
      return [
        { label: 'Iniciar', status: 'in_progress', className: 'bg-[var(--color-blue-soft)] text-[var(--color-blue)] hover:bg-[var(--color-blue)] hover:text-white' },
      ];
    case 'in_progress':
      return [
        { label: 'Concluir', status: 'completed', className: 'bg-[var(--color-green-soft)] text-[var(--color-green)] hover:bg-[var(--color-green)] hover:text-white' },
      ];
    default:
      return [];
  }
}
