'use client';

import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-[var(--color-bg-deep)]">
      {/* Left — Form */}
      <div className="flex w-full lg:w-[480px] xl:w-[520px] flex-col justify-center px-8 sm:px-12 lg:px-14 py-10 bg-white relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.04)]">
        <LoginForm />
      </div>

      {/* Right — Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-[-120px] right-[-80px] w-[500px] h-[500px] rounded-full bg-[var(--color-accent-soft)] opacity-60" />
          <div className="absolute bottom-[-150px] left-[-100px] w-[600px] h-[600px] rounded-full bg-[var(--color-blue-soft)] opacity-50" />
          <div className="absolute top-[40%] left-[30%] w-[200px] h-[200px] rounded-full bg-[var(--color-accent-soft)] opacity-40" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center max-w-lg px-10">
          {/* Illustration */}
          <div className="mb-10">
            <svg width="340" height="280" viewBox="0 0 340 280" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Main card */}
              <rect x="50" y="40" width="240" height="160" rx="20" fill="white" stroke="var(--color-border-light)" strokeWidth="1"/>
              <rect x="50" y="40" width="240" height="160" rx="20" fill="white" fillOpacity="0.9"/>

              {/* Card header gradient bar */}
              <rect x="50" y="40" width="240" height="6" rx="3" fill="url(#loginGrad1)"/>

              {/* Avatar circle */}
              <circle cx="170" cy="95" r="28" fill="url(#loginGrad1)" fillOpacity="0.12"/>
              <circle cx="170" cy="88" r="10" fill="var(--color-accent)" fillOpacity="0.7"/>
              <path d="M155 104 a15 12 0 0 1 30 0" fill="var(--color-accent)" fillOpacity="0.5"/>

              {/* Form field lines */}
              <rect x="90" y="130" width="160" height="14" rx="7" fill="var(--color-bg-surface)"/>
              <rect x="90" y="152" width="160" height="14" rx="7" fill="var(--color-bg-surface)"/>

              {/* Button */}
              <rect x="90" y="176" width="160" height="14" rx="7" fill="url(#loginGrad1)" fillOpacity="0.8"/>

              {/* Floating elements */}
              {/* Shield */}
              <g transform="translate(20, 120)">
                <rect width="52" height="60" rx="14" fill="white" filter="url(#shadow1)"/>
                <path d="M26 18 L36 22 L36 32 C36 37 32 41 26 43 C20 41 16 37 16 32 L16 22 Z" fill="url(#loginGrad1)" fillOpacity="0.15" stroke="var(--color-accent)" strokeWidth="1.5"/>
                <path d="M22 30 L25 33 L31 27" stroke="var(--color-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </g>

              {/* Calendar */}
              <g transform="translate(268, 55)">
                <rect width="52" height="52" rx="14" fill="white" filter="url(#shadow1)"/>
                <rect x="12" y="10" width="28" height="4" rx="2" fill="var(--color-accent)" fillOpacity="0.6"/>
                <rect x="12" y="18" width="10" height="6" rx="2" fill="var(--color-accent-soft)"/>
                <rect x="25" y="18" width="10" height="6" rx="2" fill="var(--color-accent-soft)"/>
                <rect x="12" y="27" width="10" height="6" rx="2" fill="var(--color-accent-soft)"/>
                <rect x="25" y="27" width="10" height="6" rx="2" fill="url(#loginGrad1)" fillOpacity="0.4"/>
                <rect x="12" y="36" width="10" height="6" rx="2" fill="var(--color-accent-soft)"/>
                <rect x="25" y="36" width="10" height="6" rx="2" fill="var(--color-accent-soft)"/>
              </g>

              {/* Clock */}
              <g transform="translate(260, 140)">
                <rect width="48" height="48" rx="14" fill="white" filter="url(#shadow1)"/>
                <circle cx="24" cy="24" r="13" stroke="var(--color-accent)" strokeWidth="1.5" fill="none" strokeOpacity="0.4"/>
                <line x1="24" y1="24" x2="24" y2="16" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="24" y1="24" x2="30" y2="27" stroke="var(--color-accent-light)" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="24" cy="24" r="2" fill="var(--color-accent)"/>
              </g>

              {/* Stats mini */}
              <g transform="translate(8, 45)">
                <rect width="48" height="48" rx="14" fill="white" filter="url(#shadow1)"/>
                <polyline points="14,36 20,28 26,31 32,20 38,24" stroke="var(--color-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="32" cy="20" r="3" fill="var(--color-green)" fillOpacity="0.2" stroke="var(--color-green)" strokeWidth="1"/>
              </g>

              {/* Sparkles */}
              <circle cx="135" cy="25" r="3" fill="var(--color-accent)" fillOpacity="0.3"/>
              <circle cx="300" cy="35" r="2" fill="var(--color-blue)" fillOpacity="0.4"/>
              <circle cx="45" cy="210" r="2.5" fill="var(--color-accent-light)" fillOpacity="0.3"/>
              <circle cx="290" cy="210" r="3" fill="var(--color-accent)" fillOpacity="0.2"/>

              {/* Bottom wave */}
              <path d="M50 220 Q120 240 170 225 Q220 210 290 230 L290 260 Q170 250 50 260 Z" fill="url(#loginGrad1)" fillOpacity="0.06"/>

              <defs>
                <linearGradient id="loginGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4A6CF7"/>
                  <stop offset="100%" stopColor="#6C5CE7"/>
                </linearGradient>
                <filter id="shadow1" x="-4" y="-2" width="60" height="68" filterUnits="userSpaceOnUse">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.08"/>
                </filter>
              </defs>
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-3">
            Gerencie seu negocio de forma inteligente
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] text-center leading-relaxed max-w-sm">
            Agendamentos, clientes, equipe e financeiro — tudo em um so lugar, simples e organizado.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['Agenda Online', 'Gestao de Clientes', 'Relatorios'].map((f) => (
              <span key={f} className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/80 text-[var(--color-accent)] border border-[var(--color-border)]">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
