'use client';

import { Service } from '@/types';
import { Badge } from '@/components/ui/badge';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function ServiceCard({ service, onClick }: { service: Service; onClick: (s: Service) => void }) {
  return (
    <div
      onClick={() => onClick(service)}
      className="bg-[var(--color-bg-surface)] rounded-xl p-4 cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-[var(--color-border-light)] border border-transparent transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="font-semibold text-sm text-[var(--color-text-primary)]">{service.name}</span>
        <Badge variant={service.is_active ? 'active' : 'hidden'}>
          {service.is_active ? 'Ativo' : 'Oculto'}
        </Badge>
      </div>
      {service.description && (
        <p className="text-xs text-[var(--color-text-secondary)] mb-3 line-clamp-2">{service.description}</p>
      )}
      <div className="flex items-center gap-3 text-xs">
        <span className="font-bold text-[var(--color-text-primary)]">
          {service.price_type === 'on_request' ? 'Sob consulta' : (service.price_type === 'starting_at' ? 'A partir de ' : '') + fmt.format(service.price)}
        </span>
        <span className="text-[var(--color-text-muted)]">·</span>
        <span className="text-[var(--color-text-secondary)]">{service.duration_minutes}min</span>
      </div>
    </div>
  );
}
