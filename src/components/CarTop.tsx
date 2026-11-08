import { useMemo } from 'react';
import { carSvg } from '../lib/carSvg';

// Mobil tampak atas sesuai jenis & warna. Markup berasal dari peta bentuk/warna tetap di carSvg (bukan input bebas).
export function CarTop({ type, color, className = '' }: { type: string; color: string; className?: string }) {
  const html = useMemo(() => carSvg(type, color), [type, color]);
  return <div className={`[&>svg]:h-full [&>svg]:w-full ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
