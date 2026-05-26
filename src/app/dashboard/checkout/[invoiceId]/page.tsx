'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api-client';
import { getApiErrorMessage } from '@/lib/errors';

type CheckoutMode = 'pix' | 'card' | 'boleto';

interface CheckoutInvoice {
  id: string;
  value: number;
  status: string;
  due_date: string;
  billing_type: string | null;
  invoice_url: string | null;
  bank_slip_url: string | null;
  pix_qr_code: string | null;
  pix_payload: string | null;
  purpose?: string | null;
}

interface CheckoutSubscription {
  id: string;
  billing_cycle: string;
  pending_change_type?: 'upgrade' | 'downgrade' | null;
  plan?: { name: string } | null;
  pending_plan?: { name: string } | null;
}

interface CheckoutData {
  invoice: CheckoutInvoice;
  subscription: CheckoutSubscription | null;
  asaas_fallback_url: string | null;
}

const fieldClass = 'w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-all focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10';
const labelClass = 'mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR');
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'Aguardando pagamento',
    overdue: 'Vencida',
    confirmed: 'Confirmada',
    received: 'Recebida',
    cancelled: 'Cancelada',
    refunded: 'Reembolsada',
    PENDING: 'Aguardando pagamento',
    OVERDUE: 'Vencida',
    CONFIRMED: 'Confirmada',
    RECEIVED: 'Recebida',
  };
  return labels[status] || status;
}

function isPaid(status: string) {
  return ['confirmed', 'received', 'CONFIRMED', 'RECEIVED'].includes(status);
}

