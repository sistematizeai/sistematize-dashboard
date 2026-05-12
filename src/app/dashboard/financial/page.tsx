'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api-client';

const card = 'bg-white rounded-2xl border border-[var(--color-border)] p-6';

interface PaymentSummary {
  received_month: number;
  pending_total: number;
  overdue_total: number;
  pending_count: number;
  overdue_count: number;
}

interface Payment {
  id: string;
  billing_type: string;
  value: number;
  due_date: string;
  status: string;
  invoice_url: string | null;
  pix_qr_code: string | null;
  pix_payload: string | null;
  created_at: string;
  client: { id: string; name: string; phone: string | null; email: string | null } | null;
  appointment: { id: string; date: string; start_time: string; status: string } | null;
}

interface AsaasStatus {
  connected: boolean;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  RECEIVED: { label: 'Recebido', color: 'bg-green-50 text-green-700 border-green-200' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-green-50 text-green-700 border-green-200' },
  OVERDUE: { label: 'Vencido', color: 'bg-red-50 text-red-700 border-red-200' },
  REFUNDED: { label: 'Reembolsado', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  CANCELLED: { label: 'Cancelado', color: 'bg-gray-50 text-gray-500 border-gray-200' },
  DELETED: { label: 'Excluido', color: 'bg-gray-50 text-gray-500 border-gray-200' },
};

const BILLING_LABELS: Record<string, string> = {
  PIX: 'Pix',
  BOLETO: 'Boleto',
  CREDIT_CARD: 'Cartao',
  UNDEFINED: 'Escolha do cliente',
};

function money(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export default function FinancialPage() {
  const [asaasStatus, setAsaasStatus] = useState<AsaasStatus | null>(null);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [billingFilter, setBillingFilter] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadPayments(); }, [page, statusFilter, billingFilter]);

  async function loadAll() {
    try {
      const [statusRes, summaryRes] = await Promise.all([
        api.get('/api/integrations/asaas/status'),
        api.get('/api/asaas/payments/summary'),
      ]);
      setAsaasStatus(statusRes.data);
      setSummary(summaryRes.data);
    } catch {
      setAsaasStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }

  async function loadPayments() {
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (statusFilter) params.set('status', statusFilter);
      if (billingFilter) params.set('billing_type', billingFilter);
      const { data } = await api.get(`/api/asaas/payments?${params}`);
      setPayments(data.data || []);
      setTotal(data.total || 0);
    } catch {
      setPayments([]);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('Tem certeza que deseja cancelar esta cobranca?')) return;
    try {
      await api.post(`/api/asaas/payments/${id}/cancel`);
      loadPayments();
      loadAll();
    } catch { /* ignore */ }
  }

  function copyLink(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!asaasStatus?.connected) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Financeiro</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          Conecte sua conta Asaas para visualizar pagamentos e cobrancas.
        </p>
        <a
          href="/dashboard/settings"
          className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all"
        >
          Ir para Integracoes
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Financeiro</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Pagamentos e cobrancas via Asaas</p>
        </div>
      </div>

      {/* KPIs */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={card}>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Recebido no mes</p>
            <p className="text-2xl font-bold text-green-600">{money(summary.received_month)}</p>
          </div>
          <div className={card}>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Pendentes</p>
            <p className="text-2xl font-bold text-amber-600">{money(summary.pending_total)}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{summary.pending_count} cobranca(s)</p>
          </div>
          <div className={card}>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Vencidos</p>
            <p className="text-2xl font-bold text-red-600">{money(summary.overdue_total)}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{summary.overdue_count} cobranca(s)</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm bg-white cursor-pointer"
        >
          <option value="">Todos os status</option>
          <option value="PENDING">Pendente</option>
          <option value="RECEIVED">Recebido</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="OVERDUE">Vencido</option>
          <option value="REFUNDED">Reembolsado</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
        <select
          value={billingFilter}
          onChange={e => { setBillingFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm bg-white cursor-pointer"
        >
          <option value="">Todas as formas</option>
          <option value="PIX">Pix</option>
          <option value="BOLETO">Boleto</option>
          <option value="CREDIT_CARD">Cartao</option>
          <option value="UNDEFINED">Escolha do cliente</option>
        </select>
      </div>

      {/* Payments table */}
      <div className={`${card} overflow-hidden !p-0`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)]">Cliente</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)]">Valor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)]">Forma</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)]">Vencimento</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)]">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)]">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-[var(--color-text-muted)]">Nenhuma cobranca encontrada</td></tr>
              )}
              {payments.map(p => {
                const st = STATUS_LABELS[p.status] || { label: p.status, color: 'bg-gray-50 text-gray-500 border-gray-200' };
                return (
                  <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-surface)]/50">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[var(--color-text-primary)]">{p.client?.name || '-'}</p>
                      {p.appointment && (
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          {new Date(p.appointment.date + 'T00:00:00').toLocaleDateString('pt-BR')} as {p.appointment.start_time}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[var(--color-text-primary)]">{money(Number(p.value))}</td>
                    <td className="px-5 py-3.5 text-[var(--color-text-secondary)]">{BILLING_LABELS[p.billing_type] || p.billing_type}</td>
                    <td className="px-5 py-3.5 text-[var(--color-text-secondary)]">
                      {new Date(p.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.invoice_url && (
                          <button
                            onClick={() => copyLink(p.invoice_url!, p.id)}
                            className="text-xs text-[var(--color-accent)] hover:underline cursor-pointer"
                          >
                            {copied === p.id ? 'Copiado!' : 'Copiar link'}
                          </button>
                        )}
                        {['PENDING', 'OVERDUE'].includes(p.status) && (
                          <button
                            onClick={() => handleCancel(p.id)}
                            className="text-xs text-red-500 hover:underline cursor-pointer"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)]">{total} cobranca(s) no total</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--color-border)] hover:bg-[var(--color-bg-surface)] disabled:opacity-40 cursor-pointer"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= total}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--color-border)] hover:bg-[var(--color-bg-surface)] disabled:opacity-40 cursor-pointer"
              >
                Proximo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
