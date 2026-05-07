'use client';

import { Collaborator } from '@/types';
import { Badge } from '@/components/ui/badge';

export function CollaboratorCard({ collaborator, onClick }: { collaborator: Collaborator; onClick: (c: Collaborator) => void }) {
  const serviceCount = collaborator.collaborator_services?.length || 0;
  const serviceNames = collaborator.collaborator_services?.slice(0, 3).map((cs) => cs.service?.name).filter(Boolean) || [];
  const moreCount = serviceCount - 3;

  return (
    <div
      onClick={() => onClick(collaborator)}
      className="bg-white rounded-2xl border border-[var(--color-border)] p-5 cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-[var(--color-border-light)] transition-all"
    >
      <div className="flex items-center gap-3.5 mb-4">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center text-white font-bold text-sm shrink-0">
          {collaborator.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[var(--color-text-primary)] truncate">{collaborator.name}</span>
            <Badge variant={collaborator.is_active ? 'active' : 'hidden'}>
              {collaborator.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          {collaborator.phone && <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{collaborator.phone}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[var(--color-bg-surface)] rounded-xl px-3 py-2">
          <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-medium">Comissao</div>
          <div className="text-sm font-bold text-[var(--color-text-primary)]">{collaborator.base_commission}%</div>
        </div>
        <div className="bg-[var(--color-bg-surface)] rounded-xl px-3 py-2">
          <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-medium">Jornada</div>
          <div className="text-sm font-bold text-[var(--color-text-primary)]">{collaborator.work_start?.slice(0, 5)} - {collaborator.work_end?.slice(0, 5)}</div>
        </div>
      </div>

      {serviceCount > 0 && (
        <div>
          <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-medium mb-1.5">{serviceCount} servico{serviceCount !== 1 ? 's' : ''}</div>
          <div className="flex flex-wrap gap-1.5">
            {serviceNames.map((name, i) => (
              <span key={i} className="px-2 py-1 rounded-md bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-[10px] font-medium">{name}</span>
            ))}
            {moreCount > 0 && (
              <span className="px-2 py-1 rounded-md bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] text-[10px] font-medium">+{moreCount} mais</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
