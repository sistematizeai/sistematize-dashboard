'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api-client';
import { Business } from '@/types';

export function TrialGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [trialInfo, setTrialInfo] = useState<{ daysLeft: number; status: string } | null>(null);

  useEffect(() => {
    api.get('/api/businesses/me')
      .then((res) => {
        const business: Business = res.data;
        if (business.subscription_status === 'blocked') {
          router.push('/blocked');
        } else {
          setAllowed(true);
          if (business.subscription_status === 'trial' && business.trial_ends_at) {
            const endDate = new Date(business.trial_ends_at);
            const now = new Date();
            const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            setTrialInfo({ daysLeft, status: 'trial' });
          }
        }
      })
      .catch(() => setAllowed(false))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="flex h-screen items-center justify-center">Verificando conta...</div>;
  if (!allowed) return null;

  return (
    <>
      {trialInfo && trialInfo.daysLeft <= 7 && (
        <div className={`sticky top-16 z-40 px-4 py-2 text-center text-sm font-medium ${
          trialInfo.daysLeft <= 2
            ? 'bg-[var(--color-rose-soft)] text-[var(--color-rose)] border-b border-[rgba(239,68,68,0.2)]'
            : 'bg-amber-50 text-amber-700 border-b border-amber-200'
        }`}>
          {trialInfo.daysLeft === 0
            ? 'Seu periodo de teste expira hoje! Assine para continuar usando.'
            : trialInfo.daysLeft === 1
              ? 'Seu periodo de teste expira amanha! Assine para continuar usando.'
              : `Seu periodo de teste expira em ${trialInfo.daysLeft} dias. Assine para nao perder acesso.`
          }
          <a href="/dashboard/subscription" className="ml-2 underline font-semibold hover:no-underline">
            Ver planos
          </a>
        </div>
      )}
      {children}
    </>
  );
}
