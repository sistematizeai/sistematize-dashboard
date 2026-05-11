export function KpiCard({
  label,
  value,
  trend,
  trendColor = 'var(--color-green)',
  iconBg,
  icon,
}: {
  label: string;
  value: string | number;
  trend?: string;
  trendColor?: string;
  iconBg: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--color-bg-surface)] rounded-2xl p-5 flex justify-between items-center hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all">
      <div>
        <div className="text-[11px] text-[var(--color-text-secondary)] font-medium mb-1.5 uppercase tracking-wide">{label}</div>
        <div className="text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight">{value}</div>
        {trend && (
          <div className="text-[11px] font-semibold mt-1 flex items-center gap-1" style={{ color: trendColor }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {trend.startsWith('-') ? (
                <polyline points="6 9 12 15 18 9" />
              ) : (
                <polyline points="18 15 12 9 6 15" />
              )}
            </svg>
            {trend}
          </div>
        )}
      </div>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        {icon}
      </div>
    </div>
  );
}
