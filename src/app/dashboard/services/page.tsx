'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api-client';
import { Category, Service } from '@/types';
import { CategoryGroup } from '@/components/services/category-group';
import { ServiceEditModal } from '@/components/services/service-edit-modal';
import { ServiceFormModal } from '@/components/services/service-form-modal';
import { CategoryFormModal } from '@/components/services/category-form-modal';

export default function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editService, setEditService] = useState<Service | null>(null);
  const [showNewService, setShowNewService] = useState<string | undefined>(undefined);
  const [showNewCategory, setShowNewCategory] = useState(false);

  const fetchData = async () => {
    try {
      const [catRes, svcRes] = await Promise.all([
        api.get('/api/categories'),
        api.get('/api/services'),
      ]);
      setCategories(catRes.data);
      setServices(svcRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteCategory = async (id: string) => {
    await api.delete(`/api/categories/${id}`);
    fetchData();
  };

  const servicesByCategory = categories.map((cat) => ({
    category: cat,
    services: services.filter((s) => s.category_id === cat.id),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight">Servicos</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {categories.length} categoria{categories.length !== 1 ? 's' : ''} · {services.length} servico{services.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => setShowNewCategory(true)}
            className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer"
          >
            Nova Categoria
          </button>
          <button
            onClick={() => setShowNewService('')}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold hover:bg-[#6d28d9] transition-all cursor-pointer"
          >
            Novo Servico
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {servicesByCategory.map(({ category, services: catServices }) => (
          <CategoryGroup
            key={category.id}
            category={category}
            services={catServices}
            onEditService={setEditService}
            onAddService={(catId) => setShowNewService(catId)}
            onDeleteCategory={handleDeleteCategory}
          />
        ))}
        {categories.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[var(--color-text-muted)] text-sm">Nenhuma categoria criada ainda.</p>
            <button onClick={() => setShowNewCategory(true)} className="mt-3 text-sm font-medium text-[var(--color-accent)] hover:underline cursor-pointer">
              Criar primeira categoria
            </button>
          </div>
        )}
      </div>

      <ServiceEditModal service={editService} categories={categories} onClose={() => setEditService(null)} onSaved={fetchData} />

      {showNewService !== undefined && (
        <ServiceFormModal categories={categories} defaultCategoryId={showNewService || undefined} onClose={() => setShowNewService(undefined)} onCreated={fetchData} />
      )}

      {showNewCategory && (
        <CategoryFormModal onClose={() => setShowNewCategory(false)} onCreated={fetchData} />
      )}
    </div>
  );
}
