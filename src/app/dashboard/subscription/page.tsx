'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api-client';
import { getApiErrorMessage } from '@/lib/errors';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  max_collaborators: number;
  max_services: number;
  max_appointments_month: number;
}

interface Subscription {
  id: string;
  plan_id: string;
  billing_cycle: string;
  value: number;
  status: string;
  next_due_date: string | null;
  started_at: string;
  pending_plan_id?: string | null;
  pending_billing_cycle?: string | null;
  pending_value?: number | null;
  pending_change_type?: 'upgrade' | 'downgrade' | null;
  pending_effective_at?: string | null;
  plan: Plan;
}

interface Invoice {
  id: string;
  value: number;
  status: string;
  due_date: string;
  paid_at: string | null;
  billing_type: string | null;
  invoice_url: string | null;
}

interface SubscribeResponse {
  payment_url?: string | null;
  change_type?: 'upgrade' | 'downgrade';
  effective_at?: string | null;
}

const card = 'bg-white rounded-2xl border border-[var(--color-border)] p-6';

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-[var(--color-green-soft)] text-[var(--color-green)]',
    paid: 'bg-[var(--color-green-soft)] text-[var(--color-green)]',
    trial: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
    overdue: 'bg-[var(--color-rose-soft)] text-[var(--color-rose)]',
    cancelled: 'bg-gray-100 text-gray-500',
    pending: 'bg-amber-50 text-amber-700',
    confirmed: 'bg-[var(--color-green-soft)] text-[var(--color-green)]',
    received: 'bg-[var(--color-green-soft)] text-[var(--color-green)]',
    blocked: 'bg-[var(--color-rose-soft)] text-[var(--color-rose)]',
  };
  const labels: Record<string, string> = {
    active: 'Ativa', paid: 'Paga', trial: 'Trial', overdue: 'Atrasada',
    cancelled: 'Cancelada', pending: 'Pendente', confirmed: 'Confirmado', received: 'Recebido',
    refunded: 'Reembolsado', deleted: 'Excluido', blocked: 'Bloqueada',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
      {labels[status] || status}
    </span>
  );
}

