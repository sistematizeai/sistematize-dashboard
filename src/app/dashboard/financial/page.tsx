'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api-client';
import { getApiErrorMessage } from '@/lib/errors';

const card = 'bg-white rounded-2xl border border-[var(--color-border)] p-6';
const inputClass = 'px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm bg-white focus:outline-none focus:border-[var(--color-accent)]';

interface FinancialSummary {
  received_total: number;
  pending_total: number;
  commission_total: number;
  records_count: number;
}

interface FinancialRecord {
  id: string;
  type: string;
  source: string;
  status: string;
  payment_method: string;
  amount: number;
  commission_amount: number;
  occurred_on: string;
  description: string | null;
  client: { id: string; name: string } | null;
  collaborator: { id: string; name: string } | null;
  service: { id: string; name: string } | null;
  appointment: { id: string; date: string; start_time: string; status: string } | null;
}

interface Payment {
  id: string;
  billing_type: string;
  value: number;
  due_date: string;
  status: string;
  invoice_url: string | null;
  client: { id: string; name: string } | null;
  appointment: { id: string; date: string; start_time: string; status: string } | null;
}

interface Option {
  id: string;
  name: string;
}

interface AsaasStatus {
  connected: boolean;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  received: { label: 'Recebido', color: 'bg-green-50 text-green-700 border-green-200' },
  pending: { label: 'Pendente', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-50 text-gray-500 border-gray-200' },
  PENDING: { label: 'Pendente', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  RECEIVED: { label: 'Recebido', color: 'bg-green-50 text-green-700 border-green-200' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-green-50 text-green-700 border-green-200' },
  OVERDUE: { label: 'Vencido', color: 'bg-red-50 text-red-700 border-red-200' },
  REFUNDED: { label: 'Reembolsado', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  CANCELLED: { label: 'Cancelado', color: 'bg-gray-50 text-gray-500 border-gray-200' },
};

const PAYMENT_LABELS: Record<string, string> = {
  pix: 'Pix',
  credit: 'Credito',
  debit: 'Debito',
  cash: 'Dinheiro',
  external: 'Externo',
  asaas: 'Asaas',
  PIX: 'Pix',
  BOLETO: 'Boleto',
  CREDIT_CARD: 'Cartao',
  UNDEFINED: 'Escolha do cliente',
};

function money(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0));
}

function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function downloadCsv(csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'financeiro.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function FinancialPage() {
  const [asaasStatus, setAsaasStatus] = useState<AsaasStatus | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Option[]>([]);
  const [collaborators, setCollaborators] = useState<Option[]>([]);
  const [services, setServices] = useState<Option[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    status: '',
    payment_method: '',
    client_id: '',
    collaborator_id: '',
    service_id: '',
  });
  const [form, setForm] = useState({
    amount: '',
    payment_method: 'pix',
    occurred_on: today(),
    status: 'received',
    client_id: '',
    collaborator_id: '',
    service_id: '',
    description: '',
  });

  async function loadBootstrap() {
    try {
      const [statusRes, clientsRes, collaboratorsRes, servicesRes] = await Promise.allSettled([
        api.get('/api/integrations/asaas/status'),
        api.get('/api/clients?limit=100'),
        api.get('/api/collaborators'),
        api.get('/api/services'),
      ]);

      if (statusRes.status === 'fulfilled') setAsaasStatus(statusRes.value.data);
      else setAsaasStatus({ connected: false });
      if (clientsRes.status === 'fulfilled') setClients(clientsRes.value.data.data || []);
      if (collaboratorsRes.status === 'fulfilled') setCollaborators(collaboratorsRes.value.data || []);
      if (servicesRes.status === 'fulfilled') setServices(servicesRes.value.data || []);
    } finally {
      setLoading(false);
    }
  }

  const financialParams = useCallback(function financialParams(limit = 20) {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params;
  }, [filters, page]);

  const loadFinancialData = useCallback(async function loadFinancialData() {
    try {
      setError('');
      const params = financialParams();
      const [recordsRes, summaryRes, paymentsRes] = await Promise.allSettled([
        api.get(`/api/financial/records?${params}`),
        api.get(`/api/financial/summary?${params}`),
        api.get('/api/asaas/payments?limit=5'),
      ]);

      if (recordsRes.status === 'fulfilled') {
        setRecords(recordsRes.value.data.data || []);
        setTotal(recordsRes.value.data.total || 0);
      } else {
        setRecords([]);
        setTotal(0);
        setError(getApiErrorMessage(recordsRes.reason, 'Erro ao carregar financeiro.'));
      }
      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data);
      if (paymentsRes.status === 'fulfilled') setPayments(paymentsRes.value.data.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erro ao carregar financeiro.'));
    }
  }, [financialParams]);

  useEffect(() => {
    loadBootstrap();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFinancialData();
  }, [loadFinancialData]);

  async function handleCreateIncome(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/api/financial/manual-income', {
        amount: Number(form.amount),
        payment_method: form.payment_method,
        occurred_on: form.occurred_on,
        status: form.status,
        client_id: form.client_id || undefined,
        collaborator_id: form.collaborator_id || undefined,
        service_id: form.service_id || undefined,
        description: form.description.trim() || undefined,
      });
      setForm({
        amount: '',
        payment_method: 'pix',
        occurred_on: today(),
        status: 'received',
        client_id: '',
        collaborator_id: '',
        service_id: '',
        description: '',
      });
      setPage(1);
      await loadFinancialData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erro ao registrar receita.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    try {
      const { data } = await api.get(`/api/financial/export?${financialParams(1000)}`, { responseType: 'text' });
      downloadCsv(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erro ao exportar financeiro.'));
    }
  }

