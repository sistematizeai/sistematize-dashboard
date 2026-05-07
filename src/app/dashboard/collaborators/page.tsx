'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api-client';
import { Collaborator, Service } from '@/types';
import { CollaboratorCard } from '@/components/collaborators/collaborator-card';
import { CollaboratorEditModal } from '@/components/collaborators/collaborator-edit-modal';
import { CollaboratorFormModal } from '@/components/collaborators/collaborator-form-modal';

export default function CollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCollaborator, setEditCollaborator] = useState<Collaborator | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const fetchData = async () => {
    try {
      const [colRes, svcRes] = await Promise.all([
        api.get('/api/collaborators'),
        api.get('/api/services'),
      ]);
      setCollaborators(colRes.data);
      setServices(svcRes.data);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight">Colaboradores</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {collaborators.length} colaborador{collaborators.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold hover:bg-[#6d28d9] transition-all cursor-pointer"
        >
          Novo Colaborador
        </button>
      </div>

      {collaborators.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--color-text-muted)] text-sm">Nenhum colaborador cadastrado ainda.</p>
          <button onClick={() => setShowNewForm(true)} className="mt-3 text-sm font-medium text-[var(--color-accent)] hover:underline cursor-pointer">
            Adicionar primeiro colaborador
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
