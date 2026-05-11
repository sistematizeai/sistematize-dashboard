'use client';

import { useState, useEffect } from 'react';
import { AppointmentStatus } from '@/types';

export interface PendingStatusChange {
  appointmentId: string;
  clientName: string;
  targetStatus: AppointmentStatus;
  totalPrice: number;
}

interface StatusConfirmationModalProps {
  pending: PendingStatusChange | null;
  onConfirm: (extras?: { payment_method?: string; cancel_reason?: string }) => void | Promise<void>;
  onCancel: () => void;
}

const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX', icon: '◈' },
  { value: 'credit', label: 'Cartao de Credito', icon: '💳' },
  { value: 'debit', label: 'Cartao de Debito', icon: '💳' },
  { value: 'cash', label: 'Dinheiro', icon: '💵' },
];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function getConfig(status: AppointmentStatus) {
  switch (status) {
    case 'confirmed':
      return {
        title: 'Confirmar Agendamento',
        message: 'Deseja confirmar este agendamento?',
        confirmLabel: 'Confirmar',
        confirmClass: 'bg-[var(--color-green)] hover:brightness-110',
        iconColor: 'var(--color-green)',
        iconBg: 'var(--color-green-soft)',
        showPayment: false,
        showReason: false,
      };
    case 'in_progress':
      return {
        title: 'Iniciar Atendimento',
        message: 'Deseja iniciar o atendimento agora?',
        confirmLabel: 'Iniciar',
        confirmClass: 'bg-[var(--color-blue)] hover:brightness-110',
        iconColor: 'var(--color-blue)',
        iconBg: 'var(--color-blue-soft)',
        showPayment: false,
        showReason: false,
      };
    case 'completed':
      return {
        title: 'Finalizar Atendimento',
        message: 'Selecione a forma de pagamento para finalizar:',
        confirmLabel: 'Finalizar',
        confirmClass: 'bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] hover:brightness-110',
        iconColor: 'var(--color-green)',
        iconBg: 'var(--color-green-soft)',
        showPayment: true,
        showReason: false,
      };
    case 'cancelled':
      return {
        title: 'Cancelar Agendamento',
        message: 'Tem certeza que deseja cancelar? Esta acao nao pode ser desfeita.',
        confirmLabel: 'Sim, Cancelar',
        confirmClass: 'bg-[var(--color-rose)] hover:brightness-110',
        iconColor: 'var(--color-rose)',
        iconBg: 'var(--color-rose-soft)',
        showPayment: false,
        showReason: true,
      };
    case 'no_show':
      return {
        title: 'Nao Compareceu',
        message: 'Marcar este cliente como nao compareceu?',
        confirmLabel: 'Confirmar No-show',
        confirmClass: 'bg-[var(--color-amber)] hover:brightness-110',
        iconColor: 'var(--color-amber)',
        iconBg: 'var(--color-amber-soft)',
        showPayment: false,
        showReason: false,
      };
    default:
      return {
        title: 'Confirmar',
        message: 'Deseja prosseguir?',
        confirmLabel: 'Confirmar',
        confirmClass: 'bg-[var(--color-accent)] hover:brightness-110',
        iconColor: 'var(--color-accent)',
        iconBg: 'var(--color-accent-soft)',
        showPayment: false,
        showReason: false,
      };
  }
}

function StatusIcon({ status }: { status: AppointmentStatus }) {
  switch (status) {
    case 'confirmed':
      return (
        <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'in_progress':
      return (
        <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      );
    case 'completed':
      return (
        <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case 'cancelled':
      return (
        <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
    case 'no_show':
      return (
        <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    default:
      return null;
  }
}

export function StatusConfirmationModal({ pending, onConfirm, onCancel }: StatusConfirmationModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPaymentMethod('');
    setReason('');
    setLoading(false);
  }, [pending]);

  if (!pending) return null;

  const config = getConfig(pending.targetStatus);

  const handleConfirm = async () => {
    if (config.showPayment && !paymentMethod) return;
    setLoading(true);
    const extras: { payment_method?: string; cancel_reason?: string } = {};
    if (paymentMethod) extras.payment_method = paymentMethod;
    if (reason.trim()) extras.cancel_reason = reason.trim();
    await onConfirm(extras);
    setLoading(false);
  };

  const handleCancel = () => {
    setPaymentMethod('');
    setReason('');
    onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-[300] bg-[rgba(15,23,42,0.55)] backdrop-blur-[6px] flex items-center justify-center p-6"
      onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
    >
      <div
        className="rounded-[22px] p-[2px] bg-gradient-to-br from-[#4A6CF7] to-[#6C5CE7] shadow-[0_24px_80px_rgba(15,23,42,0.25)] animate-[modalIn_0.25s_ease] w-full max-w-[440px]"
      >
        <div className="bg-white rounded-[20px] p-7">
          {/* Icon + Title */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: config.iconBg, color: config.iconColor }}
            >
              <StatusIcon status={pending.targetStatus} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[var(--color-text-primary)]">{config.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{pending.clientName}</p>
            </div>
          </div>

          {/* Message */}
          <p className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed">{config.message}</p>

          {/* Payment method selector */}
          {config.showPayment && (
            <div className="mb-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                Forma de Pagamento
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => setPaymentMethod(pm.value)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                      paymentMethod === pm.value
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                        : 'border-[var(--color-border)] bg-white hover:border-[var(--color-accent-light)]'
                    }`}
                  >
                    <span className="text-base">{pm.icon}</span>
                    <span className={`text-sm font-semibold ${
                      paymentMethod === pm.value
                        ? 'text-[var(--color-accent)]'
                        : 'text-[var(--color-text-primary)]'
                    }`}>
                      {pm.label}
                    </span>
                  </button>
                ))}
              </div>
              {/* Total display */}
              <div className="flex items-center justify-between mt-3 px-1">
                <span className="text-xs text-[var(--color-text-muted)]">Total a receber</span>
                <span className="text-base font-extrabold text-[var(--color-text-primary)]">
                  {formatCurrency(pending.totalPrice)}
                </span>
              </div>
            </div>
          )}

          {/* Cancel reason */}
          {config.showReason && (
            <div className="mb-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                Motivo (opcional)
              </div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Informe o motivo do cancelamento..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all resize-none"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-5 py-3 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer"
            >
              Voltar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || (config.showPayment && !paymentMethod)}
              className={`flex-1 px-5 py-3 rounded-xl text-white text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${config.confirmClass}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processando...
                </span>
              ) : (
                config.confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
