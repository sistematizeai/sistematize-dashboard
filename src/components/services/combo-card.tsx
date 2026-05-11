'use client';

import type { Combo } from '@/types';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function ComboCard({ combo, onClick, onQuickAction }: {
  combo: Combo;
  onClick: (c: Combo) => void;
  onQuickAction?: (action: string, combo: Combo) => void;
}) {
  const totalDuration = combo.services?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0;
  const sumPrice = combo.services?.reduce((sum, s) => sum + s.price, 0) || 0;
  const hasDiscount = combo.price < sumPrice;

  return (
    <div
      onClick={() => onClick(combo)}
      className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden cursor-pointer hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:border-[var(--color-accent)] transition-all group relative"
    >
      {/* 16:9 Image area */}
      <div className="w-full aspect-[16/9] relative overflow-hidden">
        {combo.image_url ? (
          <img
            src={combo.image_url}
            alt={combo.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#f0eeff] to-[#e8e5ff] flex items-center justify-center">
            <svg className="w-10 h-10 stroke-[var(--color-accent)] opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1}>
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a4 4 0 0 0-8 0v2" />
            </svg>
          </div>
        )}

        {/* Status + Combo badge overlay */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-[var(--color-accent)] text-[10px] font-bold text-white uppercase tracking-wide">
            Combo
          </span>
          {!combo.is_active && (
            <span className="px-2 py-0.5 rounded-md bg-white/80 backdrop-blur-sm text-[10px] font-bold text-[var(--color-text-muted)] uppercase">
              Inativo
            </span>
          )}
        </div>

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[var(--color-green)] text-[10px] font-bold text-white">
            -{Math.round((1 - combo.price / sumPrice) * 100)}%
          </div>
        )}

        {/* Quick actions */}
        {onQuickAction && (
          <button
            onClick={(e) => { e.stopPropagation(); onQuickAction('menu', combo); }}
            className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-white"
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
          {combo.name}
        </h3>
        {combo.description && (
          <p className="text-xs text-[var(--color-text-muted)] mb-2 line-clamp-1 leading-relaxed">{combo.description}</p>
        )}

        {/* Service pills */}
        <div className="flex flex-wrap gap-1 mb-3">
          {combo.services?.slice(0, 4).map((svc) => (
            <span
              key={svc.id}
              className="px-2 py-0.5 rounded-md bg-[var(--color-accent-soft)] text-[10px] font-medium text-[var(--color-accent)]"
            >
              {svc.name}
            </span>
          ))}
          {(combo.services?.length || 0) > 4 && (
            <span className="px-2 py-0.5 rounded-md bg-[var(--color-bg-surface)] text-[10px] font-medium text-[var(--color-text-muted)]">
              +{(combo.services?.length || 0) - 4}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 stroke-[var(--color-text-muted)] stroke-[1.5] fill-none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-xs text-[var(--color-text-muted)]">{totalDuration}min</span>
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)]">{combo.services?.length || 0} servicos</span>
          </div>
          <div className="text-right">
            {hasDiscount && (
              <span className="text-[10px] text-[var(--color-text-muted)] line-through mr-1">
                {formatCurrency(sumPrice)}
              </span>
            )}
            <span className="text-sm font-extrabold text-[var(--color-accent)]">
              {formatCurrency(combo.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
