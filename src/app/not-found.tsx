import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)]">
      <div className="text-center max-w-md px-6">
        <p className="text-6xl font-extrabold text-[var(--color-text-muted)] mb-2">404</p>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Pagina nao encontrada</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">A pagina que voce procura nao existe ou foi removida.</p>
        <Link href="/dashboard" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all inline-block">
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
}
