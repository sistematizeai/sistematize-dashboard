import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: 'Sistematize — Dashboard',
  description: 'Gerencie seu salao de beleza',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.ico',
    apple: '/icon-192.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider><ToastProvider>{children}</ToastProvider></AuthProvider>
      </body>
    </html>
  );
}
