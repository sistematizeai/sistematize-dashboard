'use client';

import { Client } from '@/types';
import { Badge } from '@/components/ui/badge';

export function ClientCard({ client, onClick }: { client: Client; onClick: (client: Client) => void }) {
  const initial = client.name.charAt(0).toUpperCase();
  const memberSince = new Date(client.created_at).toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      onClick={() => onClick(client)}
      className="bg-white rounded-2xl p-5 border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-border-light)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-[0_4px_12px_rgba(124,58,237,0.25)]">
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          {/* Name */}
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent)] transition-colors">
            {client.name}
          </h3>

          {/* Phone */}
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">
            {client.phone || 'Sem telefone'}
          </p>

          {/* Email */}
          {client.email && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
              {client.email}
            </p>
          )}
        </div>

        {/* Source Badge */}
        {client.source && (
          <Badge variant="active">{client.source}</Badge>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
        <span className="text-[11px] text-[var(--color-text-muted)] font-medium">
          Cliente desde {memberSince}
        </span>
        {!client.is_active && (
          <Badge variant="hidden">Inativo</Badge>
        )}
      </div>
    </div>
  );
}