export default function CheckoutPage() {
  const params = useParams<{ invoiceId: string }>();
  const router = useRouter();
  const invoiceId = params.invoiceId;

  const [data, setData] = useState<CheckoutData | null>(null);
  const [mode, setMode] = useState<CheckoutMode>('pix');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [copyLabel, setCopyLabel] = useState('Copiar codigo Pix');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    holder_name: '',
    number: '',
    expiry_month: '',
    expiry_year: '',
    ccv: '',
    name: '',
    email: '',
    cpf_cnpj: '',
    postal_code: '',
    address_number: '',
    phone: '',
  });

  const loadCheckout = useCallback(async () => {
    setError('');
    try {
      const response = await api.get<CheckoutData>(`/api/subscription/checkout/${invoiceId}`);
      setData(response.data);
      if (!response.data.invoice.pix_payload && response.data.invoice.bank_slip_url) {
        setMode('boleto');
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao carregar checkout.'));
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadCheckout();
    });
  }, [loadCheckout]);

  const description = useMemo(() => {
    const invoice = data?.invoice;
    const subscription = data?.subscription;
    if (!invoice) return '';
    if (invoice.purpose === 'plan_change') {
      return `Mudanca para Plano ${subscription?.pending_plan?.name || 'selecionado'}`;
    }
    return `Assinatura Plano ${subscription?.plan?.name || 'Sistematize'}`;
  }, [data]);

  async function copyPix() {
    if (!data?.invoice.pix_payload) return;
    await navigator.clipboard.writeText(data.invoice.pix_payload);
    setCopyLabel('Codigo copiado');
    window.setTimeout(() => setCopyLabel('Copiar codigo Pix'), 1800);
  }

  async function submitCard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPaying(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post(`/api/subscription/checkout/${invoiceId}/pay-card`, {
        credit_card: {
          holder_name: form.holder_name,
          number: form.number.replace(/\D/g, ''),
          expiry_month: form.expiry_month,
          expiry_year: form.expiry_year,
          ccv: form.ccv,
        },
        holder_info: {
          name: form.name,
          email: form.email,
          cpf_cnpj: form.cpf_cnpj,
          postal_code: form.postal_code,
          address_number: form.address_number,
          phone: form.phone || undefined,
        },
      });
      setSuccess(response.data?.paid
        ? 'Pagamento confirmado. Seu plano sera atualizado automaticamente.'
        : 'Pagamento enviado. Assim que a Asaas confirmar, atualizaremos seu plano.');
      await loadCheckout();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Nao foi possivel processar o cartao.'));
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  const invoice = data?.invoice;

  if (!invoice) {
    return (
      <div className="mx-auto max-w-[860px] rounded-2xl border border-[var(--color-border)] bg-white p-8">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Checkout indisponivel</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{error || 'Fatura nao encontrada.'}</p>
        <button
          onClick={() => router.push('/dashboard/subscription')}
          className="mt-5 rounded-xl bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-white"
        >
          Voltar para assinatura
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1120px]">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">Checkout seguro</p>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Finalizar pagamento</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Pagamento processado pela Asaas com tokenizacao de cartao.</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/subscription')}
          className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-accent)]"
        >
          Voltar
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-[var(--color-rose)]/20 bg-[var(--color-rose-soft)] p-4 text-sm font-medium text-[var(--color-rose)]">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-5 rounded-xl border border-[var(--color-green)]/20 bg-[var(--color-green-soft)] p-4 text-sm font-medium text-[var(--color-green)]">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Fatura</p>
              <h2 className="mt-1 text-lg font-bold text-[var(--color-text-primary)]">{description}</h2>
            </div>
            <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
              {statusLabel(invoice.status)}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[var(--color-bg-surface)] p-4">
              <p className="text-xs text-[var(--color-text-muted)]">Valor total</p>
              <p className="mt-2 text-2xl font-extrabold text-[var(--color-text-primary)]">{formatCurrency(invoice.value)}</p>
            </div>
            <div className="rounded-xl bg-[var(--color-bg-surface)] p-4">
              <p className="text-xs text-[var(--color-text-muted)]">Vencimento</p>
              <p className="mt-2 text-lg font-bold text-[var(--color-text-primary)]">{formatDate(invoice.due_date)}</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[var(--color-border)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Seguranca</p>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Os dados do cartao sao enviados ao backend somente para gerar o token seguro da Asaas.
              A Sistematize salva apenas token, bandeira e ultimos digitos.
            </p>
          </div>

          {isPaid(invoice.status) && (
            <div className="mt-5 rounded-xl bg-[var(--color-green-soft)] p-4 text-sm font-semibold text-[var(--color-green)]">
              Esta fatura ja foi paga. Nenhuma nova acao e necessaria.
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <div className="mb-5 grid grid-cols-3 rounded-xl bg-[var(--color-bg-surface)] p-1">
            {(['pix', 'card', 'boleto'] as CheckoutMode[]).map(item => (
              <button
                key={item}
                onClick={() => setMode(item)}
                className={`rounded-lg px-3 py-2.5 text-sm font-bold transition-all ${
                  mode === item
                    ? 'bg-white text-[var(--color-accent)] shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]'
                }`}
              >
                {item === 'pix' ? 'Pix' : item === 'card' ? 'Cartao' : 'Boleto'}
              </button>
            ))}
          </div>

          {mode === 'pix' && (
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Pagar com Pix</h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Escaneie o QR Code ou copie o codigo Pix.</p>
              {invoice.pix_qr_code ? (
                <div className="mt-5 grid gap-5 md:grid-cols-[220px_1fr]">
                  <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                    <Image
                      src={`data:image/png;base64,${invoice.pix_qr_code}`}
                      alt="QR Code Pix"
                      width={220}
                      height={220}
                      unoptimized
                      className="h-full w-full rounded-xl object-contain"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Pix copia e cola</label>
                    <textarea
                      readOnly
                      value={invoice.pix_payload || ''}
                      className={`${fieldClass} min-h-[150px] resize-none text-xs`}
                    />
                    <button
                      onClick={copyPix}
                      disabled={!invoice.pix_payload}
                      className="mt-3 w-full rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
                    >
                      {copyLabel}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-xl bg-[var(--color-bg-surface)] p-5 text-sm text-[var(--color-text-secondary)]">
                  QR Code Pix ainda nao retornado pela Asaas. Recarregue a pagina em alguns segundos ou use boleto/cartao.
                </div>
              )}
            </div>
          )}

          {mode === 'boleto' && (
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Pagar com boleto</h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Abra o boleto gerado pela Asaas para pagar no banco ou aplicativo.</p>
              <a
                href={invoice.bank_slip_url || data?.asaas_fallback_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-5 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  invoice.bank_slip_url || data?.asaas_fallback_url
                    ? 'bg-[var(--color-accent)] text-white hover:brightness-110'
                    : 'pointer-events-none bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]'
                }`}
              >
                Abrir boleto
              </a>
            </div>
          )}

          {mode === 'card' && (
            <form onSubmit={submitCard}>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Pagar com cartao</h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">O cartao sera tokenizado no Asaas antes da cobranca.</p>

              <div className="mt-5 grid gap-4">
                <div>
                  <label className={labelClass}>Nome impresso no cartao</label>
                  <input className={fieldClass} required value={form.holder_name} onChange={e => setForm({ ...form, holder_name: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Numero do cartao</label>
                  <input className={fieldClass} required inputMode="numeric" maxLength={19} value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Mes</label>
                    <input className={fieldClass} required inputMode="numeric" maxLength={2} value={form.expiry_month} onChange={e => setForm({ ...form, expiry_month: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Ano</label>
                    <input className={fieldClass} required inputMode="numeric" maxLength={4} value={form.expiry_year} onChange={e => setForm({ ...form, expiry_year: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>CVV</label>
                    <input className={fieldClass} required inputMode="numeric" maxLength={4} value={form.ccv} onChange={e => setForm({ ...form, ccv: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="my-5 h-px bg-[var(--color-border)]" />

              <div className="grid gap-4">
                <div>
                  <label className={labelClass}>Nome do titular</label>
                  <input className={fieldClass} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Email</label>
                    <input className={fieldClass} required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>CPF/CNPJ</label>
                    <input className={fieldClass} required value={form.cpf_cnpj} onChange={e => setForm({ ...form, cpf_cnpj: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className={labelClass}>CEP</label>
                    <input className={fieldClass} required value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Numero</label>
                    <input className={fieldClass} required value={form.address_number} onChange={e => setForm({ ...form, address_number: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Telefone</label>
                    <input className={fieldClass} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={paying || isPaid(invoice.status)}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] px-4 py-3.5 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
              >
                {paying ? 'Tokenizando e pagando...' : `Pagar ${formatCurrency(invoice.value)}`}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