function AsaasCheckoutNotice() {
  return (
    <div className="mb-6 rounded-2xl border border-[var(--color-accent)]/20 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
            Pagamento seguro via Asaas
          </p>
          <h2 className="mt-1 text-lg font-bold text-[var(--color-text-primary)]">
            Ao assinar, uma nova aba abre o checkout do Asaas
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-secondary)]">
            O cliente conclui o pagamento diretamente no ambiente seguro do Asaas, com cartao,
            Pix/QR Code ou boleto conforme os metodos disponiveis na cobranca.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-[var(--color-text-secondary)]">
          <span className="rounded-xl bg-[var(--color-bg-surface)] px-3 py-2">Cartao</span>
          <span className="rounded-xl bg-[var(--color-bg-surface)] px-3 py-2">Pix QR Code</span>
          <span className="rounded-xl bg-[var(--color-bg-surface)] px-3 py-2">Boleto</span>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [subscribing, setSubscribing] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [plansRes, subRes, invRes] = await Promise.all([
        api.get('/api/subscription/plans'),
        api.get('/api/subscription/current'),
        api.get('/api/subscription/invoices?limit=10'),
      ]);
      setPlans(plansRes.data || []);
      setSubscription(subRes.data?.id ? subRes.data : null);
      setInvoices(invRes.data?.data || []);
    } catch {
      setError('Erro ao carregar dados de assinatura.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe(planId: string) {
    setSubscribing(true);
    setError('');
    setSuccess('');
    setPaymentUrl(null);
    try {
      const response = await api.post<SubscribeResponse>('/api/subscription/subscribe', {
        plan_id: planId,
        billing_cycle: billingCycle,
        billing_type: 'UNDEFINED',
      });
      const url = response.data?.payment_url || null;
      if (url) {
        setPaymentUrl(url);
        window.open(url, '_blank', 'noopener,noreferrer');
        setSuccess('Assinatura criada. Abrimos o checkout seguro do Asaas em uma nova aba para concluir o pagamento.');
      } else {
        setSuccess('Assinatura criada. Assim que o Asaas retornar a fatura, o botao de pagamento aparecera na lista abaixo.');
      }
      await loadData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao criar assinatura.'));
    } finally {
      setSubscribing(false);
    }
  }

  async function handleUpgrade(planId: string) {
    setUpgrading(true);
    setError('');
    setSuccess('');
    setPaymentUrl(null);
    try {
      const response = await api.put<SubscribeResponse>('/api/subscription/upgrade', {
        plan_id: planId,
        billing_cycle: billingCycle,
        billing_type: 'UNDEFINED',
      });
      const url = response.data?.payment_url || null;
      if (url) {
        setPaymentUrl(url);
        window.open(url, '_blank', 'noopener,noreferrer');
        setSuccess('Geramos a cobranca de upgrade. O plano muda somente depois da confirmacao do pagamento no Asaas.');
      } else {
        const effectiveAt = response.data?.effective_at
          ? new Date(response.data.effective_at).toLocaleDateString('pt-BR')
          : 'na proxima cobranca';
        setSuccess(`Downgrade agendado para ${effectiveAt}. Os beneficios atuais continuam ate o fim do ciclo.`);
      }
      await loadData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao atualizar plano.'));
    } finally {
      setUpgrading(false);
    }
  }

  async function handleCancel() {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura? Voce perdera acesso aos recursos do plano.')) return;
    setCancelling(true);
    setError('');
    try {
      await api.post('/api/subscription/cancel');
      setSuccess('Assinatura cancelada.');
      await loadData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao cancelar assinatura.'));
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentPlanId = subscription?.plan_id;
  const yearlyDiscount = Math.round((1 - (plans[0]?.price_yearly || 0) / ((plans[0]?.price_monthly || 1) * 12)) * 100);
  const payableInvoice = invoices.find(inv => ['pending', 'overdue'].includes(inv.status) && inv.invoice_url);

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Planos & Assinatura</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Gerencie seu plano e acompanhe seus pagamentos</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-[var(--color-rose-soft)] border border-[var(--color-rose)]/20 text-sm text-[var(--color-rose)] font-medium flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-[var(--color-green-soft)] border border-[var(--color-green)]/20 text-sm text-[var(--color-green)] font-medium flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>{success}</span>
          </div>
          {paymentUrl && (
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--color-green)] px-4 py-2 text-xs font-bold text-white transition-all hover:brightness-110"
            >
              Abrir checkout Asaas
            </a>
          )}
        </div>
      )}
      {subscription?.status === 'overdue' && (
        <div className="mb-6 p-4 rounded-xl bg-[var(--color-rose-soft)] border border-[var(--color-rose)]/20 text-sm text-[var(--color-rose)] font-medium flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>Sua assinatura esta atrasada. A conta fica restrita ate a regularizacao do pagamento.</span>
          {payableInvoice?.invoice_url && (
            <a
              href={payableInvoice.invoice_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--color-rose)] px-4 py-2 text-xs font-bold text-white transition-all hover:brightness-110"
            >
              Pagar agora no Asaas
            </a>
          )}
        </div>
      )}

      <AsaasCheckoutNotice />

      {/* Current Subscription */}
      {subscription && (
        <div className={`${card} mb-8`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Assinatura Atual</h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Plano {subscription.plan?.name} — {subscription.billing_cycle === 'yearly' ? 'Anual' : 'Mensal'}
              </p>
            </div>
            <StatusBadge status={subscription.status} />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[var(--color-bg-surface)]">
              <p className="text-xs text-[var(--color-text-muted)]">Valor</p>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{formatCurrency(subscription.value)}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">/{subscription.billing_cycle === 'yearly' ? 'ano' : 'mes'}</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-bg-surface)]">
              <p className="text-xs text-[var(--color-text-muted)]">Colaboradores</p>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{subscription.plan?.max_collaborators}</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-bg-surface)]">
              <p className="text-xs text-[var(--color-text-muted)]">Servicos</p>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{subscription.plan?.max_services}</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-bg-surface)]">
              <p className="text-xs text-[var(--color-text-muted)]">Agendamentos/mes</p>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{subscription.plan?.max_appointments_month}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--color-border)]">
            {subscription.next_due_date && (
              <p className="text-xs text-[var(--color-text-muted)]">
                Proxima cobranca: {new Date(subscription.next_due_date).toLocaleDateString('pt-BR')}
              </p>
            )}
            {subscription.pending_change_type && (
              <p className="text-xs font-semibold text-amber-700">
                {subscription.pending_change_type === 'upgrade'
                  ? 'Upgrade pendente de pagamento.'
                  : `Downgrade agendado para ${
                    subscription.pending_effective_at
                      ? new Date(subscription.pending_effective_at).toLocaleDateString('pt-BR')
                      : 'a proxima cobranca'
                  }.`}
              </p>
            )}
            <div className="ml-auto">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-rose)] hover:bg-[var(--color-rose-soft)] transition-all cursor-pointer disabled:opacity-50"
              >
                {cancelling ? 'Cancelando...' : 'Cancelar Assinatura'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            billingCycle === 'monthly'
              ? 'bg-[var(--color-accent)] text-white shadow-md'
              : 'bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
          }`}
        >
          Mensal
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            billingCycle === 'yearly'
              ? 'bg-[var(--color-accent)] text-white shadow-md'
              : 'bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
          }`}
        >
          Anual
          {yearlyDiscount > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold">
              -{yearlyDiscount}%
            </span>
          )}
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-3 gap-5 mb-10">
        {plans.map((plan, i) => {
          const isCurrent = plan.id === currentPlanId;
          const isPopular = i === 1;
          const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
          const monthlyEquivalent = billingCycle === 'yearly' ? plan.price_yearly / 12 : plan.price_monthly;
          const planChangeType = subscription && Number(price) < Number(subscription.value) ? 'downgrade' : 'upgrade';

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-6 transition-all ${
                isCurrent
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]/30'
                  : isPopular
                  ? 'border-[var(--color-accent)]/40 bg-white shadow-lg'
                  : 'border-[var(--color-border)] bg-white hover:border-[var(--color-accent)]/30'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                    Mais Popular
                  </span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-[var(--color-green)] text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                    Plano Atual
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold text-[var(--color-text-primary)] mt-2">{plan.name}</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 min-h-[32px]">{plan.description}</p>

              <div className="mt-4 mb-6">
                <span className="text-3xl font-extrabold text-[var(--color-text-primary)]">
                  {formatCurrency(monthlyEquivalent)}
                </span>
                <span className="text-sm text-[var(--color-text-muted)]">/mes</span>
                {billingCycle === 'yearly' && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {formatCurrency(price)} cobrado anualmente
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[var(--color-green)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-sm text-[var(--color-text-secondary)]">Ate <strong>{plan.max_collaborators}</strong> colaborador{plan.max_collaborators > 1 ? 'es' : ''}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[var(--color-green)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-sm text-[var(--color-text-secondary)]">Ate <strong>{plan.max_services}</strong> servicos</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[var(--color-green)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-sm text-[var(--color-text-secondary)]">Ate <strong>{plan.max_appointments_month}</strong> agendamentos/mes</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[var(--color-green)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-sm text-[var(--color-text-secondary)]">Pagina publica de agendamento</span>
                </div>
              </div>

              {isCurrent ? (
                <button disabled className="w-full py-3 rounded-xl bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] text-sm font-semibold cursor-default">
                  Plano Atual
                </button>
              ) : subscription ? (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={upgrading}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 ${
                    isPopular
                      ? 'bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white hover:brightness-110'
                      : 'border-2 border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]'
                  }`}
                >
                  {upgrading
                    ? 'Abrindo Asaas...'
                    : planChangeType === 'downgrade'
                      ? 'Agendar para proxima cobranca'
                      : 'Mudar e pagar no Asaas'}
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscribing}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 ${
                    isPopular
                      ? 'bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white hover:brightness-110'
                      : 'border-2 border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]'
                  }`}
                >
                  {subscribing ? 'Abrindo Asaas...' : 'Assinar e abrir Asaas'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Invoices */}
      {invoices.length > 0 && (
        <div className={card}>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Ultimas Faturas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)]">
                  <th className="pb-3 font-semibold">Vencimento</th>
                  <th className="pb-3 font-semibold">Valor</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Pago em</th>
                  <th className="pb-3 font-semibold text-right">Acao</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-3.5 font-medium">{new Date(inv.due_date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3.5 font-bold">{formatCurrency(inv.value)}</td>
                    <td className="py-3.5"><StatusBadge status={inv.status} /></td>
                    <td className="py-3.5 text-[var(--color-text-muted)]">
                      {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="py-3.5 text-right">
                      {inv.invoice_url && inv.status === 'pending' && (
                        <a
                          href={inv.invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:brightness-110 transition-all inline-flex items-center gap-1.5"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          Pagar no Asaas
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
