'use client';

export function Logo({ height = 30 }: { height?: number }) {
  return (
    <img
      src="/logo-sistematize.png"
      alt="Sistematize"
      style={{ height: `${height}px`, width: 'auto' }}
      draggable={false}
    />
  );
}
