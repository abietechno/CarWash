import heroImage from '../assets/images/detailing_hero_studio_1794059425076.jpg';
import foamImage from '../assets/images/snow_foam_wash_1794059440833.jpg';
import interiorImage from '../assets/images/interior_spa_detail_1794059454770.jpg';

export type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type PackageCategory = 'wash' | 'salon' | 'coating';
export type PromoTheme = 'blue' | 'cyan' | 'violet' | 'amber' | 'rose' | 'slate';

export interface OpeningHour {
  day: Day;
  open: string;
  close: string;
  closed: boolean;
}

export interface Business {
  name: string;
  subdomain: string;
  tagline: string | null;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  mapsUrl: string | null;
  logo: string | null; // logo sendiri (paket Pro); null = inisial nama
  openingHours: OpeningHour[];
  openNow: boolean;
}

export interface Package {
  id: number;
  name: string;
  category: PackageCategory;
  tagline: string | null;
  price: number; // harga dasar (sedan/hatchback)
  durationMinutes: number;
  description: string | null;
  features: string[];
  popular: boolean;
  image: string;
}

export interface VehicleType {
  code: string;
  name: string;
  examples: string;
  multiplier: number;
}

export interface Promo {
  id: number;
  title: string;
  subtitle: string | null;
  badge: string | null;
  packageId: number | null;
  theme: PromoTheme;
  image: string | null;
}

export interface Features {
  onlineBooking: boolean; // reservasi online (paket Pro)
  branding: boolean; // label "Dibuat dengan WashWuzz" (paket Gratis)
}

export interface Site {
  business: Business;
  features: Features;
  packages: Package[];
  vehicleTypes: VehicleType[];
  promos: Promo[];
}

// Response GET /api/public/site (backend Laravel).
interface ApiSite {
  tenant: {
    name: string;
    subdomain: string;
    tagline: string | null;
    description: string | null;
    phone: string | null;
    whatsapp: string | null;
    address: string | null;
    city: string | null;
    maps_url: string | null;
    logo_url: string | null;
    opening_hours: OpeningHour[] | null;
    open_now: boolean;
  };
  features: { online_booking: boolean; branding: boolean };
  vehicle_types: { code: string; name: string; examples: string | null; price_multiplier: number | string }[];
  packages: {
    id: number;
    name: string;
    category: PackageCategory;
    tagline: string | null;
    price: number;
    duration_minutes: number;
    description: string | null;
    features: string[] | null;
    is_popular: boolean;
    image_url: string | null;
  }[];
  promos: {
    id: number;
    title: string;
    subtitle: string | null;
    badge: string | null;
    service_package_id: number | null;
    theme: PromoTheme;
    image_url: string | null;
  }[];
}

export const HERO_IMAGE = heroImage;

// Foto bawaan kalau pemilik belum mengunggah foto paket.
const CATEGORY_IMAGES: Record<PackageCategory, string> = {
  wash: foamImage,
  salon: interiorImage,
  coating: heroImage,
};

export const CATEGORY_LABELS: Record<PackageCategory, string> = {
  wash: 'Cuci Mobil',
  salon: 'Salon Mobil',
  coating: 'Coating',
};

/** Data situs tenant sesuai subdomain yang sedang dibuka; null kalau belum terdaftar/dipublikasikan. */
export async function fetchSite(): Promise<Site | null> {
  const res = await fetch('/api/public/site', { headers: { Accept: 'application/json' } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: ApiSite = await res.json();
  const t = data.tenant;

  return {
    business: {
      name: t.name,
      subdomain: t.subdomain,
      tagline: t.tagline,
      description: t.description,
      phone: t.phone,
      whatsapp: t.whatsapp,
      address: t.address,
      city: t.city,
      mapsUrl: t.maps_url,
      logo: t.logo_url,
      openingHours: t.opening_hours ?? [],
      openNow: t.open_now,
    },
    features: { onlineBooking: data.features.online_booking, branding: data.features.branding },
    packages: data.packages.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      tagline: p.tagline,
      price: p.price,
      durationMinutes: p.duration_minutes,
      description: p.description,
      features: p.features ?? [],
      popular: p.is_popular,
      image: p.image_url ?? CATEGORY_IMAGES[p.category],
    })),
    vehicleTypes: data.vehicle_types.map((v) => ({
      code: v.code,
      name: v.name,
      examples: v.examples ?? '',
      multiplier: Number(v.price_multiplier),
    })),
    promos: data.promos.map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      badge: p.badge,
      packageId: p.service_package_id,
      theme: p.theme,
      image: p.image_url,
    })),
  };
}

export const priceFor = (pkg: Package, vehicle?: VehicleType) => Math.round(pkg.price * (vehicle?.multiplier ?? 1));

/** Link wa.me dari nomor lokal (08xx) atau internasional (62xx). */
export function whatsappLink(number: string | null, text?: string): string | null {
  if (!number) return null;
  let digits = number.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export const DAY_LABELS: Record<Day, string> = {
  mon: 'Senin',
  tue: 'Selasa',
  wed: 'Rabu',
  thu: 'Kamis',
  fri: 'Jumat',
  sat: 'Sabtu',
  sun: 'Minggu',
};

const DAYS_BY_JS_INDEX: Day[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function todayHours(hours: OpeningHour[], now = new Date()): OpeningHour | undefined {
  return hours.find((h) => h.day === DAYS_BY_JS_INDEX[now.getDay()]);
}

export const formatHours = (h: OpeningHour) =>
  h.closed ? 'Tutup' : `${h.open.replace(':', '.')}–${h.close.replace(':', '.')}`;
