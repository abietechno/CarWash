import type { Locale } from '@/i18n'

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
  // Bahasa bawaan situs publik tenant.
  locale: Locale
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
  vehicle_scope: VehicleScope
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
  vehicle_brand: string | null
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
  transaction_id: number | null
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

export type TransactionType = 'income' | 'expense'

export type TransactionMethod = 'cash' | 'qris' | 'transfer' | 'debit' | 'other'

export interface TransactionItem {
  id: number
  item_type: 'booking' | 'package' | 'addon' | 'custom'
  name: string
  qty: number
  unit_price: number
  subtotal: number
}

export interface Transaction {
  id: number
  type: TransactionType
  number: string
  business_date: string
  category: string
  description: string | null
  booking_id: number | null
  customer_name: string | null
  customer_phone: string | null
  subtotal: number
  discount: number
  amount: number
  payment_method: TransactionMethod
  paid_amount: number | null
  change: number
  created_at: string
  voided_at: string | null
  void_reason: string | null
  items: TransactionItem[]
}

export interface Paginated<T> {
  data: T[]
  meta: { current_page: number; last_page: number; total: number }
}

export interface UnpaidBooking {
  id: number
  ticket: string
  customer_name: string
  phone: string | null
  plate: string | null
  vehicle_type: VehicleCode
  vehicle_color: string
  package_name: string
  price: number
  status: BookingStatus
  queue_date: string
}

export interface PosCatalog {
  packages: { id: number; name: string; category: PackageCategory; vehicle_scope: VehicleScope; price: number }[]
  addons: { id: number; name: string; category: AddonCategory; price: number }[]
  vehicle_types: { code: VehicleCode; name: string; price_multiplier: number }[]
  payment_methods: TransactionMethod[]
  unpaid: UnpaidBooking[]
}

export interface PaymentSettings {
  methods: TransactionMethod[]
}

export interface ReportPoint {
  date: string
  income: number
  expense: number
}

export interface ReportSummary {
  from: string
  to: string
  income: number
  expense: number
  net: number
  sales_count: number
  expense_count: number
  average_sale: number
  discount: number
  voided_count: number
  granularity: 'day' | 'month'
  series: ReportPoint[]
  by_method: { key: TransactionMethod; total: number; count: number }[]
  by_category: { key: string; total: number; count: number }[]
  top_items: { name: string; qty: number; total: number }[]
}

export type VehicleScope = 'car' | 'motor' | 'all'

export type VehicleCode = 'compact' | 'medium' | 'large' | 'luxury' | 'motor_matic' | 'motor_listrik' | 'motor_manual'

export interface VehicleType {
  id: number
  code: VehicleCode
  name: string
  examples: string | null
  price_multiplier: number
  sort_order: number
}
