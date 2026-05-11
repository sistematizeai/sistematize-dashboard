'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import api from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import type { Business, BusinessHours, BookingSettings, NotificationSettings } from '@/types';

/* ── constants ── */
const DAYS = [
  { key: 'mon', label: 'Segunda-feira', short: 'Seg' },
  { key: 'tue', label: 'Terca-feira', short: 'Ter' },
  { key: 'wed', label: 'Quarta-feira', short: 'Qua' },
  { key: 'thu', label: 'Quinta-feira', short: 'Qui' },
  { key: 'fri', label: 'Sexta-feira', short: 'Sex' },
  { key: 'sat', label: 'Sabado', short: 'Sab' },
  { key: 'sun', label: 'Domingo', short: 'Dom' },
];
const STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const DEFAULT_HOURS: BusinessHours = DAYS.reduce((a, d) => { a[d.key] = { open: '08:00', close: '18:00', enabled: d.key !== 'sun' }; return a; }, {} as BusinessHours);
const DEFAULT_BOOKING: BookingSettings = { min_interval_minutes: 0, min_advance_hours: 1, max_advance_days: 30, allow_overlap: false, auto_confirm: false, hero_layout: 'split', show_hero_badges: true };
const DEFAULT_NOTIF: NotificationSettings = { email_reminder_enabled: false, reminder_advance_hours: 24, confirmation_template: 'Seu agendamento foi confirmado!', reminder_template: 'Lembrete: voce tem um agendamento amanha.' };

/* ── styles ── */
const input = 'w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all';
const label = 'block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5';
const card = 'bg-white rounded-2xl border border-[var(--color-border)] p-6';
const sTitle = 'text-[15px] font-bold text-[var(--color-text-primary)]';
const sDesc = 'text-xs text-[var(--color-text-muted)] mt-0.5';

type Tab = 'general' | 'hours' | 'public' | 'agenda' | 'notifications' | 'team' | 'account';

