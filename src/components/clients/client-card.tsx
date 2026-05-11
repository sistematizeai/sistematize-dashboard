'use client';

import { Client } from '@/types';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function ClientCard({ client, onClick }: { client: Client; onClick: (client: Client) => void }) {
  const initial = client.name.charAt(0).toUpperCase();
  const memberSince = new Date(client.created_at).toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric',
  });

  const appointments = client.appointments || [];
  const completedAppts = appointments.filter(a => a.status === 'completed');
  const totalSpent = completedAppts.reduce((sum, a) => sum + a.total_price, 0);
  const visitCount = completedAppts.length;

  const lastAppt = appointments
    .filter(a => a.status !== 'cancelled')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const lastVisitLabel = lastAppt
    ? new Date(lastAppt.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
    : null;

  return (
    <div
      onClick={() => onClick(client)}
      className="bg-white rounded-2xl p-5 border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-accent-light)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#7B8AF2] to-[#4F5AE5] flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-[0_4px_12px_rgba(79,90,229,0.25)]">
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent)] transition-colors">
            {client.name}
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">
            {client.phone || 'Sem telefone'}
          </p>
          {client.email && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
              {client.email}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          {client.source && (
            <Badge variant="active">{client.source}</Badge>
          )}
          {!client.is_active && (
            <Badge variant="hidden">Inativo</Badge>
          )}
        </div>
      </div>

      {/* Stats row */}
      {(visitCount > 0 || lastVisitLabel) && (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--color-border)]">
          {visitCount > 0 && (
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 stroke-[var(--color-text-muted)] stroke-[1.5] fill-none" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-[11px] text-[var(--color-text-muted)]">{visitCount} visita{visitCount !== 1 ? 's' : ''}</span>
            </div>
          )}
          {totalSpent > 0 && (
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 stroke-[var(--color-text-muted)] stroke-[1.5] fill-none" viewBox="0 0 24 24">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span className="text-[11px] text-[var(--color-text-muted)]">{formatCurrency(totalSpent)}</span>
            </div>
          )}
          {lastVisitLabel && (
            <span className="text-[11px] text-[var(--color-text-muted)] ml-auto">
              Ultima: {lastVisitLabel}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className={`flex items-center justify-between ${visitCount > 0 || lastVisitLabel ? 'mt-2' : 'mt-4 pt-3 border-t border-[var(--color-border)]'}`}>
        <span className="text-[11px] text-[var(--color-text-muted)] font-medium">
          Cliente desde {memberSince}
        </span>
        {client.phone && (
          <a
            href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-[#25d366] bg-[rgba(37,211,102,0.08)] hover:bg-[rgba(37,211,102,0.15)] transition-all cursor-pointer"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="#25d366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
