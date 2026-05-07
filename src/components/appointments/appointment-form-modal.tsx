'use client';

import { useState, useMemo } from 'react';
import { Client, Collaborator, Service } from '@/types';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api-client';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

interface AppointmentFormModalProps {
  clients: Client[];
  collaborators: Collaborator[];
  services: Service[];
  onClose: () => void;
  onCreated: () => void;
}

export function AppointmentFormModal({
  clients,
  collaborators,
  services,
  onClose,
  onCreated,
}: AppointmentFormModalProps) {
  const [clientSearch, setClientSearch] = useState('');
  const [clientId, setClientId] = useState('');
  const [collaboratorId, setCollaboratorId] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q),
    );
  }, [clients, clientSearch]);

  const selectedClient = clients.find((c) => c.id === clientId);

  const { totalPrice, totalDuration } = useMemo(() => {
    let price = 0;
    let duration = 0;
    for (const sid of selectedServiceIds) {
      const svc = services.find((s) => s.id === sid);
      if (svc) {
        price += svc.price;
        duration += svc.duration_minutes;
      }
    }
    return { totalPrice: price, totalDuration: duration };
  }, [selectedServiceIds, services]);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (!clientId || !collaboratorId || selectedServiceIds.length === 0) return;
    setSaving(true);
    try {
      await api.post('/api/appointments', {
        client_id: clientId,
        collaborator_id: collaboratorId,
        date,
        start_time: startTime,
        service_ids: selectedServiceIds,
        notes: notes || undefined,
      });
      onCreated();
    } catch {
      // Error handled by api interceptor
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all';

  return (
    <Modal open onClose={onClose} maxWidth="640px">
      <h2 className="text-xl font-extrabold text-[var(--color-text-primary)] mb-6 pr-10">
        Novo Agendamento
      </h2>

      <div className="flex flex-col gap-5">
        {/* Client searchable select */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
            Cliente
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={selectedClient ? selectedClient.name : clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value);
                setClientId('');
                setShowClientDropdown(true);
              }}
              onFocus={() => setShowClientDropdown(true)}
              onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
              className={inputClass}
            />
            {showClientDropdown && filteredClients.length > 0 && !clientId && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[var(--color-border)] shadow-[0_8px_24px_rgba(0,0,0,0.1)] max-h-[200px] overflow-y-auto z-10">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setClientId(c.id);
                      setClientSearch('');
                      setShowClientDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--color-bg-surface)] transition-colors cursor-pointer"
                  >
                    <span className="font-medium text-[var(--color-text-primary)]">{c.name}</span>
                    {c.phone && (
                      <span className="text-[var(--color-text-muted)] ml-2">{c.phone}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Services pill grid */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
            Servicos
          </label>
          <div className="flex flex-wrap gap-2">
            {services
              .filter((s) => s.is_active)
              .map((svc) => {
                const isSelected = selectedServiceIds.includes(svc.id);
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => toggleService(svc.id)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                        : 'bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent-light)]'
                    }`}
                  >
                    <span>{svc.name}</span>
                    <span className={`ml-1.5 text-xs ${isSelected ? 'opacity-80' : 'text-[var(--color-text-muted)]'}`}>
                      {svc.duration_minutes}min &middot; {formatCurrency(svc.price)}
                    </span>
                  </button>
                );
              })}
          </div>
          {selectedServiceIds.length > 0 && (
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="text-[var(--color-text-muted)]">
                Total: <strong className="text-[var(--color-text-primary)]">{formatCurrency(totalPrice)}</strong>
              </span>
              <span className="text-[var(--color-text-muted)]">
                Duracao: <strong className="text-[var(--color-text-primary)]">{totalDuration} min</strong>
              </span>
            </div>
          )}
        </div>

        {/* Collaborator */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
            Colaborador
          </label>
          <select
            value={collaboratorId}
            onChange={(e) => setCollaboratorId(e.target.value)}
            className={inputClass}
          >
            <option value="">Selecionar colaborador...</option>
            {collaborators
              .filter((c) => c.is_active)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>

        {/* Date + Time row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
              Horario
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
            Observacoes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Observacoes opcionais..."
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-[var(--color-border-light)]">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={!clientId || !collaboratorId || selectedServiceIds.length === 0 || saving}
          className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold hover:bg-[#6d28d9] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Salvando...' : 'Salvar Agendamento'}
        </button>
      </div>
    </Modal>
  );
}
