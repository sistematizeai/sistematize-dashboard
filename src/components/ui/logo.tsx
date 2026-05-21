'use client';

import Image from 'next/image';

export function Logo({ height = 30 }: { height?: number }) {
  return (
    <Image
      src="/logo-sistematize.png"
      alt="Sistematize"
      width={186}
      height={40}
      style={{ height: `${height}px`, width: 'auto' }}
      draggable={false}
    />
  );
}
