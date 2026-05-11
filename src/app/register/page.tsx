'use client';

import { RegisterForm } from '@/components/register-form';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen bg-[var(--color-bg-deep)]">
      {/* Left — Form */}
      <div className="flex w-full lg:w-[480px] xl:w-[520px] flex-col justify-center px-8 sm:px-12 lg:px-14 py-10 bg-white relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.04)]">
        <RegisterForm />
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
              <rect x="50" y="40" width="240" height="160" rx="20" fill="white" fillOpacity="0.9" stroke="var(--color-border-light)" strokeWidth="1"/>
              <rect x="50" y="40" width="240" height="6" rx="3" fill="url(#regGrad1)"/>

              {/* Rocket icon */}
              <g transform="translate(145, 65)">
                <circle cx="25" cy="25" r="25" fill="url(#regGrad1)" fillOpacity="0.1"/>
                <path d="M25 12 C25 12 20 18 20 26 C20 30 22 33 25 35 C28 33 30 30 30 26 C30 18 25 12 25 12Z" fill="url(#regGrad1)" fillOpacity="0.6"/>
                <circle cx="25" cy="24" r="3" fill="white"/>
                <path d="M19 28 L15 32" stroke="var(--color-accent-light)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M31 28 L35 32" stroke="var(--color-accent-light)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M22 34 L21 38" stroke="var(--color-amber)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M28 34 L29 38" stroke="var(--color-amber)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M25 35 L25 39" stroke="var(--color-rose)" strokeWidth="1.5" strokeLinecap="round"/>
              </g>

              {/* Form field lines */}
              <rect x="90" y="125" width="160" height="12" rx="6" fill="var(--color-bg-surface)"/>
              <rect x="90" y="145" width="160" height="12" rx="6" fill="var(--color-bg-surface)"/>
              <rect x="90" y="165" width="120" height="12" rx="6" fill="var(--color-bg-surface)"/>

              {/* Button */}
              <rect x="90" y="185" width="160" height="12" rx="6" fill="url(#regGrad1)" fillOpacity="0.7"/>

              {/* Star badge */}
              <g transform="translate(268, 50)">
                <rect width="52" height="52" rx="14" fill="white" filter="url(#regShadow)"/>
                <path d="M26 15 L29 21 L36 22 L31 27 L32 34 L26 31 L20 34 L21 27 L16 22 L23 21 Z" fill="var(--color-amber)" fillOpacity="0.2" stroke="var(--color-amber)" strokeWidth="1.2" strokeLinejoin="round"/>
              </g>

              {/* Checkmark badge */}
              <g transform="translate(15, 55)">
                <rect width="50" height="50" rx="14" fill="white" filter="url(#regShadow)"/>
                <circle cx="25" cy="25" r="13" fill="var(--color-green)" fillOpacity="0.1" stroke="var(--color-green)" strokeWidth="1.2"/>
                <path d="M19 25 L23 29 L31 21" stroke="var(--color-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </g>

              {/* Users badge */}
              <g transform="translate(20, 130)">
                <rect width="48" height="48" rx="14" fill="white" filter="url(#regShadow)"/>
                <circle cx="20" cy="20" r="5" fill="var(--color-accent)" fillOpacity="0.2" stroke="var(--color-accent)" strokeWidth="1"/>
                <circle cx="30" cy="20" r="5" fill="var(--color-blue)" fillOpacity="0.2" stroke="var(--color-blue)" strokeWidth="1"/>
                <path d="M14 34 a8 6 0 0 1 12 0" fill="var(--color-accent)" fillOpacity="0.15"/>
                <path d="M24 34 a8 6 0 0 1 12 0" fill="var(--color-blue)" fillOpacity="0.15"/>
              </g>

              {/* Gift/Free badge */}
              <g transform="translate(270, 145)">
                <rect width="48" height="48" rx="14" fill="white" filter="url(#regShadow)"/>
                <rect x="14" y="20" width="20" height="14" rx="3" fill="var(--color-accent)" fillOpacity="0.12" stroke="var(--color-accent)" strokeWidth="1"/>
                <rect x="12" y="17" width="24" height="6" rx="2" fill="url(#regGrad1)" fillOpacity="0.3"/>
                <line x1="24" y1="17" x2="24" y2="34" stroke="var(--color-accent)" strokeWidth="1" strokeOpacity="0.4"/>
                <path d="M24 17 C22 14 18 13 18 15 C18 17 24 17 24 17" stroke="var(--color-accent)" strokeWidth="1" fill="none" strokeOpacity="0.5"/>
                <path d="M24 17 C26 14 30 13 30 15 C30 17 24 17 24 17" stroke="var(--color-accent)" strokeWidth="1" fill="none" strokeOpacity="0.5"/>
              </g>

              {/* Sparkles */}
              <circle cx="135" cy="25" r="3" fill="var(--color-accent)" fillOpacity="0.3"/>
              <circle cx="300" cy="35" r="2" fill="var(--color-blue)" fillOpacity="0.4"/>
              <circle cx="45" cy="220" r="2.5" fill="var(--color-accent-light)" fillOpacity="0.3"/>
              <circle cx="295" cy="220" r="3" fill="var(--color-accent)" fillOpacity="0.2"/>

              {/* Bottom wave */}
              <path d="M50 230 Q130 250 180 235 Q230 220 300 240 L300 260 Q180 250 50 260 Z" fill="url(#regGrad1)" fillOpacity="0.06"/>

              <defs>
                <linearGradient id="regGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4A6CF7"/>
                  <stop offset="100%" stopColor="#6C5CE7"/>
                </linearGradient>
                <filter id="regShadow" x="-4" y="-2" width="60" height="60" filterUnits="userSpaceOnUse">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.08"/>
                </filter>
              </defs>
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-3">
            Comece a transformar seu negocio
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] text-center leading-relaxed max-w-sm">
            Crie sua conta gratuita e organize seus agendamentos, clientes e equipe em minutos.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['7 dias gratis', 'Sem cartao', 'Cancele quando quiser'].map((f) => (
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
