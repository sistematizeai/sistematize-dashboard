'use client';

import { AuthGuard } from '@/components/auth-guard';
import { TrialGuard } from '@/components/trial-guard';
import { useAuth } from '@/lib/auth';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'grid' },
  { label: 'Servicos', path: '/dashboard/services', icon: 'clipboard' },
  { label: 'Colaboradores', path: '/dashboard/collaborators', icon: 'users' },
  { label: 'Agenda', path: '/dashboard/appointments', icon: 'calendar' },
  { label: 'Clientes', path: '/dashboard/clients', icon: 'user' },
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
          <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/85 backdrop-blur-xl border-b border-[var(--color-border)] flex items-center px-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mr-10">
              <div className="w-[34px] h-[34px] rounded-[10px] bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center shadow-[0_4px_12px_rgba(124,58,237,0.25)]">
                <svg className="w-[18px] h-[18px] stroke-white stroke-[2.5] fill-none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>
              </div>
              <span className="text-lg font-extrabold text-[var(--color-text-primary)] tracking-tight">Sistematize</span>
            </div>

            <nav className="flex items-center gap-0.5">
              {NAV_ITEMS.map(item => {
                const isActive = item.path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`px-3.5 py-2 rounded-[10px] text-[13px] font-medium cursor-pointer transition-all whitespace-nowrap ${
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

            <div className="flex items-center gap-2.5 ml-auto">
              <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gradient-to-br from-[rgba(124,58,237,0.08)] to-[rgba(167,139,250,0.08)] border border-[rgba(124,58,237,0.15)] text-[var(--color-accent)]">
                Trial
              </span>
              <div
                className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center text-white font-bold text-[13px] cursor-pointer shadow-[0_2px_8px_rgba(124,58,237,0.25)]"
                onClick={logout}
                title="Sair"
              >
                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
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
