import type { VehicleScope } from '@/types'

export const isMotor = (code: string) => code.startsWith('motor_')

export const fitsVehicle = (scope: VehicleScope, code: string) => scope === 'all' || scope === (isMotor(code) ? 'motor' : 'car')

// Paket khusus motor memakai harganya sendiri; selain itu harga dasar × pengali jenis kendaraan.
export const scopedPrice = (price: number, scope: VehicleScope, multiplier: number) =>
  scope === 'motor' ? price : Math.round(price * multiplier)
