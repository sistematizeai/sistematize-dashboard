'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Client } from '@/types';
import api from '@/lib/api-client';
import { ClientCard } from '@/components/clients/client-card';
import { ClientDetailModal } from '@/components/clients/client-detail-modal';
import { ClientFormModal } from '@/components/clients/client-form-modal';
import { KpiCard } from '@/components/ui/kpi-card';

type ClientFilter = 'all' | 'recent' | 'inactive' | 'with_appointments' | 'no_appointments';

const FILTER_OPTIONS: { key: ClientFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'recent', label: 'Novos (30d)' },
  { key: 'inactive', label: 'Inativos' },
  { key: 'with_appointments', label: 'Com agendamento' },
  { key: 'no_appointments', label: 'Sem agendamento' },
];

const PAGE_SIZE = 50;

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ClientFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchClients = useCallback(async (searchTerm: string, pg = 1) => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { page: pg, limit: PAGE_SIZE };
      if (searchTerm) params.search = searchTerm;
      const { data: res } = await api.get('/api/clients', { params });
      if (Array.isArray(res)) {
        setClients(res);
        setTotalClients(res.length);
      } else {
        setClients(res.data);
        setTotalClients(res.total);
      }
      setPage(pg);
    } catch {
      setError('Erro ao carregar clientes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!search) {
      fetchClients('', 1);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchClients(search, 1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchClients]);

  const totalPages = Math.ceil(totalClients / PAGE_SIZE);

  const filteredClients = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return clients.filter((c) => {
      switch (filter) {
        case 'recent':
          return new Date(c.created_at) >= thirtyDaysAgo;
        case 'inactive':
          return !c.is_active;
        case 'with_appointments':
          return (c.appointment_count ?? 0) > 0;
        case 'no_appointments':
          return (c.appointment_count ?? 0) === 0;
        default:
          return true;
      }
    });
  }, [clients, filter]);

  async function handleCardClick(client: Client) {
    setLoadingDetail(true);
    try {
      const { data } = await api.get(`/api/clients/${client.id}`);
      setSelectedClient(data);
    } catch {
      setSelectedClient(client);
    } finally {
      setLoadingDetail(false);
    }
  }

  function handleDetailSaved() {
    setSelectedClient(null);
    fetchClients(search, page);
  }

  function handleCreated() {
    setShowNewForm(false);
    fetchClients(search, 1);
  }

  const recentClients = clients.filter((c) => {
    const created = new Date(c.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return created >= thirtyDaysAgo;
  });

  return (
    <div>
      {/* Hero Panel */}
      <div className="bg-white -mx-7 -mt-6 px-7 pt-2 pb-5 border-b border-[var(--color-border)] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Clientes</h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Gerencie sua base de clientes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 stroke-[var(--color-text-muted)] stroke-2 fill-none pointer-events-none"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente..."
                className="w-64 pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--color-text-muted)] flex items-center justify-center cursor-pointer hover:bg-[var(--color-text-secondary)] transition-colors"
                >
                  <svg className="w-2.5 h-2.5 stroke-white stroke-2 fill-none" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={() => setShowNewForm(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer flex items-center gap-2"
            >
              <svg className="w-4 h-4 stroke-white stroke-2 fill-none" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Novo Cliente
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label="Total Clientes"
            value={totalClients}
            iconBg="var(--color-accent-soft)"
            icon={
              <svg className="w-5 h-5 stroke-[var(--color-accent)] stroke-2 fill-none" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <KpiCard
            label="Novos (30 dias)"
            value={recentClients.length}
            iconBg="var(--color-green-soft)"
            icon={
              <svg className="w-5 h-5 stroke-[var(--color-green)] stroke-2 fill-none" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            }
          />
          <KpiCard
            label="Com Telefone"
            value={clients.filter((c) => c.phone).length}
            iconBg="var(--color-blue-soft)"
            icon={
              <svg className="w-5 h-5 stroke-[var(--color-blue)] stroke-2 fill-none" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            }
          />
          <KpiCard
            label="Com Email"
            value={clients.filter((c) => c.email).length}
            iconBg="var(--color-amber-soft)"
            icon={
              <svg className="w-5 h-5 stroke-[var(--color-amber)] stroke-2 fill-none" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 mt-6">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFilter(opt.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
              filter === opt.key
                ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'bg-white border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]'
            }`}
          >
            {opt.label}
            {opt.key === 'all' && ` (${clients.length})`}
            {opt.key === 'recent' && ` (${recentClients.length})`}
          </button>
        ))}
      </div>

      {/* Loading overlay for detail fetch */}
      {loadingDetail && (
        <div className="fixed inset-0 z-[100] bg-black/10 flex items-center justify-center">
          <div className="bg-white rounded-2xl px-6 py-4 shadow-lg flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[var(--color-text-secondary)] font-medium">Carregando...</span>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mt-6 bg-[var(--color-rose-soft)] border border-red-100 rounded-2xl p-5 flex items-center justify-between">
          <p className="text-sm text-[var(--color-rose)] font-medium">{error}</p>
          <button onClick={() => fetchClients(search)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] cursor-pointer">Tentar novamente</button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4 mt-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-[var(--color-border)] animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-[var(--color-bg-surface)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[var(--color-bg-surface)] rounded-lg w-3/4" />
                  <div className="h-3 bg-[var(--color-bg-surface)] rounded-lg w-1/2" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
                <div className="h-3 bg-[var(--color-bg-surface)] rounded-lg w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center mb-4">
            <svg className="w-8 h-8 stroke-[var(--color-accent)] stroke-[1.5] fill-none" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1">
            {search || filter !== 'all' ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            {search
              ? 'Tente buscar com outros termos.'
              : filter !== 'all'
                ? 'Nenhum cliente corresponde a este filtro.'
                : 'Adicione seu primeiro cliente para comecar.'}
          </p>
          {!search && filter === 'all' && (
            <button
              onClick={() => setShowNewForm(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer"
            >
              Novo Cliente
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} onClick={handleCardClick} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => fetchClients(search, page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-[var(--color-text-muted)] px-3">
                Pagina {page} de {totalPages} ({totalClients} clientes)
              </span>
              <button
                onClick={() => fetchClients(search, page + 1)}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Proximo
              </button>
            </div>
          )}
        </>
      )}

      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onSaved={handleDetailSaved}
        />
      )}

      {showNewForm && (
        <ClientFormModal
          onClose={() => setShowNewForm(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