/* ── components ── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${checked ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

function SectionHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center shrink-0 mt-0.5 text-[var(--color-accent)]">{icon}</div>
      <div><h3 className={sTitle}>{title}</h3><p className={sDesc}>{desc}</p></div>
    </div>
  );
}

/* ── main ── */
export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [biz, setBiz] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('general');
  const [dirty, setDirty] = useState(false);
  const [whatsAppSame, setWhatsAppSame] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const initialSnap = useRef('');

  const [form, setForm] = useState({
    name: '', phone: '', whatsapp: '', cep: '', address: '', city: '', state: '',
    cnpj: '', description: '', instagram: '', facebook: '', tiktok: '',
    welcome_message: '', primary_color: '#4F5AE5', cancellation_policy: '', booking_enabled: true,
  });
  const [hours, setHours] = useState<BusinessHours>(DEFAULT_HOURS);
  const [booking, setBooking] = useState<BookingSettings>(DEFAULT_BOOKING);
  const [notif, setNotif] = useState<NotificationSettings>(DEFAULT_NOTIF);

  const snap = useCallback(() => JSON.stringify({ form, hours, booking, notif }), [form, hours, booking, notif]);

  useEffect(() => { if (initialSnap.current) setDirty(snap() !== initialSnap.current); }, [snap]);

  useEffect(() => { loadBiz(); }, []);

  async function loadBiz() {
    try {
      const { data } = await api.get<Business>('/api/businesses/me');
      setBiz(data);
      const f = {
        name: data.name || '', phone: data.phone || '', whatsapp: data.whatsapp || '',
        cep: data.cep || '', address: data.address || '', city: data.city || '', state: data.state || '',
        cnpj: data.cnpj || '', description: data.description || '',
        instagram: data.instagram || '', facebook: data.facebook || '', tiktok: data.tiktok || '',
        welcome_message: data.welcome_message || '', primary_color: data.primary_color || '#4F5AE5',
        cancellation_policy: data.cancellation_policy || '', booking_enabled: data.booking_enabled ?? true,
      };
      setForm(f);
      const h = data.business_hours ? { ...DEFAULT_HOURS, ...data.business_hours } : DEFAULT_HOURS;
      const b = data.booking_settings ? { ...DEFAULT_BOOKING, ...data.booking_settings } : DEFAULT_BOOKING;
      const n = data.notification_settings ? { ...DEFAULT_NOTIF, ...data.notification_settings } : DEFAULT_NOTIF;
      setHours(h); setBooking(b); setNotif(n);
      if (data.phone && data.whatsapp && data.phone === data.whatsapp) setWhatsAppSame(true);
      setTimeout(() => { initialSnap.current = JSON.stringify({ form: f, hours: h, booking: b, notif: n }); }, 0);
    } catch { setError('Erro ao carregar dados.'); } finally { setLoading(false); }
  }

  async function handleSave() {
    setSaving(true); setError(''); setSaved(false);
    try {
      const payload: Record<string, unknown> = { ...form, business_hours: hours, booking_settings: booking, notification_settings: notif };
      Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });
      const { data } = await api.put<Business>('/api/businesses/me', payload);
      setBiz(data); setSaved(true); setDirty(false);
      initialSnap.current = snap();
      setTimeout(() => setSaved(false), 3000);
    } catch { setError('Erro ao salvar configuracoes.'); } finally { setSaving(false); }
  }

  function handleCancel() {
    loadBiz(); setDirty(false);
  }

  async function handleImageUpload(type: 'logo' | 'cover', file: File) {
    const fd = new FormData(); fd.append('file', file);
    try {
      const { data } = await api.post<Business>(`/api/businesses/me/${type}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setBiz(data);
    } catch { setError(`Erro ao enviar ${type === 'logo' ? 'logo' : 'capa'}.`); }
  }

  async function handleRemoveLogo() {
    try {
      const { data } = await api.put<Business>('/api/businesses/me', { logo_url: null });
      setBiz(data);
    } catch { setError('Erro ao remover logo.'); }
  }

  async function lookupCep(cep: string) {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(prev => ({
          ...prev,
          address: `${data.logradouro}${data.bairro ? ', ' + data.bairro : ''}`,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      }
    } catch { /* silent */ } finally { setCepLoading(false); }
  }

  function updateHour(day: string, field: string, value: string | boolean) {
    setHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  }

  function toggleWhatsAppSame(checked: boolean) {
    setWhatsAppSame(checked);
    if (checked) setForm(prev => ({ ...prev, whatsapp: prev.phone }));
  }

  function copyLink() {
    if (!biz) return;
    navigator.clipboard.writeText(`https://sistematize.com/${biz.slug}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'general', label: 'Dados do Negocio',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { key: 'hours', label: 'Horarios',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { key: 'public', label: 'Pagina Publica',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg> },
    { key: 'agenda', label: 'Agenda',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { key: 'notifications', label: 'Notificacoes',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> },
    { key: 'team', label: 'Equipe & Permissoes',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
    { key: 'account', label: 'Minha Conta',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];

  /* ── Preview component ── */
  const heroLayout = booking.hero_layout || 'split';
  const showBadges = booking.show_hero_badges ?? true;

  const Preview = () => (
    <div className="sticky top-24">
      <div className={`${card} overflow-hidden`}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-4">Preview da Pagina Publica</p>

        {/* Phone mockup */}
        <div className="mx-auto w-[220px] rounded-[24px] border-[3px] border-[var(--color-text-primary)]/10 overflow-hidden bg-white shadow-lg">

          {/* Hero — Split */}
          {heroLayout === 'split' && (
            <>
              <div className="flex h-[110px]">
                <div className="w-[55%] flex flex-col justify-center px-3 py-2" style={{ background: `${form.primary_color}08` }}>
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-[var(--color-bg-surface)] mb-1.5 border border-white shadow-sm">
                    {biz?.logo_url
                      ? <img src={biz.logo_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[var(--color-text-muted)]">{form.name?.charAt(0) || '?'}</div>
                    }
                  </div>
                  <p className="text-[9px] font-bold text-[var(--color-text-primary)] truncate leading-tight">{form.name || 'Seu Salao'}</p>
                  {(form.city || form.state) && (
                    <p className="text-[7px] text-[var(--color-text-muted)] truncate">{[form.city, form.state].filter(Boolean).join(' - ')}</p>
                  )}
                  {form.description && (
                    <p className="text-[6px] text-[var(--color-text-secondary)] mt-0.5 line-clamp-2 leading-tight">{form.description}</p>
                  )}
                </div>
                <div className="w-[45%] relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${form.primary_color}40, ${form.primary_color}20)` }}>
                  {biz?.cover_image_url && <img src={biz.cover_image_url} alt="" className="w-full h-full object-cover absolute inset-0" />}
                </div>
              </div>
              {showBadges && (
                <div className="flex gap-1 px-2 py-1.5 bg-[var(--color-bg-surface)]">
                  {['Online', 'Confirmacao', 'Lembrete'].map(b => (
                    <span key={b} className="text-[5px] px-1.5 py-0.5 rounded-full bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] font-medium">{b}</span>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Hero — Full Cover */}
          {heroLayout === 'fullcover' && (
            <>
              <div className="h-[130px] relative flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${form.primary_color}, ${form.primary_color}cc)` }}>
                {biz?.cover_image_url && <img src={biz.cover_image_url} alt="" className="w-full h-full object-cover absolute inset-0" />}
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 text-center px-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/20 mx-auto mb-1.5 border border-white/30">
                    {biz?.logo_url
                      ? <img src={biz.logo_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white/80">{form.name?.charAt(0) || '?'}</div>
                    }
                  </div>
                  <p className="text-[10px] font-bold text-white truncate">{form.name || 'Seu Salao'}</p>
                  {(form.city || form.state) && (
                    <p className="text-[7px] text-white/70">{[form.city, form.state].filter(Boolean).join(' - ')}</p>
                  )}
                </div>
              </div>
              {showBadges && (
                <div className="flex gap-1 px-2 py-1.5 bg-[var(--color-bg-surface)]">
                  {['Online', 'Confirmacao', 'Lembrete'].map(b => (
                    <span key={b} className="text-[5px] px-1.5 py-0.5 rounded-full bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] font-medium">{b}</span>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Hero — Minimal */}
          {heroLayout === 'minimal' && (
            <>
              <div className="py-5 px-3 text-center" style={{ background: `linear-gradient(135deg, ${form.primary_color}15, ${form.primary_color}08)` }}>
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white mx-auto mb-2 border border-[var(--color-border)] shadow-sm">
                  {biz?.logo_url
                    ? <img src={biz.logo_url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[var(--color-text-muted)]">{form.name?.charAt(0) || '?'}</div>
                  }
                </div>
                <p className="text-[10px] font-bold text-[var(--color-text-primary)] truncate">{form.name || 'Seu Salao'}</p>
                {(form.city || form.state) && (
                  <p className="text-[7px] text-[var(--color-text-muted)]">{[form.city, form.state].filter(Boolean).join(' - ')}</p>
                )}
                {form.description && (
                  <p className="text-[6px] text-[var(--color-text-secondary)] mt-1 line-clamp-2">{form.description}</p>
                )}
              </div>
              {showBadges && (
                <div className="flex gap-1 px-2 py-1.5 bg-[var(--color-bg-surface)]">
                  {['Online', 'Confirmacao', 'Lembrete'].map(b => (
                    <span key={b} className="text-[5px] px-1.5 py-0.5 rounded-full bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] font-medium">{b}</span>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Content below hero */}
          <div className="px-3 pt-2.5 pb-4">
            {form.welcome_message && (
              <p className="text-[7px] text-[var(--color-text-secondary)] text-center mb-2 line-clamp-2 italic">{form.welcome_message}</p>
            )}

            {/* Social icons */}
            {(form.instagram || form.whatsapp || form.phone) && (
              <div className="flex items-center justify-center gap-2 mb-2.5">
                {form.instagram && (
                  <div className="w-6 h-6 rounded-full bg-[var(--color-bg-surface)] flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/></svg>
                  </div>
                )}
                {form.whatsapp && (
                  <div className="w-6 h-6 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72"/></svg>
                  </div>
                )}
                {form.phone && (
                  <div className="w-6 h-6 rounded-full bg-[var(--color-bg-surface)] flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72"/></svg>
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            <button className="w-full py-2 rounded-xl text-white text-[10px] font-bold" style={{ background: form.primary_color }}>
              Agendar Agora
            </button>

            {/* Service preview placeholder */}
            <div className="mt-3 space-y-1.5">
              <div className="h-1.5 w-16 rounded bg-[var(--color-bg-surface)] mx-auto" />
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-[var(--color-bg-surface)]">
                  <div className="w-6 h-6 rounded bg-white border border-[var(--color-border)]" />
                  <div className="flex-1 space-y-0.5">
                    <div className="h-1 w-12 rounded bg-[var(--color-border)]" />
                    <div className="h-1 w-8 rounded bg-[var(--color-border)]/50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-[10px] text-center text-[var(--color-text-muted)] mt-3">Previa em tempo real</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1280px] mx-auto">
      {/* ── HEADER ── */}
      <div className="bg-white -mx-7 -mt-6 px-7 pt-4 pb-5 border-b border-[var(--color-border)] shadow-[0_2px_8px_rgba(0,0,0,0.03)] sticky top-16 z-30">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Configuracoes do Negocio</h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Gerencie as informacoes exibidas na sua pagina publica de agendamento.</p>
          </div>
          <div className="flex items-center gap-3">
            {biz && (
              <a
                href={`https://sistematize.com/${biz.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Visualizar Pagina
              </a>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:cursor-default ${
                dirty
                  ? 'bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white hover:brightness-110 disabled:opacity-60'
                  : saved
                  ? 'bg-[var(--color-green-soft)] text-[var(--color-green)]'
                  : 'bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]'
              }`}
            >
              {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Alteracoes'}
            </button>
          </div>
        </div>
        {error && <p className="max-w-[1280px] mx-auto text-xs text-[var(--color-rose)] font-medium mt-2">{error}</p>}
      </div>

      <div className="flex gap-6 mt-6">
        {/* ── SIDEBAR ── */}
        <div className="w-[210px] shrink-0 space-y-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left ${
                tab === t.key
                  ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-semibold'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]'
              }`}>
              {t.icon}{t.label}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-[var(--color-border)]">
            <button onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--color-rose)] hover:bg-[var(--color-rose-soft)] transition-all cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sair da Conta
            </button>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="flex-1 min-w-0 pb-20">

          {/* ===== TAB: DADOS DO NEGOCIO ===== */}
          {tab === 'general' && (
            <div className="flex gap-6">
              {/* Left — Form */}
              <div className="flex-1 min-w-0 space-y-5">

                {/* Logo */}
                <div className={card}>
                  <SectionHeader
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>}
                    title="Logo do Negocio"
                    desc="Imagem exibida na pagina publica e nos materiais do salao"
                  />
                  <div className="flex items-center gap-5">
                    <div
                      className="w-24 h-24 rounded-2xl border-2 border-dashed border-[var(--color-border)] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[var(--color-accent)] transition-colors bg-[var(--color-bg-surface)] group relative"
                      onClick={() => logoRef.current?.click()}
                    >
                      {biz?.logo_url ? (
                        <>
                          <img src={biz.logo_url} alt="Logo" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <svg className="mx-auto" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          <p className="text-[9px] text-[var(--color-text-muted)] mt-1">Upload</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => logoRef.current?.click()}
                          className="px-4 py-2 rounded-xl border border-[var(--color-accent)] text-[var(--color-accent)] text-xs font-semibold hover:bg-[var(--color-accent-soft)] transition-all cursor-pointer">
                          {biz?.logo_url ? 'Alterar Logo' : 'Enviar Logo'}
                        </button>
                        {biz?.logo_url && (
                          <button onClick={handleRemoveLogo}
                            className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs font-semibold hover:border-[var(--color-rose)] hover:text-[var(--color-rose)] transition-all cursor-pointer">
                            Remover
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--color-text-muted)]">PNG, JPG ou WebP. Max 2MB.</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">Use imagem quadrada para melhor resultado.</p>
                    </div>
                    <input ref={logoRef} type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] && handleImageUpload('logo', e.target.files[0])} />
                  </div>
                </div>

                {/* Informacoes */}
                <div className={card}>
                  <SectionHeader
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                    title="Informacoes do Negocio"
                    desc="Dados principais usados no agendamento, notificacoes e pagina publica"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className={label}>Nome do Negocio *</label>
                      <input className={input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Studio Beleza Total" />
                    </div>
                    <div>
                      <label className={label}>CNPJ</label>
                      <input className={input} value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0001-00" maxLength={20} />
                    </div>
                    <div className="col-span-2">
                      <label className={label}>Descricao</label>
                      <textarea className={`${input} resize-none`} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Conte um pouco sobre seu negocio..." maxLength={500} />
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-1 text-right">{form.description.length}/500</p>
                    </div>
                  </div>
                </div>

                {/* Contato */}
                <div className={card}>
                  <SectionHeader
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>}
                    title="Contato"
                    desc="Telefone e WhatsApp exibidos para clientes"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={label}>Telefone</label>
                      <input className={input} value={form.phone}
                        onChange={e => {
                          const v = e.target.value;
                          setForm(prev => ({ ...prev, phone: v, ...(whatsAppSame ? { whatsapp: v } : {}) }));
                        }}
                        placeholder="(71) 99999-9999" />
                    </div>
                    <div>
                      <label className={label}>WhatsApp</label>
                      <input className={input} value={form.whatsapp} disabled={whatsAppSame}
                        onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                        placeholder="(71) 99999-9999" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input type="checkbox" checked={whatsAppSame} onChange={e => toggleWhatsAppSame(e.target.checked)}
                      className="w-4 h-4 rounded accent-[var(--color-accent)]" />
                    <span className="text-xs text-[var(--color-text-secondary)]">Este telefone tambem e WhatsApp</span>
                  </label>
                </div>

                {/* Endereco */}
                <div className={card}>
                  <SectionHeader
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                    title="Endereco"
                    desc="Localizacao exibida para os clientes"
                  />
                  <div className="grid grid-cols-[140px_1fr] gap-4">
                    <div>
                      <label className={label}>CEP</label>
                      <div className="relative">
                        <input className={input} value={form.cep}
                          onChange={e => setForm({ ...form, cep: e.target.value })}
                          onBlur={e => lookupCep(e.target.value)}
                          placeholder="00000-000" maxLength={10} />
                        {cepLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />}
                      </div>
                    </div>
                    <div>
                      <label className={label}>Endereco</label>
                      <input className={input} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Rua, numero, bairro" />
                    </div>
                  </div>
                  <div className="grid grid-cols-[1fr_100px] gap-4 mt-4">
                    <div>
                      <label className={label}>Cidade</label>
                      <input className={input} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Salvador" />
                    </div>
                    <div>
                      <label className={label}>UF</label>
                      <select className={input} value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}>
                        <option value="">-</option>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Redes Sociais */}
                <div className={card}>
                  <SectionHeader
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>}
                    title="Redes Sociais"
                    desc="Links exibidos na pagina publica"
                  />
                  <div className="space-y-3">
                    <div>
                      <label className={label}>Instagram</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">@</span>
                        <input className={`${input} pl-8`} value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="seusalao" />
                      </div>
                    </div>
                    <div>
                      <label className={label}>Facebook</label>
                      <input className={input} value={form.facebook} onChange={e => setForm({ ...form, facebook: e.target.value })} placeholder="facebook.com/seusalao" />
                    </div>
                    <div>
                      <label className={label}>TikTok</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">@</span>
                        <input className={`${input} pl-8`} value={form.tiktok} onChange={e => setForm({ ...form, tiktok: e.target.value })} placeholder="seusalao" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Link Publico */}
                {biz && (
                  <div className="rounded-2xl p-[2px] bg-gradient-to-br from-[#4A6CF7] to-[#6C5CE7]">
                    <div className="bg-white rounded-[14px] p-6">
                      <SectionHeader
                        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>}
                        title="Link Publico de Agendamento"
                        desc="Compartilhe este link no Instagram, WhatsApp e redes sociais"
                      />
                      <div className="flex items-center gap-3 bg-[var(--color-bg-surface)] rounded-xl px-4 py-3 border border-[var(--color-border)]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                        <span className="text-sm font-mono font-bold text-[var(--color-text-primary)] flex-1 truncate">sistematize.com/{biz.slug}</span>
                        <button onClick={copyLink}
                          className="px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5">
                          {copied ? (
                            <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>Copiado!</>
                          ) : (
                            <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copiar</>
                          )}
                        </button>
                        <a href={`https://sistematize.com/${biz.slug}`} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg border border-[var(--color-accent)] text-[var(--color-accent)] text-xs font-semibold hover:bg-[var(--color-accent-soft)] transition-all cursor-pointer flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          Abrir
                        </a>
                      </div>

                      {/* Subscription status */}
                      <div className="flex items-center gap-2 mt-4">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          biz.subscription_status === 'trial' ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                          : biz.subscription_status === 'active' || biz.subscription_status === 'paid' ? 'bg-[var(--color-green-soft)] text-[var(--color-green)]'
                          : 'bg-[var(--color-rose-soft)] text-[var(--color-rose)]'
                        }`}>{biz.subscription_status}</span>
                        {biz.subscription_status === 'trial' && biz.trial_ends_at && (
                          <span className="text-[10px] text-[var(--color-text-muted)]">expira em {new Date(biz.trial_ends_at).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right — Preview */}
              <div className="w-[280px] shrink-0 hidden xl:block">
                <Preview />
              </div>
            </div>
          )}

          {/* ===== TAB: HORARIOS ===== */}
          {tab === 'hours' && (
            <div className={card}>
              <SectionHeader
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                title="Horarios de Funcionamento"
                desc="Defina os dias e horarios em que seu salao atende"
              />
              <div className="space-y-2">
                {DAYS.map(day => {
                  const dh = hours[day.key] || { open: '08:00', close: '18:00', enabled: true };
                  return (
                    <div key={day.key} className={`rounded-xl px-4 py-3 border transition-all ${dh.enabled ? 'bg-white border-[var(--color-border)]' : 'bg-[var(--color-bg-surface)] border-transparent opacity-60'}`}>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-3 w-[170px] cursor-pointer">
                          <input type="checkbox" checked={dh.enabled} onChange={e => updateHour(day.key, 'enabled', e.target.checked)} className="w-4 h-4 rounded accent-[var(--color-accent)]" />
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">{day.label}</span>
                        </label>
                        {dh.enabled ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input type="time" value={dh.open} onChange={e => updateHour(day.key, 'open', e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-accent)]" />
                            <span className="text-xs text-[var(--color-text-muted)]">ate</span>
                            <input type="time" value={dh.close} onChange={e => updateHour(day.key, 'close', e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-accent)]" />
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--color-text-muted)] italic">Fechado</span>
                        )}
                      </div>
                      {dh.enabled && (
                        <div className="flex items-center gap-3 mt-2 ml-[170px] pl-3 border-l-2 border-[var(--color-border)]">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={!!dh.lunch_start}
                              onChange={e => {
                                if (e.target.checked) { updateHour(day.key, 'lunch_start', '12:00'); updateHour(day.key, 'lunch_end', '13:00'); }
                                else { setHours(prev => { const u = { ...prev[day.key] }; delete u.lunch_start; delete u.lunch_end; return { ...prev, [day.key]: u }; }); }
                              }}
                              className="w-3.5 h-3.5 rounded accent-[var(--color-accent)]" />
                            <span className="text-xs text-[var(--color-text-secondary)]">Intervalo almoco</span>
                          </label>
                          {dh.lunch_start && (
                            <div className="flex items-center gap-1.5">
                              <input type="time" value={dh.lunch_start} onChange={e => updateHour(day.key, 'lunch_start', e.target.value)} className="px-2 py-1 rounded-lg border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-accent)]" />
                              <span className="text-[10px] text-[var(--color-text-muted)]">ate</span>
                              <input type="time" value={dh.lunch_end || '13:00'} onChange={e => updateHour(day.key, 'lunch_end', e.target.value)} className="px-2 py-1 rounded-lg border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-accent)]" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== TAB: PAGINA PUBLICA ===== */}
          {tab === 'public' && (
            <div className="flex gap-6">
              <div className="flex-1 min-w-0 space-y-5">
                {/* Booking toggle */}
                <div className={card}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={sTitle}>Agendamento Online</h3>
                      <p className={sDesc}>Clientes podem agendar pela pagina publica</p>
                    </div>
                    <Toggle checked={form.booking_enabled} onChange={v => setForm({ ...form, booking_enabled: v })} />
                  </div>
                </div>

                {/* Visual */}
                <div className={card}>
                  <SectionHeader
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>}
                    title="Aparencia da Pagina Publica"
                    desc="Customize cores e visual da sua pagina"
                  />
                  <div>
                    <label className={label}>Cor Principal</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={form.primary_color} onChange={e => setForm({ ...form, primary_color: e.target.value })}
                        className="w-10 h-10 rounded-lg border border-[var(--color-border)] cursor-pointer" />
                      <input className={`${input} w-32 font-mono uppercase`} value={form.primary_color}
                        onChange={e => setForm({ ...form, primary_color: e.target.value })} maxLength={10} />
                      <div className="flex gap-1.5 ml-2">
                        {['#4F5AE5','#E91E63','#FF9800','#4CAF50','#00BCD4','#9C27B0','#795548'].map(c => (
                          <button key={c} onClick={() => setForm({ ...form, primary_color: c })}
                            className={`w-7 h-7 rounded-lg cursor-pointer border-2 transition-all ${form.primary_color === c ? 'border-[var(--color-text-primary)] scale-110' : 'border-transparent hover:scale-105'}`}
                            style={{ background: c }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cover */}
                  <div className="mt-5">
                    <label className={label}>Imagem de Capa</label>
                    <div className="h-36 rounded-xl border-2 border-dashed border-[var(--color-border)] flex items-center justify-center cursor-pointer hover:border-[var(--color-accent)] transition-colors bg-[var(--color-bg-surface)] overflow-hidden relative"
                      onClick={() => coverRef.current?.click()}>
                      {biz?.cover_image_url ? (
                        <>
                          <img src={biz.cover_image_url} alt="Capa" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-semibold">Trocar imagem</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <svg className="mx-auto mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                          <p className="text-xs text-[var(--color-text-muted)]">Clique para enviar (max 5MB)</p>
                        </div>
                      )}
                    </div>
                    <input ref={coverRef} type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] && handleImageUpload('cover', e.target.files[0])} />
                  </div>
                </div>

                {/* Hero Layout */}
                <div className={card}>
                  <SectionHeader
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="12" y1="9" x2="12" y2="21"/></svg>}
                    title="Layout da Hero"
                    desc="Escolha como a parte superior da pagina sera exibida"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { value: 'split' as const, label: 'Dividido', desc: 'Texto a esquerda, imagem a direita' },
                      { value: 'fullcover' as const, label: 'Capa Total', desc: 'Imagem cobre toda a area' },
                      { value: 'minimal' as const, label: 'Minimalista', desc: 'Sem imagem, fundo gradiente' },
                    ] as const).map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setBooking({ ...booking, hero_layout: opt.value })}
                        className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          (booking.hero_layout || 'split') === opt.value
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                            : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/40'
                        }`}>
                        <div className={`w-full h-16 rounded-lg mb-3 ${
                          opt.value === 'split' ? 'bg-gradient-to-r from-[var(--color-bg-surface)] from-50% to-[var(--color-accent-soft)] to-50%' :
                          opt.value === 'fullcover' ? 'bg-gradient-to-br from-[var(--color-accent-soft)] to-[var(--color-accent)]/20' :
                          'bg-gradient-to-br from-[var(--color-bg-surface)] to-[var(--color-accent-soft)]'
                        } flex items-center justify-center`}>
                          {opt.value === 'split' && (
                            <div className="flex w-full h-full">
                              <div className="w-1/2 flex flex-col justify-center pl-3 gap-1">
                                <div className="w-12 h-1.5 bg-[var(--color-text-muted)]/30 rounded" />
                                <div className="w-8 h-1.5 bg-[var(--color-text-muted)]/20 rounded" />
                                <div className="w-6 h-1.5 bg-[var(--color-accent)]/40 rounded mt-1" />
                              </div>
                              <div className="w-1/2 flex items-center justify-center">
                                <div className="w-8 h-8 rounded bg-[var(--color-accent)]/15" />
                              </div>
                            </div>
                          )}
                          {opt.value === 'fullcover' && (
                            <div className="w-full h-full flex items-center justify-center relative">
                              <div className="absolute inset-0 bg-black/10 rounded-lg" />
                              <div className="flex flex-col items-center gap-1 relative z-10">
                                <div className="w-12 h-1.5 bg-white/60 rounded" />
                                <div className="w-8 h-1.5 bg-white/40 rounded" />
                              </div>
                            </div>
                          )}
                          {opt.value === 'minimal' && (
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-12 h-1.5 bg-[var(--color-text-muted)]/30 rounded" />
                              <div className="w-8 h-1.5 bg-[var(--color-text-muted)]/20 rounded" />
                              <div className="w-6 h-1.5 bg-[var(--color-accent)]/40 rounded mt-1" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-bold text-[var(--color-text-primary)]">{opt.label}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-5 border-t border-[var(--color-border)]">
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-primary)]">Badges de Beneficios</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Agendamento online, Confirmacao automatica, Lembretes</p>
                    </div>
                    <Toggle checked={booking.show_hero_badges ?? true} onChange={v => setBooking({ ...booking, show_hero_badges: v })} />
                  </div>
                </div>

                {/* Welcome / Cancellation */}
                <div className={card}>
                  <SectionHeader
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>}
                    title="Mensagens"
                    desc="Textos exibidos na pagina publica"
                  />
                  <div>
                    <label className={label}>Mensagem de Boas-Vindas</label>
                    <textarea className={`${input} resize-none`} rows={2} value={form.welcome_message}
                      onChange={e => setForm({ ...form, welcome_message: e.target.value })}
                      placeholder="Bem-vindo ao nosso salao! Agende seu horario." maxLength={300} />
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1 text-right">{form.welcome_message.length}/300</p>
                  </div>
                  <div className="mt-4">
                    <label className={label}>Politica de Cancelamento</label>
                    <textarea className={`${input} resize-none`} rows={3} value={form.cancellation_policy}
                      onChange={e => setForm({ ...form, cancellation_policy: e.target.value })}
                      placeholder="Ex: Cancelamentos devem ser feitos com pelo menos 2 horas de antecedencia..." maxLength={1000} />
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1 text-right">{form.cancellation_policy.length}/1000</p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="w-[280px] shrink-0 hidden xl:block">
                <Preview />
              </div>
            </div>
          )}

          {/* ===== TAB: AGENDA ===== */}
          {tab === 'agenda' && (
            <div className={card}>
              <SectionHeader
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                title="Configuracoes da Agenda"
                desc="Controle como os agendamentos funcionam no seu negocio"
              />
              <div className="space-y-5">
                <div>
                  <label className={label}>Intervalo Minimo Entre Agendamentos</label>
                  <div className="flex items-center gap-3">
                    <select className={`${input} w-52`} value={booking.min_interval_minutes}
                      onChange={e => setBooking({ ...booking, min_interval_minutes: Number(e.target.value) })}>
                      <option value={0}>Sem intervalo</option>
                      <option value={5}>5 minutos</option>
                      <option value={10}>10 minutos</option>
                      <option value={15}>15 minutos</option>
                      <option value={30}>30 minutos</option>
                      <option value={60}>1 hora</option>
                    </select>
                    <span className="text-xs text-[var(--color-text-muted)]">entre um atendimento e outro</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <label className={label}>Antecedencia Minima para Agendar</label>
                  <div className="flex items-center gap-3">
                    <select className={`${input} w-52`} value={booking.min_advance_hours}
                      onChange={e => setBooking({ ...booking, min_advance_hours: Number(e.target.value) })}>
                      <option value={0}>Sem antecedencia</option><option value={1}>1 hora</option><option value={2}>2 horas</option>
                      <option value={4}>4 horas</option><option value={8}>8 horas</option><option value={12}>12 horas</option>
                      <option value={24}>24 horas</option><option value={48}>48 horas</option>
                    </select>
                    <span className="text-xs text-[var(--color-text-muted)]">antes do horario desejado</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <label className={label}>Maximo de Dias para Agendar</label>
                  <div className="flex items-center gap-3">
                    <select className={`${input} w-52`} value={booking.max_advance_days}
                      onChange={e => setBooking({ ...booking, max_advance_days: Number(e.target.value) })}>
                      <option value={7}>7 dias</option><option value={14}>14 dias</option><option value={30}>30 dias</option>
                      <option value={60}>60 dias</option><option value={90}>90 dias</option><option value={180}>180 dias</option>
                    </select>
                    <span className="text-xs text-[var(--color-text-muted)]">no futuro</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-[var(--color-border)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">Permitir Sobreposicao</h4>
                      <p className="text-xs text-[var(--color-text-muted)]">Permite agendar dois clientes no mesmo horario</p>
                    </div>
                    <Toggle checked={booking.allow_overlap} onChange={v => setBooking({ ...booking, allow_overlap: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">Confirmacao Automatica</h4>
                      <p className="text-xs text-[var(--color-text-muted)]">Agendamentos confirmados sem aprovacao manual</p>
                    </div>
                    <Toggle checked={booking.auto_confirm} onChange={v => setBooking({ ...booking, auto_confirm: v })} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: NOTIFICACOES ===== */}
          {tab === 'notifications' && (
            <div className="space-y-5">
              <div className={card}>
                <SectionHeader
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>}
                  title="Notificacoes por Email"
                  desc="Configure lembretes e confirmacoes enviados por email"
                />
                <div className="flex items-center justify-between py-2">
                  <div><h4 className="text-sm font-semibold text-[var(--color-text-primary)]">Lembrete por Email</h4><p className="text-xs text-[var(--color-text-muted)]">Enviar lembrete automatico antes do agendamento</p></div>
                  <Toggle checked={notif.email_reminder_enabled} onChange={v => setNotif({ ...notif, email_reminder_enabled: v })} />
                </div>
                {notif.email_reminder_enabled && (
                  <div className="pl-4 border-l-2 border-[var(--color-accent-soft)] space-y-4 mt-2">
                    <div>
                      <label className={label}>Enviar lembrete com antecedencia de</label>
                      <select className={`${input} w-52`} value={notif.reminder_advance_hours}
                        onChange={e => setNotif({ ...notif, reminder_advance_hours: Number(e.target.value) })}>
                        <option value={1}>1 hora</option><option value={2}>2 horas</option><option value={4}>4 horas</option>
                        <option value={12}>12 horas</option><option value={24}>24 horas</option><option value={48}>48 horas</option>
                      </select>
                    </div>
                  </div>
                )}
                <div className="pt-4 border-t border-[var(--color-border)] mt-4">
                  <label className={label}>Mensagem de Confirmacao</label>
                  <textarea className={`${input} resize-none`} rows={2} value={notif.confirmation_template}
                    onChange={e => setNotif({ ...notif, confirmation_template: e.target.value })} />
                </div>
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <label className={label}>Mensagem de Lembrete</label>
                  <textarea className={`${input} resize-none`} rows={2} value={notif.reminder_template}
                    onChange={e => setNotif({ ...notif, reminder_template: e.target.value })} />
                </div>
              </div>

              <div className={`${card} opacity-60`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                  </div>
                  <div><h3 className={sTitle}>WhatsApp</h3><p className={sDesc}>Em breve — lembretes automaticos pelo WhatsApp</p></div>
                  <span className="ml-auto px-3 py-1 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-[10px] font-bold uppercase tracking-wider">Em Breve</span>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: EQUIPE ===== */}
          {tab === 'team' && (
            <div className="space-y-5">
              <div className={card}>
                <SectionHeader
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
                  title="Equipe & Permissoes"
                  desc="Gerencie quem tem acesso ao seu sistema"
                />
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4A6CF7] to-[#6C5CE7] flex items-center justify-center text-white font-bold text-sm">{user?.full_name?.charAt(0) || 'U'}</div>
                  <div className="flex-1"><p className="text-sm font-semibold text-[var(--color-text-primary)]">{user?.full_name}</p><p className="text-xs text-[var(--color-text-muted)]">{user?.email}</p></div>
                  <span className="px-3 py-1.5 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-xs font-bold">{user?.role === 'owner' ? 'Proprietario' : user?.role}</span>
                </div>
                <div className="pt-4 border-t border-[var(--color-border)] mt-4">
                  <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Convidar Colaborador</h4>
                  <div className="flex gap-3">
                    <input className={`${input} flex-1`} placeholder="email@colaborador.com" disabled />
                    <button disabled className="px-5 py-3 rounded-xl bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] text-sm font-semibold cursor-not-allowed">Convidar</button>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-2">Convites por email em breve. Cadastre colaboradores pela aba Colaboradores.</p>
                </div>
              </div>
              <div className={card}>
                <h3 className={sTitle}>Niveis de Acesso</h3>
                <div className="space-y-3 mt-3">
                  {[{ role: 'Proprietario', desc: 'Acesso total a configuracoes, relatorios e financeiro', color: 'var(--color-accent)' },
                    { role: 'Colaborador', desc: 'Visualiza propria agenda, registra atendimentos, sem acesso a configuracoes', color: 'var(--color-blue)' },
                  ].map(r => (
                    <div key={r.role} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-bg-surface)]">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: r.color }} />
                      <div><p className="text-sm font-semibold text-[var(--color-text-primary)]">{r.role}</p><p className="text-xs text-[var(--color-text-muted)]">{r.desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: MINHA CONTA ===== */}
          {tab === 'account' && (
            <div className="space-y-5">
              <div className={card}>
                <SectionHeader
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                  title="Minha Conta"
                  desc="Informacoes da sua conta de usuario"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={label}>Nome</label><input className={input} value={user?.full_name || ''} disabled /></div>
                  <div><label className={label}>Email</label><input className={input} value={user?.email || ''} disabled /></div>
                  <div><label className={label}>Funcao</label><input className={input} value={user?.role === 'owner' ? 'Proprietario' : user?.role || ''} disabled /></div>
                </div>
              </div>

              <div className={card}>
                <SectionHeader
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}
                  title="Autenticacao em Dois Fatores (2FA)"
                  desc="Camada extra de seguranca para proteger sua conta"
                />
                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user?.totp_enabled ? 'bg-[var(--color-green-soft)]' : 'bg-[var(--color-rose-soft)]'}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={user?.totp_enabled ? 'var(--color-green)' : 'var(--color-rose)'} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{user?.totp_enabled ? '2FA Ativada' : '2FA Desativada'}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{user?.totp_enabled ? 'Conta protegida com TOTP' : 'Ative para maior seguranca'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${user?.totp_enabled ? 'bg-[var(--color-green-soft)] text-[var(--color-green)]' : 'bg-[var(--color-rose-soft)] text-[var(--color-rose)]'}`}>
                    {user?.totp_enabled ? 'Ativada' : 'Desativada'}
                  </span>
                </div>
              </div>

              <div className={card}>
                <SectionHeader
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}
                  title="Alterar Senha"
                  desc="Atualize sua senha de acesso"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={label}>Nova Senha</label><input className={input} type="password" placeholder="••••••••" disabled /></div>
                  <div><label className={label}>Confirmar</label><input className={input} type="password" placeholder="••••••••" disabled /></div>
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-2">Alteracao de senha via painel em breve. Use &quot;Esqueci minha senha&quot; no login.</p>
              </div>

              <div className="bg-white rounded-2xl border border-[rgba(239,68,68,0.15)] p-6">
                <h3 className="text-base font-bold text-[var(--color-rose)] mb-1">Zona de Perigo</h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">Acoes irreversiveis</p>
                <button onClick={logout}
                  className="px-5 py-2.5 rounded-xl border border-[var(--color-rose)] text-[var(--color-rose)] text-sm font-semibold hover:bg-[var(--color-rose-soft)] transition-all cursor-pointer">
                  Sair da Conta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── STICKY BOTTOM BAR — Unsaved Changes ── */}
      {dirty && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-[var(--color-border)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-[1280px] mx-auto px-7 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-amber)] animate-pulse" />
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Alteracoes nao salvas</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleCancel}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer disabled:opacity-60">
                {saving ? 'Salvando...' : 'Salvar Alteracoes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
