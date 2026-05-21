'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from './api-client';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ requires_2fa?: boolean; temp_token?: string; blocked?: boolean }>;
  loginWithToken: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
const PUBLIC_AUTH_PATHS = ['/login', '/register', '/complete-registration', '/auth/callback', '/blocked', '/terms', '/privacy'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    const profileRes = await api.get('/api/profiles/me');
    setToken('cookie-session');
    setUser(profileRes.data);
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    if (PUBLIC_AUTH_PATHS.includes(window.location.pathname)) {
      queueMicrotask(() => setIsLoading(false));
      return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }

    queueMicrotask(() => {
      loadProfile()
        .catch(() => {
          setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    });

    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.data.requires_2fa) {
      return { requires_2fa: true, temp_token: res.data.temp_token };
    }
    if (res.data.blocked) {
      return { blocked: true };
    }
    await loadProfile();
    return {};
  };

  const loginWithToken = async () => {
    await loadProfile();
  };

  const logout = () => {
    void api.post('/api/auth/logout').catch(() => undefined);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithToken, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
