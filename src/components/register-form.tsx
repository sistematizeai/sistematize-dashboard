'use client';

import { useState } from 'react';
import api from '@/lib/api-client';
import { getApiErrorMessage } from '@/lib/errors';
import { maskDocument, maskPhone, unmask } from '@/lib/masks';

const inputClass =
  'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-deep)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all';

const selectClass =
  'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-deep)] px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all appearance-none cursor-pointer';

const btnPrimary =
  'rounded-xl py-3 px-6 text-sm font-semibold text-white transition-all bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] hover:brightness-110 disabled:opacity-50 cursor-pointer';

const btnSecondary =
  'rounded-xl py-3 px-6 text-sm font-semibold text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer';

const STEPS = [
  { num: 1, label: 'Conta' },
  { num: 2, label: 'Negocio' },
  { num: 3, label: 'Operacao' },
  { num: 4, label: 'Objetivos' },
  { num: 5, label: 'Revisao' },
];

const SEGMENTS = [
  'Salao de Beleza', 'Barbearia', 'Studio de Estetica', 'Clinica de Estetica',
  'Nail Designer', 'Micropigmentacao', 'Spa', 'Outro',
];

const BUSINESS_TYPES = ['MEI', 'Microempresa (ME)', 'Autonomo', 'Outro'];

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

const PROFESSIONALS = ['Apenas eu', '2 a 3', '4 a 6', '7 a 10', '11+'];

const APPOINTMENTS_RANGE = ['Ate 50', '51 a 100', '101 a 200', '201 a 500', '500+'];

const SCHEDULING_METHODS = [
  'WhatsApp', 'Telefone', 'Papel/agenda fisica', 'Outro sistema', 'Nenhum controle',
];

const SYSTEM_USAGE = [
  'Nao uso nenhum', 'Uso planilha/Excel', 'Uso outro software', 'Uso papel/caderno',
];

const DIFFICULTIES = [
  'Faltas e cancelamentos', 'Organizacao da agenda', 'Controle financeiro',
  'Comunicacao com clientes', 'Gestao de equipe', 'Outro',
];

const REVENUE_RANGES = [
  'Ate R$ 3.000', 'R$ 3.001 a R$ 8.000', 'R$ 8.001 a R$ 15.000',
  'R$ 15.001 a R$ 30.000', 'Acima de R$ 30.000',
];

const GOALS = [
  'Reduzir faltas/cancelamentos', 'Organizar melhor a agenda', 'Aumentar faturamento',
  'Profissionalizar o negocio', 'Pagina de agendamento online', 'Automatizar WhatsApp',
];

const INTEREST_LEVELS = ['Sim, muito interesse', 'Talvez, quero saber mais', 'Nao no momento'];

const CONTACT_TIMES = ['Manha (8h-12h)', 'Tarde (12h-18h)', 'Noite (18h-22h)', 'Qualquer horario'];

interface FormData {
  full_name: string;
  email: string;
  password: string;
  document: string;
  business_name: string;
  segment: string;
  business_type: string;
  city: string;
  state: string;
  whatsapp: string;
  instagram: string;
  professionals_count: string;
  monthly_appointments_range: string;
  current_scheduling_method: string;
  current_system_usage: string;
  main_difficulty: string;
  monthly_revenue_range: string;
  main_goal: string;
  whatsapp_automation_interest: string;
  public_booking_page_interest: string;
  digital_catalog_interest: string;
  best_contact_time: string;
  accepted_terms: boolean;
  accepted_marketing: boolean;
}

const initial: FormData = {
  full_name: '', email: '', password: '', document: '',
  business_name: '', segment: '', business_type: '', city: '', state: '', whatsapp: '', instagram: '',
  professionals_count: '', monthly_appointments_range: '', current_scheduling_method: '', current_system_usage: '', main_difficulty: '',
  monthly_revenue_range: '', main_goal: '', whatsapp_automation_interest: '', public_booking_page_interest: '', digital_catalog_interest: '', best_contact_time: '',
  accepted_terms: false, accepted_marketing: false,
};

