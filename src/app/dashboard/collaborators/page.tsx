'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api-client';
import { Collaborator, Service } from '@/types';
import { CollaboratorCard } from '@/components/collaborators/collaborator-card';
import { CollaboratorEditModal } from '@/components/collaborators/collaborator-edit-modal';
import { CollaboratorFormModal } from '@/components/collaborators/collaborator-form-modal';
import { KpiCard } from '@/components/ui/kpi-card';

export default function CollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editCollaborator, setEditCollaborator] = useState<Collaborator | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      const [colRes, svcRes] = await Promise.all([
        api.get('/api/collaborators'),
        api.get('/api/services'),
      ]);
      setCollaborators(colRes.data || []);
      setServices(svcRes.data || []);
    } catch {
      setError('Erro ao carregar colaboradores. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeCollabs = collaborators.filter((c) => c.is_active);
  const inactiveCollabs = collaborators.filter((c) => !c.is_active);
  const totalServices = collaborators.reduce((sum, c) => sum + (c.collaborator_services?.length || 0), 0);

  return (
    <div>
      {error && (
        <div className="mb-5 p-4 bg-[var(--color-rose-soft)] border border-[rgba(239,68,68,0.2)] rounded-xl text-[var(--color-rose)] text-sm font-medium flex items-center justify-between">
          {error}
          <button onClick={fetchData} className="ml-3 underline cursor-pointer">Tentar novamente</button>
        </div>
      )}

      {/* Hero Panel */}
      <div className="bg-white -mx-7 -mt-6 px-7 pt-2 pb-5 border-b border-[var(--color-border)] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-[var(--color-text-muted)]">
            Gerencie sua equipe
          </p>
          <button
            onClick={() => setShowNewForm(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4 stroke-white stroke-2 fill-none" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Novo Colaborador
          </button>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label="Total Colaboradores"
            value={collaborators.length}
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
            label="Ativos"
            value={activeCollabs.length}
            iconBg="var(--color-green-soft)"
            icon={
              <svg className="w-5 h-5 stroke-[var(--color-green)] stroke-2 fill-none" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            }
          />
          <KpiCard
            label="Inativos"
            value={inactiveCollabs.length}
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
            label="Servicos Vinculados"
            value={totalServices}
            iconBg="var(--color-blue-soft)"
            icon={
              <svg className="w-5 h-5 stroke-[var(--color-blue)] stroke-2 fill-none" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            }
          />
        </div>
      </div>

      {collaborators.length === 0 ? (
        <div className="text-center py-16 mt-6">
          <p className="text-[var(--color-text-muted)] text-sm">Nenhum colaborador cadastrado ainda.</p>
          <button onClick={() => setShowNewForm(true)} className="mt-3 text-sm font-medium text-[var(--color-accent)] hover:underline cursor-pointer">
            Adicionar primeiro colaborador
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
          {collaborators.map((c) => (
            <CollaboratorCard key={c.id} collaborator={c} onClick={setEditCollaborator} />
          ))}
        </div>
      )}

      <CollaboratorEditModal
        collaborator={editCollaborator}
        allServices={services}
        onClose={() => setEditCollaborator(null)}
        onSaved={fetchData}
      />

      {showNewForm && (
        <CollaboratorFormModal
          allServices={services}
          onClose={() => setShowNewForm(false)}
          onCreated={fetchData}
        />
      )}
    </div>
  );
}