  function setFilter(key: keyof typeof filters, value: string) {
    setFilters(current => ({ ...current, [key]: value }));
    setPage(1);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Financeiro</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Receitas internas, comissoes e cobrancas Asaas
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-semibold hover:bg-[var(--color-bg-surface)] transition-colors"
        >
          Exportar CSV
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className={card}>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Recebido</p>
            <p className="text-2xl font-bold text-green-600">{money(summary.received_total)}</p>
          </div>
          <div className={card}>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Pendente</p>
            <p className="text-2xl font-bold text-amber-600">{money(summary.pending_total)}</p>
          </div>
          <div className={card}>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Comissoes</p>
            <p className="text-2xl font-bold text-[var(--color-accent)]">{money(summary.commission_total)}</p>
          </div>
          <div className={card}>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Lancamentos</p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{summary.records_count}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleCreateIncome} className={card}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Registrar receita manual</h2>
          <span className="text-xs text-[var(--color-text-muted)]">Pix, cartao, dinheiro ou pagamento externo</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            placeholder="Valor"
            required
            className={inputClass}
          />
          <select value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })} className={inputClass}>
            <option value="pix">Pix</option>
            <option value="credit">Credito</option>
            <option value="debit">Debito</option>
            <option value="cash">Dinheiro</option>
            <option value="external">Externo</option>
          </select>
          <input type="date" value={form.occurred_on} onChange={e => setForm({ ...form, occurred_on: e.target.value })} required className={inputClass} />
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputClass}>
            <option value="received">Recebido</option>
            <option value="pending">Pendente</option>
          </select>
          <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} className={inputClass}>
            <option value="">Cliente opcional</option>
            {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
          </select>
          <select value={form.collaborator_id} onChange={e => setForm({ ...form, collaborator_id: e.target.value })} className={inputClass}>
            <option value="">Profissional opcional</option>
            {collaborators.map(collaborator => <option key={collaborator.id} value={collaborator.id}>{collaborator.name}</option>)}
          </select>
          <select value={form.service_id} onChange={e => setForm({ ...form, service_id: e.target.value })} className={inputClass}>
            <option value="">Servico opcional</option>
            {services.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}
          </select>
          <input
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Descricao"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold disabled:opacity-60"
        >
          {saving ? 'Salvando...' : 'Salvar receita'}
        </button>
      </form>

      <div className="flex flex-wrap gap-3">
        <input type="date" value={filters.date_from} onChange={e => setFilter('date_from', e.target.value)} className={inputClass} />
        <input type="date" value={filters.date_to} onChange={e => setFilter('date_to', e.target.value)} className={inputClass} />
        <select value={filters.status} onChange={e => setFilter('status', e.target.value)} className={inputClass}>
          <option value="">Todos os status</option>
          <option value="received">Recebido</option>
          <option value="pending">Pendente</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <select value={filters.payment_method} onChange={e => setFilter('payment_method', e.target.value)} className={inputClass}>
          <option value="">Todas as formas</option>
          <option value="pix">Pix</option>
          <option value="credit">Credito</option>
          <option value="debit">Debito</option>
          <option value="cash">Dinheiro</option>
          <option value="external">Externo</option>
          <option value="asaas">Asaas</option>
        </select>
        <select value={filters.client_id} onChange={e => setFilter('client_id', e.target.value)} className={inputClass}>
          <option value="">Todos os clientes</option>
          {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
        </select>
        <select value={filters.collaborator_id} onChange={e => setFilter('collaborator_id', e.target.value)} className={inputClass}>
          <option value="">Todos os profissionais</option>
          {collaborators.map(collaborator => <option key={collaborator.id} value={collaborator.id}>{collaborator.name}</option>)}
        </select>
        <select value={filters.service_id} onChange={e => setFilter('service_id', e.target.value)} className={inputClass}>
          <option value="">Todos os servicos</option>
          {services.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}
        </select>
      </div>

      <div className={`${card} overflow-hidden !p-0`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)]">Data</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)]">Origem</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)]">Cliente</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)]">Profissional</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)]">Forma</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)]">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)]">Valor</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)]">Comissao</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-[var(--color-text-muted)]">Nenhum lancamento encontrado</td></tr>
              )}
              {records.map(record => {
                const st = STATUS_LABELS[record.status] || { label: record.status, color: 'bg-gray-50 text-gray-500 border-gray-200' };
                return (
                  <tr key={record.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-surface)]/50">
                    <td className="px-5 py-3.5 text-[var(--color-text-secondary)]">
                      {new Date(record.occurred_on + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--color-text-secondary)]">{record.source}</td>
                    <td className="px-5 py-3.5 text-[var(--color-text-primary)]">{record.client?.name || '-'}</td>
                    <td className="px-5 py-3.5 text-[var(--color-text-primary)]">
                      <p>{record.collaborator?.name || '-'}</p>
                      {record.service && <p className="text-xs text-[var(--color-text-muted)]">{record.service.name}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--color-text-secondary)]">{PAYMENT_LABELS[record.payment_method] || record.payment_method}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-[var(--color-text-primary)]">{money(record.amount)}</td>
                    <td className="px-5 py-3.5 text-right text-[var(--color-text-secondary)]">{money(record.commission_amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {total > 20 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)]">{total} lancamento(s) no total</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--color-border)] hover:bg-[var(--color-bg-surface)] disabled:opacity-40">Anterior</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--color-border)] hover:bg-[var(--color-bg-surface)] disabled:opacity-40">Proximo</button>
            </div>
          </div>
        )}
      </div>

      <div className={card}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Cobrancas Asaas</h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              {asaasStatus?.connected ? 'Ultimas cobrancas sincronizadas pela integracao.' : 'Integre o Asaas em Configuracoes para emitir cobrancas online.'}
            </p>
          </div>
          {!asaasStatus?.connected && (
            <a href="/dashboard/settings" className="text-sm font-semibold text-[var(--color-accent)] hover:underline">Configurar Asaas</a>
          )}
        </div>
        {payments.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] py-4">Nenhuma cobranca Asaas encontrada.</p>
        ) : (
          <div className="space-y-2">
            {payments.map(payment => {
              const st = STATUS_LABELS[payment.status] || { label: payment.status, color: 'bg-gray-50 text-gray-500 border-gray-200' };
              return (
                <div key={payment.id} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{payment.client?.name || '-'}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{PAYMENT_LABELS[payment.billing_type] || payment.billing_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--color-text-primary)]">{money(payment.value)}</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${st.color}`}>{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
