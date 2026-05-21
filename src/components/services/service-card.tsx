'use client';

import Image from 'next/image';
import { Service } from '@/types';
import { Badge } from '@/components/ui/badge';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function ServiceCard({ service, onClick, onQuickAction }: {
  service: Service;
  onClick: (s: Service) => void;
  onQuickAction?: (action: string, service: Service) => void;
}) {
  return (
    <div
      className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden cursor-pointer hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:border-[var(--color-accent)] transition-all group relative"
      onClick={() => onClick(service)}
    >
      {/* 16:9 Image area */}
      <div className="w-full aspect-[16/9] relative overflow-hidden">
        {service.image_url ? (
          <Image
            src={service.image_url}
            alt={service.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--color-bg-surface)] to-[var(--color-border)] flex items-center justify-center">
            <svg className="w-10 h-10 stroke-[var(--color-text-muted)] opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}

        {/* Status badge overlay */}
        <div className="absolute top-2.5 left-2.5">
          <Badge variant={service.is_active ? 'active' : 'hidden'}>
            {service.is_active ? 'Ativo' : 'Oculto'}
          </Badge>
        </div>

        {/* Quick actions menu */}
        {onQuickAction && (
          <button
            onClick={(e) => { e.stopPropagation(); onQuickAction('menu', service); }}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-white"
          >
            <svg className="w-4 h-4 fill-[var(--color-text-secondary)]" viewBox="0 0 24 24">
              <circle cx="12" cy="6" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="18" r="1.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors mb-1 truncate">
          {service.name}
        </h3>
        {service.description && (
          <p className="text-xs text-[var(--color-text-muted)] mb-3 line-clamp-2 leading-relaxed">{service.description}</p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
          <span className="text-sm font-extrabold text-[var(--color-accent)]">
            {service.price_type === 'on_request' ? 'Sob consulta' : (service.price_type === 'starting_at' ? 'A partir de ' : '') + fmt.format(service.price)}
          </span>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 stroke-[var(--color-text-muted)] stroke-[1.5] fill-none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-xs text-[var(--color-text-muted)]">{service.duration_minutes}min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
