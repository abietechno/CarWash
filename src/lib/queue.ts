export type BookingStatus = 'waiting' | 'in_progress' | 'done';

export interface QueueItem {
  ticket: string;
  name: string;
  vehicle_type: string;
  vehicle_color: string;
  package_name: string;
  duration_minutes: number;
  status: BookingStatus;
  bay: number | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  progress: number | null;
  remaining_minutes: number | null;
  est_wait_minutes: number | null;
  est_start_at: string | null;
  position?: number | null;
  date?: string;
}

export interface QueueBoard {
  date: string;
  bay_count: number;
  stats: { in_progress: number; waiting: number; finished_today: number; next_wait_minutes: number };
  in_progress: QueueItem[];
  waiting: QueueItem[];
  ready: QueueItem[];
}

export interface BookingInput {
  customer_name: string;
  phone: string;
  vehicle_type: string;
  vehicle_color: string;
  package_id: number;
}

export class BookingError extends Error {
  constructor(
    message: string,
    public fields: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

export async function fetchQueue(): Promise<QueueBoard> {
  const res = await fetch('/api/public/queue', { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createBooking(input: BookingInput): Promise<QueueItem> {
  const res = await fetch('/api/public/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));

  if (res.status === 201) return data.booking;
  if (res.status === 429) throw new BookingError('Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.');
  throw new BookingError(data.message || 'Reservasi gagal. Coba lagi.', data.errors ?? {});
}

// Tiket reservasi terakhir di browser ini, supaya "mobil kamu" bisa disorot di papan antrian.
interface SavedTicket {
  ticket: string;
  date: string;
}

const ticketKey = (subdomain: string) => `cw-ticket:${subdomain}`;

export function saveMyTicket(subdomain: string, ticket: string, date: string) {
  try {
    localStorage.setItem(ticketKey(subdomain), JSON.stringify({ ticket, date } satisfies SavedTicket));
  } catch {
    // Penyimpanan diblokir; sorotan "mobil kamu" saja yang tidak tersedia.
  }
}

export function loadMyTicket(subdomain: string, date: string): string | null {
  try {
    const saved: SavedTicket | null = JSON.parse(localStorage.getItem(ticketKey(subdomain)) ?? 'null');
    return saved && saved.date === date ? saved.ticket : null;
  } catch {
    return null;
  }
}
