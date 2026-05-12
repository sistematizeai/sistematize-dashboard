'use client';

import { AuthGuard } from '@/components/auth-guard';
import { TrialGuard } from '@/components/trial-guard';
import { useAuth } from '@/lib/auth';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/logo';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'grid' },
  { label: 'Servicos', path: '/dashboard/services', icon: 'clipboard' },
  { label: 'Colaboradores', path: '/dashboard/collaborators', icon: 'users' },
  { label: 'Agenda', path: '/dashboard/appointments', icon: 'calendar' },
  { label: 'Clientes', path: '/dashboard/clients', icon: 'user' },
  { label: 'Financeiro', path: '/dashboard/financial', icon: 'dollar' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <AuthGuard>
      <TrialGuard>
        <div className="min-h-screen bg-[var(--color-bg-deep)]">
          {/* TOPBAR */}
          <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white grid grid-cols-[auto_1fr_auto] items-center px-7">
            <div className="flex items-center">
              <Logo height={30} />
            </div>

            <nav className="flex items-center justify-center gap-1">
              {NAV_ITEMS.map(item => {
                const isActive = item.path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`px-4 py-2.5 rounded-xl text-[15px] font-medium cursor-pointer transition-all whitespace-nowrap ${
                      isActive
                        ? 'text-[var(--color-accent)] bg-[var(--color-accent-soft)] font-semibold'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/[0.03]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => router.push('/dashboard/settings')}
                title="Configuracoes"
                className={`w-[38px] h-[38px] rounded-full flex items-center justify-center cursor-pointer transition-all ${
                  pathname === '/dashboard/settings'
                    ? 'bg-gradient-to-br from-[#7B8AF2] to-[#4F5AE5] shadow-[0_2px_8px_rgba(79,90,229,0.25)]'
                    : 'bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]'
                }`}
              >
                <svg
                  width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke={pathname === '/dashboard/settings' ? '#fff' : 'var(--color-text-secondary)'}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </button>
            </div>
          </header>

          {/* MAIN */}
          <main className="pt-16 min-h-screen">
            <div className="p-6 px-7">
              {children}
            </div>
          </main>
        </div>
      </TrialGuard>
    </AuthGuard>
  );
}
