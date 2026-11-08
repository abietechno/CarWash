export type TenantStatus = 'draft' | 'published' | 'suspended'

export type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface OpeningHour {
  day: Day
  open: string
  close: string
  closed: boolean
}

export interface Tenant {
  id: number
  name: string
  subdomain: string
  url: string
  status: TenantStatus
  tagline: string | null
  description: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  city: string | null
  maps_url: string | null
  logo_url: string | null
  opening_hours: OpeningHour[]
  bay_count: number
  published_at: string | null
  publish_issues: string[]
  stats: { packages: number; addons: number }
  plan: Plan
  pro_until: string | null
  features: PlanFeatures
}

export type Plan = 'free' | 'pro'

export interface PlanFeatures {
  max_packages: number | null
  max_promos: number
  online_booking: boolean
  custom_logo: boolean
  branding: boolean
}

export interface User {
  id: number
  name: string
  email: string
  role: 'owner' | 'superadmin' | string
  phone: string | null
}

export interface Subscription {
  plan: Plan
  pro_until: string | null
  features: PlanFeatures
  prices: { monthly: number; yearly: number }
  payment_instructions: string
  contact_whatsapp: string
  payments: { id: number; period: PaymentPeriod; amount: number; paid_at: string; period_end: string }[]
}

export type PaymentPeriod = 'monthly' | 'yearly'

// ---- Super-admin ----

export interface SuperTenant {
  id: number
  name: string
  subdomain: string
  url: string
  status: TenantStatus
  plan: Plan
  pro_until: string | null
  city: string | null
  owner: { name: string; email: string; phone: string | null } | null
  active_packages: number
  bookings_this_month: number
  created_at: string
}

export interface SuperTenantDetail extends SuperTenant {
  whatsapp: string | null
  address: string | null
  published_at: string | null
  suspended_at: string | null
  bookings_today: number
  features: PlanFeatures
  prices: { monthly: number; yearly: number }
  payments: {
    id: number
    period: PaymentPeriod
    amount: number
    method: string
    reference: string | null
    note: string | null
    paid_at: string
    period_start: string
    period_end: string
    recorded_by: string | null
  }[]
  activity: { id: number; action: string; meta: Record<string, unknown> | null; user: string | null; created_at: string }[]
}

export interface SuperOverview {
  tenants: { total: number; published: number; draft: number; suspended: number; new_this_week: number }
  plans: { pro: number; free: number; expiring_soon: number }
  revenue: { this_month: number; estimated_mrr: number }
  bookings_today: number
  recent_signups: Pick<SuperTenant, 'id' | 'name' | 'subdomain' | 'status' | 'plan' | 'pro_until' | 'created_at'>[]
  expiring: Pick<SuperTenant, 'id' | 'name' | 'subdomain' | 'status' | 'plan' | 'pro_until' | 'created_at'>[]
}

export interface PlatformSettings {
  pro_monthly_price: number
  pro_yearly_price: number
  payment_instructions: string
  contact_whatsapp: string
}

export type PackageCategory = 'wash' | 'salon' | 'coating'

export interface ServicePackage {
  id: number
  name: string
  category: PackageCategory
  tagline: string | null
  price: number
  duration_minutes: number
  description: string | null
  features: string[] | null
  image_url: string | null
  is_popular: boolean
  is_active: boolean
  sort_order: number
}

export type PromoTheme = 'blue' | 'cyan' | 'violet' | 'amber' | 'rose' | 'slate'

export interface Promo {
  id: number
  title: string
  subtitle: string | null
  badge: string | null
  service_package_id: number | null
  theme: PromoTheme
  image_url: string | null
  is_active: boolean
  sort_order: number
}

export type BookingStatus = 'waiting' | 'in_progress' | 'done' | 'picked_up' | 'cancelled'

export interface BoardBooking {
  id: number
  ticket: string
  name: string
  customer_name: string
  phone: string | null
  plate: string | null
  source: 'online' | 'walk_in'
  vehicle_type: VehicleCode
  vehicle_color: string
  package_name: string
  price: number
  duration_minutes: number
  status: BookingStatus
  bay: number | null
  created_at: string
  started_at: string | null
  finished_at: string | null
  progress: number | null
  remaining_minutes: number | null
  est_wait_minutes: number | null
  est_start_at: string | null
}

export interface QueueBoard {
  date: string
  bay_count: number
  stats: { in_progress: number; waiting: number; finished_today: number }
  in_progress: BoardBooking[]
  waiting: BoardBooking[]
  ready: BoardBooking[]
  picked_up: BoardBooking[]
  cancelled: BoardBooking[]
}

export type AddonCategory = 'interior' | 'exterior' | 'protection'

export interface ServiceAddon {
  id: number
  name: string
  category: AddonCategory
  price: number
  duration_minutes: number
  description: string | null
  is_active: boolean
  sort_order: number
}

export type VehicleCode = 'compact' | 'medium' | 'large' | 'luxury'

export interface VehicleType {
  id: number
  code: VehicleCode
  name: string
  examples: string | null
  price_multiplier: number
  sort_order: number
}
