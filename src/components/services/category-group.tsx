'use client';

import { useState } from 'react';
import { Category, Service } from '@/types';
import { ServiceCard } from './service-card';

export function CategoryGroup({
  category,
  services,
  onEditService,
  onAddService,
  onDeleteCategory,
  onEditCategory,
  onQuickAction,
}: {
  category: Category;
  services: Service[];
  onEditService: (s: Service) => void;
  onAddService: (categoryId: string) => void;
  onDeleteCategory: (id: string) => void;
  onEditCategory: (c: Category) => void;
  onQuickAction?: (action: string, service: Service) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
      <div
        className="flex items-center gap-4 p-5 border-b border-[var(--color-border)] cursor-pointer select-none"
        style={{ borderLeft: `4px solid ${category.color}` }}
        onClick={() => setCollapsed(!collapsed)}
      >
        {/* Chevron */}
        <svg
          className={`w-4 h-4 stroke-[var(--color-text-muted)] stroke-2 fill-none shrink-0 transition-transform ${collapsed ? '-rotate-90' : ''}`}
          viewBox="0 0 24 24"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-[var(--color-text-primary)]">{category.name}</span>
            <span className="px-2 py-0.5 rounded-md bg-[var(--color-bg-surface)] text-[10px] font-bold text-[var(--color-text-muted)]">
              {services.length}
            </span>
          </div>
          {category.description && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">{category.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onAddService(category.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-all cursor-pointer"
          >
            + Servico
          </button>
          <button
            onClick={() => onEditCategory(category)}
            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer"
            title="Editar categoria"
          >
            <svg className="w-4 h-4 stroke-[var(--color-text-muted)] fill-none stroke-2" viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={() => {
              if (confirm('Excluir esta categoria? Os servicos dentro dela tambem serao removidos.')) {
                onDeleteCategory(category.id);
              }
            }}
            className="p-1.5 rounded-lg hover:bg-[var(--color-rose-soft)] transition-all cursor-pointer group/del"
          >
            <svg className="w-4 h-4 stroke-[var(--color-text-muted)] group-hover/del:stroke-[var(--color-rose)] fill-none stroke-2" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-5">
          {services.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--color-text-muted)] mb-2">Nenhum servico nesta categoria</p>
              <button
                onClick={() => onAddService(category.id)}
                className="text-xs font-medium text-[var(--color-accent)] hover:underline cursor-pointer"
              >
                Adicionar primeiro servico
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {services.map((s) => (
                <ServiceCard key={s.id} service={s} onClick={onEditService} onQuickAction={onQuickAction} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
