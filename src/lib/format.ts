const rupiahFormat = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

export const rupiah = (value: number) => rupiahFormat.format(value);

export function duration(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`;
  const rest = minutes % 60;
  return `${Math.floor(minutes / 60)} jam${rest ? ` ${rest} mnt` : ''}`;
}

// Jam:menit dari string ISO, mis. "09:35".
export function clock(iso: string | null): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
}

export const todayLabel = () =>
  new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
