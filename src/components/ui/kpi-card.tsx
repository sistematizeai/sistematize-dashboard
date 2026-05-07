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
    <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] flex justify-between items-center hover:border-[var(--color-border-light)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all">
      <div>
        <div className="text-xs text-[var(--color-text-secondary)] font-medium mb-2">{label}</div>
        <div className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">{value}</div>
        {trend && <div className="text-[11px] font-semibold mt-1 flex items-center gap-1" style={{ color: trendColor }}>{trend}</div>}
      </div>
      <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: iconBg }}>
        {icon}
      </div>
    </div>
  );
}
