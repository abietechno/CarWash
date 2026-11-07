export type VehicleSize = 'compact' | 'medium' | 'large' | 'luxury';

export interface VehicleTypeOption {
  id: VehicleSize;
  name: string;
  examples: string;
  priceMultiplier: number;
  iconName: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  category: 'wash' | 'salon' | 'coating';
  tagline: string;
  priceBase: number; // Base price for compact
  durationMinutes: number;
  popular?: boolean;
  description: string;
  features: string[];
  image: string;
}

export interface ServiceAddOn {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
  category: 'interior' | 'exterior' | 'protection';
}

export type BookingStatus =
  | 'menunggu_antrian'
  | 'dicuci'
  | 'detailing'
  | 'quality_check'
  | 'selesai'
  | 'diambil';

export type PaymentMethod =
  | 'qris'
  | 'gopay'
  | 'ovo'
  | 'dana'
  | 'shopeepay'
  | 'bca_va'
  | 'apple_pay';

export interface InspectionStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  time?: string;
  photo?: string;
  technicianNote?: string;
}

export interface BookingOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleSize: VehicleSize;
  vehicleColor: string;
  packageId: string;
  packageName: string;
  addOnIds: string[];
  bookingDate: string;
  timeSlot: string;
  bayId: string;
  bayName: string;
  status: BookingStatus;
  paymentStatus: 'menunggu' | 'lunas';
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  progressPercentage: number;
  technicianName: string;
  inspectionSteps: InspectionStep[];
}

export interface CustomerReview {
  id: string;
  customerName: string;
  vehicleModel: string;
  rating: number;
  date: string;
  comment: string;
  serviceUsed: string;
  tags: string[];
  avatarInitial: string;
  verified: boolean;
  likes: number;
  technicianMention?: string;
}

export interface LoyaltyProfile {
  name: string;
  phone: string;
  tier: 'Silver' | 'Gold' | 'Platinum';
  stamps: number; // 0 to 5
  totalWashesCompleted: number;
  points: number;
  memberSince: string;
  freeWashAvailable: number;
}

export interface BayMonitor {
  id: string;
  name: string;
  type: 'Cuci Hidrolik' | 'Detailing Bay' | 'Coating Studio' | 'Dry Prep';
  status: 'tersedia' | 'pengerjaan' | 'maintenance';
  currentBookingId?: string;
  currentVehicle?: string;
  technician?: string;
  timerMinutesRemaining?: number;
}
