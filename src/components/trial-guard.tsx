'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api-client';
import { Business } from '@/types';

export function TrialGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    api.get('/api/businesses/me')
      .then((res) => {
        const business: Business = res.data;
        if (business.subscription_status === 'blocked') {
          router.push('/blocked');
        } else {
          setAllowed(true);
        }
      })
      .catch(() => setAllowed(true))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="flex h-screen items-center justify-center">Verificando conta...</div>;
  if (!allowed) return null;

  return <>{children}</>;
}
