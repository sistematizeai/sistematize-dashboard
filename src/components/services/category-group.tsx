'use client';

import { Category, Service } from '@/types';
import { ServiceCard } from './service-card';

export function CategoryGroup({
  category,
  services,
  onEditService,
  onAddService,
  onDeleteCategory,
}: {
  category: Category;
  services: Service[];
  onEditService: (s: Service) => void;
  onAddService: (categoryId: string) => void;
  onDeleteCategory: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
      <div className="flex items-center gap-4 p-5 border-b border-[var(--color-border)]" style={{ borderLeft: `4px solid ${category.color}` }}>
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-[var(--color-text-primary)]">{category.name}</span>
            <span className="text-xs text-[var(--color-text-muted)]">{services.length} servico{services.length !== 1 ? 's' : ''}</span>
          </div>
          {category.description && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">{category.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddService(category.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-all cursor-pointer"
          >
            + Adicionar servico
          </button>
          <button
            onClick={() => {
              if (confirm('Excluir esta categoria? Os servicos dentro dela tambem serao removidos.')) {
                onDeleteCategory(category.id);
              }
            }}
            className="p-1.5 rounded-lg hover:bg-[var(--color-rose-soft)] transition-all cursor-pointer group"
          >
            <svg className="w-4 h-4 stroke-[var(--color-text-muted)] group-hover:stroke-[var(--color-rose)] fill-none stroke-2" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="p-5">
        {services.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-4">Nenhum servico nesta categoria</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} onClick={onEditService} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