function OptionCard({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${
        selected
          ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-semibold ring-2 ring-[var(--color-accent-soft)]'
          : 'border-[var(--color-border)] bg-[var(--color-bg-deep)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-light)] hover:bg-[var(--color-bg-surface)]'
      }`}
    >
      <span className="flex items-center gap-3">
        <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          selected ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-[var(--color-border)]'
        }`}>
          {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
        </span>
        {label}
      </span>
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">
      {children}
    </label>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ caracteres', ok: password.length >= 8 },
    { label: 'Letra maiuscula', ok: /[A-Z]/.test(password) },
    { label: 'Letra minuscula', ok: /[a-z]/.test(password) },
    { label: 'Numero', ok: /\d/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
      {checks.map(c => (
        <span key={c.label} className={`flex items-center gap-1 text-[11px] ${c.ok ? 'text-[var(--color-green)]' : 'text-[var(--color-text-muted)]'}`}>
          {c.ok ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><circle cx="12" cy="12" r="9" /></svg>
          )}
          {c.label}
        </span>
      ))}
    </div>
  );
}

export function RegisterForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initial);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState('');

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => setForm(f => ({ ...f, [key]: value }));

  const passwordValid = form.password.length >= 8 && /[A-Z]/.test(form.password) && /[a-z]/.test(form.password) && /\d/.test(form.password);

  const canNext = (s: number) => {
    switch (s) {
      case 1: return form.full_name.length >= 2 && form.email.includes('@') && unmask(form.document).length >= 11 && passwordValid;
      case 2: return form.business_name.length >= 2 && form.segment && form.business_type && form.city && form.state && unmask(form.whatsapp).length >= 10;
      case 3: return form.professionals_count && form.monthly_appointments_range && form.current_scheduling_method && form.current_system_usage && form.main_difficulty;
      case 4: return form.monthly_revenue_range && form.main_goal && form.whatsapp_automation_interest && form.public_booking_page_interest && form.digital_catalog_interest && form.best_contact_time;
      case 5: return form.accepted_terms;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, document: unmask(form.document), whatsapp: unmask(form.whatsapp) };
      const res = await api.post('/api/auth/register', payload);
      setConfirmedEmail(res.data.email);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao criar conta. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await api.post('/api/auth/resend-confirmation', { email: confirmedEmail });
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  if (confirmedEmail) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-6">
          <img src="/logo-sistematize.png" alt="Sistematize" className="h-7 mx-auto" draggable={false} />
        </div>

        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[var(--color-green-soft)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[var(--color-green)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Verifique seu email</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-1">
          Enviamos um link de confirmacao para
        </p>
        <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-6">{confirmedEmail}</p>

        <div className="bg-[var(--color-bg-surface)] rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Clique no link do email para ativar sua conta. Verifique tambem a pasta de spam.
            O link expira em 24 horas.
          </p>
        </div>

        <button onClick={handleResend} disabled={loading} className={`${btnSecondary} w-full mb-4`}>
          {loading ? 'Reenviando...' : 'Reenviar email'}
        </button>

        <a href="/login" className="text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors">
          Voltar ao login
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="mb-6">
        <img src="/logo-sistematize.png" alt="Sistematize" className="h-7" draggable={false} />
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1 mb-7">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
              step > s.num
                ? 'bg-[var(--color-green)] text-white'
                : step === s.num
                  ? 'bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white'
                  : 'bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
            }`}>
              {step > s.num ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              ) : s.num}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${step > s.num ? 'bg-[var(--color-green)]' : 'bg-[var(--color-border)]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step title */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{STEPS[step - 1].label}</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Etapa {step} de 5</p>
      </div>

      {/* ===== STEP 1: Conta ===== */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <FieldLabel>Nome completo</FieldLabel>
            <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Seu nome" autoComplete="name" className={inputClass} />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="seu@email.com" autoComplete="email" className={inputClass} />
          </div>
          <div>
            <FieldLabel>CPF ou CNPJ</FieldLabel>
            <input value={form.document} onChange={e => set('document', maskDocument(e.target.value))} placeholder="000.000.000-00" className={inputClass} />
          </div>
          <div>
            <FieldLabel>Senha</FieldLabel>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="Minimo 8 caracteres"
                autoComplete="new-password"
                className={`${inputClass} pr-11`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer" tabIndex={-1}>
                {showPassword ? (
                  <svg className="w-[18px] h-[18px] stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg className="w-[18px] h-[18px] stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            <PasswordStrength password={form.password} />
          </div>
        </div>
      )}

      {/* ===== STEP 2: Negocio ===== */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <FieldLabel>Nome do negocio</FieldLabel>
            <input value={form.business_name} onChange={e => set('business_name', e.target.value)} placeholder="Ex: Studio Ana Beleza" className={inputClass} />
          </div>
          <div>
            <FieldLabel>Segmento</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {SEGMENTS.map(s => <OptionCard key={s} label={s} selected={form.segment === s} onClick={() => set('segment', s)} />)}
            </div>
          </div>
          <div>
            <FieldLabel>Tipo de negocio</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {BUSINESS_TYPES.map(t => <OptionCard key={t} label={t} selected={form.business_type === t} onClick={() => set('business_type', t)} />)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Cidade</FieldLabel>
              <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Sua cidade" className={inputClass} />
            </div>
            <div>
              <FieldLabel>Estado</FieldLabel>
              <div className="relative">
                <select value={form.state} onChange={e => set('state', e.target.value)} className={selectClass}>
                  <option value="">UF</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>WhatsApp</FieldLabel>
              <input value={form.whatsapp} onChange={e => set('whatsapp', maskPhone(e.target.value))} placeholder="(11) 99999-9999" className={inputClass} />
            </div>
            <div>
              <FieldLabel>Instagram (opcional)</FieldLabel>
              <input value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@seunegocio" className={inputClass} />
            </div>
          </div>
        </div>
      )}

      {/* ===== STEP 3: Operacao ===== */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <FieldLabel>Quantos profissionais?</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {PROFESSIONALS.map(p => <OptionCard key={p} label={p} selected={form.professionals_count === p} onClick={() => set('professionals_count', p)} />)}
            </div>
          </div>
          <div>
            <FieldLabel>Agendamentos por mes</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {APPOINTMENTS_RANGE.map(a => <OptionCard key={a} label={a} selected={form.monthly_appointments_range === a} onClick={() => set('monthly_appointments_range', a)} />)}
            </div>
          </div>
          <div>
            <FieldLabel>Como agenda hoje?</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {SCHEDULING_METHODS.map(m => <OptionCard key={m} label={m} selected={form.current_scheduling_method === m} onClick={() => set('current_scheduling_method', m)} />)}
            </div>
          </div>
          <div>
            <FieldLabel>Usa algum sistema?</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {SYSTEM_USAGE.map(u => <OptionCard key={u} label={u} selected={form.current_system_usage === u} onClick={() => set('current_system_usage', u)} />)}
            </div>
          </div>
          <div>
            <FieldLabel>Maior dificuldade</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {DIFFICULTIES.map(d => <OptionCard key={d} label={d} selected={form.main_difficulty === d} onClick={() => set('main_difficulty', d)} />)}
            </div>
          </div>
        </div>
      )}

      {/* ===== STEP 4: Objetivos ===== */}
      {step === 4 && (
        <div className="space-y-5">
          <div>
            <FieldLabel>Faturamento mensal</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {REVENUE_RANGES.map(r => <OptionCard key={r} label={r} selected={form.monthly_revenue_range === r} onClick={() => set('monthly_revenue_range', r)} />)}
            </div>
          </div>
          <div>
            <FieldLabel>Principal objetivo</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map(g => <OptionCard key={g} label={g} selected={form.main_goal === g} onClick={() => set('main_goal', g)} />)}
            </div>
          </div>
          <div>
            <FieldLabel>Interesse em automacao WhatsApp</FieldLabel>
            <div className="space-y-2">
              {INTEREST_LEVELS.map(l => <OptionCard key={l} label={l} selected={form.whatsapp_automation_interest === l} onClick={() => set('whatsapp_automation_interest', l)} />)}
            </div>
          </div>
          <div>
            <FieldLabel>Interesse em pagina de agendamento online</FieldLabel>
            <div className="space-y-2">
              {INTEREST_LEVELS.map(l => <OptionCard key={l} label={l} selected={form.public_booking_page_interest === l} onClick={() => set('public_booking_page_interest', l)} />)}
            </div>
          </div>
          <div>
            <FieldLabel>Interesse em catalogo digital</FieldLabel>
            <div className="space-y-2">
              {INTEREST_LEVELS.map(l => <OptionCard key={l} label={l} selected={form.digital_catalog_interest === l} onClick={() => set('digital_catalog_interest', l)} />)}
            </div>
          </div>
          <div>
            <FieldLabel>Melhor horario para contato</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {CONTACT_TIMES.map(t => <OptionCard key={t} label={t} selected={form.best_contact_time === t} onClick={() => set('best_contact_time', t)} />)}
            </div>
          </div>
        </div>
      )}

      {/* ===== STEP 5: Revisao ===== */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="bg-[var(--color-bg-surface)] rounded-xl p-4 space-y-3">
            <ReviewSection title="Conta" items={[
              ['Nome', form.full_name], ['Email', form.email], ['CPF/CNPJ', form.document],
            ]} />
            <div className="h-px bg-[var(--color-border)]" />
            <ReviewSection title="Negocio" items={[
              ['Nome', form.business_name], ['Segmento', form.segment],
              ['Tipo', form.business_type], ['Cidade', `${form.city} - ${form.state}`],
              ['WhatsApp', form.whatsapp], ...(form.instagram ? [['Instagram', form.instagram] as [string, string]] : []),
            ]} />
            <div className="h-px bg-[var(--color-border)]" />
            <ReviewSection title="Operacao" items={[
              ['Profissionais', form.professionals_count], ['Agendamentos/mes', form.monthly_appointments_range],
              ['Metodo atual', form.current_scheduling_method], ['Sistema atual', form.current_system_usage],
              ['Dificuldade', form.main_difficulty],
            ]} />
            <div className="h-px bg-[var(--color-border)]" />
            <ReviewSection title="Objetivos" items={[
              ['Faturamento', form.monthly_revenue_range], ['Objetivo', form.main_goal],
              ['Automacao WhatsApp', form.whatsapp_automation_interest],
              ['Pagina online', form.public_booking_page_interest],
              ['Catalogo digital', form.digital_catalog_interest],
              ['Contato', form.best_contact_time],
            ]} />
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={form.accepted_terms}
              onChange={e => set('accepted_terms', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent-soft)] cursor-pointer"
            />
            <span className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Li e aceito os <a href="/terms" target="_blank" className="font-semibold text-[var(--color-accent)] hover:underline">Termos de Uso</a> e a{' '}
              <a href="/privacy" target="_blank" className="font-semibold text-[var(--color-accent)] hover:underline">Politica de Privacidade</a>.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={form.accepted_marketing}
              onChange={e => set('accepted_marketing', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent-soft)] cursor-pointer"
            />
            <span className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Aceito receber novidades e dicas por email (opcional).
            </span>
          </label>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--color-rose-soft)] border border-red-100 mt-4">
          <svg className="w-4 h-4 stroke-[var(--color-rose)] flex-shrink-0" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-xs text-[var(--color-rose)] font-medium">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-6">
        {step > 1 && (
          <button type="button" onClick={() => { setStep(step - 1); setError(''); }} className={btnSecondary}>
            Voltar
          </button>
        )}
        <div className="flex-1" />
        {step < 5 ? (
          <button type="button" onClick={() => { setStep(step + 1); setError(''); }} disabled={!canNext(step)} className={btnPrimary}>
            Proximo
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={!canNext(5) || loading} className={`${btnPrimary} flex-1`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Criando conta...
              </span>
            ) : 'Criar conta gratis'}
          </button>
        )}
      </div>

      {/* Login link */}
      <div className="mt-5 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Ja tem uma conta?{' '}
          <a href="/login" className="font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors">
            Entre aqui
          </a>
        </p>
      </div>
    </div>
  );
}

function ReviewSection({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <p className="text-xs font-bold text-[var(--color-text-primary)] mb-2 uppercase tracking-wide">{title}</p>
      <div className="space-y-1">
        {items.map(([label, value]) => (
          <div key={label} className="flex justify-between text-xs">
            <span className="text-[var(--color-text-muted)]">{label}</span>
            <span className="text-[var(--color-text-primary)] font-medium text-right max-w-[60%] truncate">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
