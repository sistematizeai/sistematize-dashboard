'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@/types';
import api from '@/lib/api-client';
import { ClientCard } from '@/components/clients/client-card';
import { ClientDetailModal } from '@/components/clients/client-detail-modal';
import { ClientFormModal } from '@/components/clients/client-form-modal';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchClients = useCallback(async (searchTerm: string) => {
    setLoading(true);
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const { data } = await api.get('/api/clients', { params });
      setClients(data);
    } catch {
      // silently fail — user sees empty state
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchClients('');
  }, [fetchClients]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchClients(search);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchClients]);

  async function handleCardClick(client: Client) {
    setLoadingDetail(true);
    try {
      const { data } = await api.get(`/api/clients/${client.id}`);
      setSelectedClient(data);
    } catch {
      // fallback: open with basic data
      setSelectedClient(client);
    } finally {
      setLoadingDetail(false);
    }
  }

  function handleDetailSaved() {
    setSelectedClient(null);
    fetchClients(search);
  }

  function handleCreated() {
    setShowNewForm(false);
    fetchClients(search);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            Clientes
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {loading ? 'Carregando...' : `${clients.length} cliente${clients.length !== 1 ? 's' : ''} cadastrado${clients.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
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
          </div>

          {/* New Client Button */}
          <button
            onClick={() => setShowNewForm(true)}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold hover:bg-[#6d28d9] transition-all cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4 stroke-white stroke-2 fill-none" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Novo Cliente
          </button>
        </div>
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

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
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
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center mb-4">
            <svg className="w-8 h-8 stroke-[var(--color-accent)] stroke-[1.5] fill-none" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1">
            {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            {search
              ? 'Tente buscar com outros termos.'
              : 'Adicione seu primeiro cliente para comecar.'}
          </p>
          {!search && (
            <button
              onClick={() => setShowNewForm(true)}
              className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold hover:bg-[#6d28d9] transition-all cursor-pointer"
            >
              Novo Cliente
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} onClick={handleCardClick} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onSaved={handleDetailSaved}
        />
      )}

      {/* New Client Form Modal */}
      {showNewForm && (
        <ClientFormModal
          onClose={() => setShowNewForm(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
