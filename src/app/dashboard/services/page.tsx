'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api-client';
import { Category, Combo, Service } from '@/types';
import { CategoryGroup } from '@/components/services/category-group';
import { ServiceEditModal } from '@/components/services/service-edit-modal';
import { ServiceFormModal } from '@/components/services/service-form-modal';
import { CategoryFormModal } from '@/components/services/category-form-modal';
import { ComboFormModal } from '@/components/services/combo-form-modal';
import { ComboCard } from '@/components/services/combo-card';
import { KpiCard } from '@/components/ui/kpi-card';

export default function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editService, setEditService] = useState<Service | null>(null);
  const [showNewService, setShowNewService] = useState<string | undefined>(undefined);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [showComboForm, setShowComboForm] = useState(false);
  const [editCombo, setEditCombo] = useState<Combo | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'combos'>('services');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setError(null);
      const [catRes, svcRes, comboRes] = await Promise.all([
        api.get('/api/categories'),
        api.get('/api/services'),
        api.get('/api/combos'),
      ]);
      setCategories(catRes.data || []);
      setServices(svcRes.data || []);
      setCombos(comboRes.data || []);
    } catch {
      setError('Erro ao carregar servicos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void fetchData();
    });
  }, []);

  const handleDeleteCategory = async (id: string) => {
    try {
      await api.delete(`/api/categories/${id}`);
      fetchData();
    } catch {
      setError('Erro ao excluir categoria. Verifique se nao ha servicos vinculados.');
    }
  };

  const filteredServices = useMemo(() => {
    if (!search.trim()) return services;
    const q = search.toLowerCase();
    return services.filter((s) =>
      s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
    );
  }, [services, search]);

  const filteredCombos = useMemo(() => {
    if (!search.trim()) return combos;
    const q = search.toLowerCase();
    return combos.filter((c) =>
      c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
    );
  }, [combos, search]);

  const servicesByCategory = categories.map((cat) => ({
    category: cat,
    services: filteredServices.filter((s) => s.category_id === cat.id),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeServices = services.filter((s) => s.is_active);
  const activeCombos = combos.filter((c) => c.is_active);
  const noImageCount = services.filter((s) => !s.image_url).length + combos.filter((c) => !c.image_url).length;

  return (
    <div>
      {error && (
        <div className="mb-5 p-4 bg-[var(--color-rose-soft)] border border-[rgba(239,68,68,0.2)] rounded-xl text-[var(--color-rose)] text-sm font-medium flex items-center justify-between">
          {error}
          <button onClick={fetchData} className="ml-3 underline cursor-pointer">Tentar novamente</button>
        </div>
      )}

      {/* Hero Panel */}
      <div className="bg-white -mx-7 -mt-6 px-7 pt-2 pb-5 border-b border-[var(--color-border)] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Servicos e Combos</h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Gerencie seu catalogo de servicos, categorias e combos
            </p>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => setShowNewCategory(true)}
              className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer"
            >
              Nova Categoria
            </button>
            <button
              onClick={() => setShowComboForm(true)}
              className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer"
            >
              Novo Combo
            </button>
            <button
              onClick={() => setShowNewService('')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer flex items-center gap-2"
            >
              <svg className="w-4 h-4 stroke-white stroke-2 fill-none" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Novo Servico
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <KpiCard
            label="Total Servicos"
            value={services.length}
            iconBg="var(--color-accent-soft)"
            icon={
              <svg className="w-5 h-5 stroke-[var(--color-accent)] stroke-2 fill-none" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            }
          />
          <KpiCard
            label="Categorias"
            value={categories.length}
            iconBg="var(--color-blue-soft)"
            icon={
              <svg className="w-5 h-5 stroke-[var(--color-blue)] stroke-2 fill-none" viewBox="0 0 24 24">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            }
          />
          <KpiCard
            label="Servicos Ativos"
            value={activeServices.length}
            iconBg="var(--color-green-soft)"
            icon={
              <svg className="w-5 h-5 stroke-[var(--color-green)] stroke-2 fill-none" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            }
          />
          <KpiCard
            label="Combos"
            value={activeCombos.length}
            iconBg="var(--color-amber-soft)"
            icon={
              <svg className="w-5 h-5 stroke-[var(--color-amber)] stroke-2 fill-none" viewBox="0 0 24 24">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a4 4 0 0 0-8 0v2" />
              </svg>
            }
          />
          <KpiCard
            label="Sem Imagem"
            value={noImageCount}
            iconBg={noImageCount > 0 ? 'var(--color-rose-soft)' : 'var(--color-green-soft)'}
            icon={
              noImageCount > 0 ? (
                <svg className="w-5 h-5 stroke-[var(--color-rose)] stroke-2 fill-none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 stroke-[var(--color-green)] stroke-2 fill-none" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )
            }
          />
        </div>
      </div>

      {/* Search + Tab bar */}
      <div className="flex items-center justify-between mt-6 gap-4">
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'services'
                ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]'
            }`}
          >
            Servicos ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('combos')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'combos'
                ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]'
            }`}
          >
            Combos ({combos.length})
          </button>
        </div>

        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 stroke-[var(--color-text-muted)] stroke-2 fill-none" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar servicos ou combos..."
            className="w-64 pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--color-text-muted)] flex items-center justify-center cursor-pointer hover:bg-[var(--color-text-secondary)] transition-colors"
            >
              <svg className="w-2.5 h-2.5 stroke-white stroke-2 fill-none" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'services' ? (
        <div className="space-y-5 mt-5">
          {search && filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-[var(--color-text-muted)]">Nenhum servico encontrado para &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            <>
              {servicesByCategory
                .filter(({ services: catSvcs }) => !search || catSvcs.length > 0)
                .map(({ category, services: catServices }) => (
                  <CategoryGroup
                    key={category.id}
                    category={category}
                    services={catServices}
                    onEditService={setEditService}
                    onAddService={(catId) => setShowNewService(catId)}
                    onDeleteCategory={handleDeleteCategory}
                    onEditCategory={setEditCategory}
                  />
                ))}
              {categories.length === 0 && !search && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-7 h-7 stroke-[var(--color-accent)] stroke-[1.5] fill-none" viewBox="0 0 24 24">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Nenhuma categoria criada ainda</p>
                  <p className="text-xs text-[var(--color-text-muted)] mb-4">Crie categorias para organizar seus servicos.</p>
                  <button onClick={() => setShowNewCategory(true)} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer">
                    Criar primeira categoria
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="mt-5">
          {search && filteredCombos.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-[var(--color-text-muted)]">Nenhum combo encontrado para &ldquo;{search}&rdquo;</p>
            </div>
          ) : filteredCombos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-amber-soft)] flex items-center justify-center mb-4">
                <svg className="w-7 h-7 stroke-[var(--color-amber)] stroke-[1.5] fill-none" viewBox="0 0 24 24">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a4 4 0 0 0-8 0v2" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Nenhum combo criado</p>
              <p className="text-xs text-[var(--color-text-muted)] mb-4">Crie combos agrupando servicos com precos especiais.</p>
              <button
                onClick={() => setShowComboForm(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer"
              >
                Criar primeiro combo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredCombos.map((combo) => (
                <ComboCard key={combo.id} combo={combo} onClick={setEditCombo} />
              ))}
            </div>
          )}
        </div>
      )}

      <ServiceEditModal service={editService} categories={categories} onClose={() => setEditService(null)} onSaved={fetchData} />

      {showNewService !== undefined && (
        <ServiceFormModal categories={categories} defaultCategoryId={showNewService || undefined} onClose={() => setShowNewService(undefined)} onCreated={fetchData} />
      )}

      {(showNewCategory || editCategory) && (
        <CategoryFormModal
          category={editCategory}
          onClose={() => { setShowNewCategory(false); setEditCategory(null); }}
          onCreated={fetchData}
        />
      )}

      {showComboForm && (
        <ComboFormModal
          services={services}
          onClose={() => setShowComboForm(false)}
          onSaved={() => { setShowComboForm(false); fetchData(); }}
        />
      )}

      {editCombo && (
        <ComboFormModal
          combo={editCombo}
          services={services}
          onClose={() => setEditCombo(null)}
          onSaved={() => { setEditCombo(null); fetchData(); }}
        />
      )}
    </div>
  );
}
