'use client';

import type { Client } from '@/types';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atras`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem atras`;
  return `${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''} atras`;
}

export function RecentClients({ clients }: { clients: Client[] }) {
  const recent = [...clients]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
      <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-5">
        Clientes Recentes
      </h2>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Nenhum cliente cadastrado</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-[240px]">
            Clientes cadastrados aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          {recent.map((client) => (
            <div
              key={client.id}
              className="flex items-center gap-3 py-3 border-b border-[var(--color-border-light)] last:border-b-0"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7B8AF2] to-[#4F5AE5] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {client.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {client.name}
                </div>
                <div className="text-[11px] text-[var(--color-text-muted)] truncate">
                  {client.phone || client.email || 'Sem contato'}
                </div>
              </div>
              <span className="text-[11px] text-[var(--color-text-muted)] shrink-0">
                {timeAgo(client.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
