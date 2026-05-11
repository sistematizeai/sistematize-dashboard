'use client';

import { AppointmentStatus, Collaborator } from '@/types';

const STATUS_OPTIONS: { value: AppointmentStatus; label: string; color: string }[] = [
  { value: 'scheduled', label: 'Agendado', color: 'var(--color-accent)' },
  { value: 'confirmed', label: 'Confirmado', color: 'var(--color-green)' },
  { value: 'in_progress', label: 'Em Atendimento', color: 'var(--color-amber)' },
  { value: 'completed', label: 'Concluido', color: 'var(--color-text-secondary)' },
  { value: 'cancelled', label: 'Cancelado', color: 'var(--color-rose)' },
  { value: 'no_show', label: 'Nao Compareceu', color: 'var(--color-rose)' },
];

interface Filters {
  statuses: AppointmentStatus[];
  collaborator_id: string | null;
  search?: string;
}

interface AppointmentFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  collaborators: Collaborator[];
}

export function AppointmentFilters({ filters, onChange, collaborators }: AppointmentFiltersProps) {
  const toggleStatus = (status: AppointmentStatus) => {
    const next = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onChange({ ...filters, statuses: next });
  };

  const setCollaborator = (id: string | null) => {
    onChange({ ...filters, collaborator_id: id });
  };

  const hasFilters = filters.statuses.length > 0 || filters.collaborator_id !== null || !!filters.search;

  const clearFilters = () => {
    onChange({ statuses: [], collaborator_id: null, search: '' });
  };

  return (
    <div className="w-[230px] shrink-0 sticky top-[88px] self-start">
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
        {/* Header with clear */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Filtros
          </h3>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-[11px] font-medium text-[var(--color-accent)] hover:underline cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Search */}
        <div className="mb-5">
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Buscar cliente..."
            className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all"
          />
        </div>

        {/* Status section */}
        <div className="mb-6">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
            Status
          </h3>
          <div className="flex flex-col gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.statuses.includes(opt.value)}
                  onChange={() => toggleStatus(opt.value)}
                  className="sr-only"
                />
                <span
                  className={`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center transition-all ${
                    filters.statuses.includes(opt.value)
                      ? 'border-[var(--color-accent)] bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7]'
                      : 'border-[var(--color-border)] bg-white group-hover:border-[var(--color-accent-light)]'
                  }`}
                >
                  {filters.statuses.includes(opt.value) && (
                    <svg className="w-3 h-3 stroke-white stroke-[3] fill-none" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: opt.color }}
                />
                <span className="text-sm text-[var(--color-text-primary)] font-medium">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Collaborator section */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
            Colaborador
          </h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="collaborator"
                checked={filters.collaborator_id === null}
                onChange={() => setCollaborator(null)}
                className="sr-only"
              />
              <span
                className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all ${
                  filters.collaborator_id === null
                    ? 'border-[var(--color-accent)]'
                    : 'border-[var(--color-border)] group-hover:border-[var(--color-accent-light)]'
                }`}
              >
                {filters.collaborator_id === null && (
                  <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7]" />
                )}
              </span>
              <span className="text-sm text-[var(--color-text-primary)] font-medium">Todos</span>
            </label>
            {collaborators.map((collab) => (
              <label key={collab.id} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="collaborator"
                  checked={filters.collaborator_id === collab.id}
                  onChange={() => setCollaborator(collab.id)}
                  className="sr-only"
                />
                <span
                  className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all ${
                    filters.collaborator_id === collab.id
                      ? 'border-[var(--color-accent)]'
                      : 'border-[var(--color-border)] group-hover:border-[var(--color-accent-light)]'
                  }`}
                >
                  {filters.collaborator_id === collab.id && (
                    <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7]" />
                  )}
                </span>
                <span className="text-sm text-[var(--color-text-primary)] font-medium truncate">
                  {collab.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
