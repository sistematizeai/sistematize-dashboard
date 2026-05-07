export function Badge({ variant, children }: { variant: 'active' | 'hidden' | 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'; children: React.ReactNode }) {
  const styles: Record<string, string> = {
    active: 'bg-[var(--color-green-soft)] text-[var(--color-green)]',
    hidden: 'bg-[var(--color-amber-soft)] text-[var(--color-amber)]',
    scheduled: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
    confirmed: 'bg-[var(--color-green-soft)] text-[var(--color-green)]',
    in_progress: 'bg-[var(--color-amber-soft)] text-[var(--color-amber)]',
    completed: 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]',
    cancelled: 'bg-[var(--color-rose-soft)] text-[var(--color-rose)]',
    no_show: 'bg-[var(--color-rose-soft)] text-[var(--color-rose)]',
  };

  return (
    <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${styles[variant] || styles.active}`}>
      {children}
    </span>
  );
}
