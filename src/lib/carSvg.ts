// Ilustrasi mobil & motor tampak atas (menghadap kanan) per jenis kendaraan & warna.
// Salinan yang sama ada di situs tenant (src/lib/carSvg.ts) dan dash-admin (dash-admin/src/lib/carSvg.ts) — ubah keduanya.

export const VEHICLE_COLORS: Record<string, { label: string; body: string; edge: string }> = {
  white: { label: 'Putih', body: '#F8FAFC', edge: '#CBD5E1' },
  black: { label: 'Hitam', body: '#1F2937', edge: '#6B7280' },
  silver: { label: 'Silver', body: '#D1D5DB', edge: '#9CA3AF' },
  gray: { label: 'Abu-abu', body: '#6B7280', edge: '#4B5563' },
  red: { label: 'Merah', body: '#DC2626', edge: '#991B1B' },
  blue: { label: 'Biru', body: '#2563EB', edge: '#1E40AF' },
  green: { label: 'Hijau', body: '#16A34A', edge: '#166534' },
  yellow: { label: 'Kuning', body: '#FACC15', edge: '#CA8A04' },
  orange: { label: 'Oranye', body: '#F97316', edge: '#C2410C' },
  brown: { label: 'Cokelat', body: '#92400E', edge: '#78350F' },
}

interface Shape {
  len: number
  wid: number
  rx: number
  cabin: [number, number]
  roof: [number, number]
  wheels: [number, number]
  rails?: boolean
  spoiler?: boolean
}

const SHAPES: Record<string, Shape> = {
  // Sedan / hatchback
  compact: { len: 140, wid: 64, rx: 20, cabin: [0.22, 0.72], roof: [0.34, 0.6], wheels: [0.2, 0.8] },
  // SUV / crossover: lebih lebar, ada roof rail
  medium: { len: 156, wid: 72, rx: 16, cabin: [0.16, 0.7], roof: [0.26, 0.6], wheels: [0.19, 0.8], rails: true },
  // MPV / van: paling panjang & kotak
  large: { len: 172, wid: 74, rx: 12, cabin: [0.08, 0.72], roof: [0.14, 0.62], wheels: [0.17, 0.82], rails: true },
  // Sport / mewah: ramping, kabin pendek, spoiler
  luxury: { len: 160, wid: 62, rx: 26, cabin: [0.3, 0.7], roof: [0.4, 0.6], wheels: [0.2, 0.8], spoiler: true },
}

const GLASS = '#1E293B'

// Matic & listrik berbentuk skuter (listrik tanpa knalpot, ada petir); manual bertangki dengan mesin terbuka.
function motorSvg(type: string, c: { body: string; edge: string }): string {
  const rect = (x: number, y: number, w: number, h: number, rx: number, style: string) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ${style}/>`
  const paint = `fill="${c.body}" stroke="${c.edge}" stroke-width="2"`
  const seat = `fill="${GLASS}" stroke="#475569" stroke-width="1.5"`
  const tire = 'fill="#111827"'
  const manual = type === 'motor_manual'
  const electric = type === 'motor_listrik'
  const bar = manual ? 142 : 135

  const parts: string[] = [
    rect(30, 40, 152, 30, 14, 'fill="#000" opacity=".2"'),
    rect(24, 43, 46, 14, 6, tire),
    rect(132, 43, 46, 14, 6, tire),
  ]

  // knalpot
  if (!electric) parts.push(rect(32, 66, manual ? 64 : 52, 9, 4, 'fill="#9CA3AF" stroke="#6B7280"'))

  if (manual) {
    parts.push(
      rect(38, 42, 34, 16, 8, paint),
      // blok mesin
      rect(92, 28, 30, 44, 6, 'fill="#6B7280" stroke="#374151"'),
      rect(60, 37, 44, 26, 10, seat),
      // tangki
      rect(96, 32, 46, 36, 16, paint),
      rect(106, 38, 26, 6, 3, 'fill="#fff" opacity=".35"'),
    )
  } else {
    parts.push(
      rect(38, 31, 72, 38, 17, paint),
      // dek kaki
      rect(100, 36, 34, 28, 4, paint),
      rect(106, 41, 22, 18, 3, `fill="${c.edge}" opacity=".5"`),
      rect(46, 37, 56, 26, 12, seat),
      rect(52, 41, 40, 5, 2.5, 'fill="#fff" opacity=".14"'),
      // tameng depan
      rect(128, 30, 24, 40, 11, paint),
    )
  }

  if (electric) parts.push('<polygon points="78,38 66,52 73,52 69,62 82,47 75,47" fill="#FACC15"/>')

  parts.push(
    // spakbor depan
    rect(150, 45, 22, 10, 4, paint),
    // setang, kedua grip, dan spion
    rect(bar, 18, 7, 64, 3.5, 'fill="#374151"'),
    rect(bar - 1, 14, 9, 18, 4, tire),
    rect(bar - 1, 68, 9, 18, 4, tire),
    `<circle cx="${bar + 13}" cy="25" r="5" ${paint}/>`,
    `<circle cx="${bar + 13}" cy="75" r="5" ${paint}/>`,
    // lampu depan & belakang
    rect(152, 41, 6, 18, 3, 'fill="#FEF9C3" stroke="#CA8A04"'),
    rect(36, 44, 5, 12, 2, 'fill="#EF4444"'),
  )

  return `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${parts.join('')}</svg>`
}

export function carSvg(type: string, color: string): string {
  const c = VEHICLE_COLORS[color] ?? VEHICLE_COLORS.white!
  if (type.startsWith('motor_')) return motorSvg(type, c)

  const s = SHAPES[type] ?? SHAPES.compact!
  const x = (200 - s.len) / 2
  const y = (100 - s.wid) / 2
  const X = (f: number) => (x + s.len * f).toFixed(1)
  const Y = (f: number) => (y + s.wid * f).toFixed(1)
  const W = (a: number, b: number) => (s.len * (b - a)).toFixed(1)
  const [c0, c1] = s.cabin
  const [r0, r1] = s.roof

  const parts: string[] = [
    `<rect x="${x + 4}" y="${y + 6}" width="${s.len}" height="${s.wid}" rx="${s.rx}" fill="#000" opacity=".2"/>`,
  ]

  for (const f of s.wheels) {
    const wx = (x + s.len * f - 13).toFixed(1)
    parts.push(`<rect x="${wx}" y="${y - 5}" width="26" height="12" rx="4" fill="#111827"/>`)
    parts.push(`<rect x="${wx}" y="${y + s.wid - 7}" width="26" height="12" rx="4" fill="#111827"/>`)
  }

  const mx = (x + s.len * c1 - 9).toFixed(1)
  parts.push(
    `<rect x="${mx}" y="${y - 5}" width="8" height="7" rx="2" fill="${c.body}" stroke="${c.edge}"/>`,
    `<rect x="${mx}" y="${y + s.wid - 2}" width="8" height="7" rx="2" fill="${c.body}" stroke="${c.edge}"/>`,
    `<rect x="${x}" y="${y}" width="${s.len}" height="${s.wid}" rx="${s.rx}" fill="${c.body}" stroke="${c.edge}" stroke-width="2"/>`,
    // garis kap mesin
    `<path d="M${X(c1 + 0.06)} ${Y(0.3)} L${X(0.95)} ${Y(0.36)} M${X(c1 + 0.06)} ${Y(0.7)} L${X(0.95)} ${Y(0.64)}" stroke="${c.edge}" stroke-width="1.2" fill="none" opacity=".6"/>`,
    // kaca samping
    `<rect x="${X(c0)}" y="${Y(0.08)}" width="${W(c0, c1)}" height="${(s.wid * 0.12).toFixed(1)}" rx="3" fill="${GLASS}" opacity=".85"/>`,
    `<rect x="${X(c0)}" y="${Y(0.8)}" width="${W(c0, c1)}" height="${(s.wid * 0.12).toFixed(1)}" rx="3" fill="${GLASS}" opacity=".85"/>`,
    // kaca belakang & depan
    `<polygon points="${X(c0)},${Y(0.12)} ${X(r0)},${Y(0.2)} ${X(r0)},${Y(0.8)} ${X(c0)},${Y(0.88)}" fill="${GLASS}"/>`,
    `<polygon points="${X(r1)},${Y(0.2)} ${X(c1)},${Y(0.1)} ${X(c1)},${Y(0.9)} ${X(r1)},${Y(0.8)}" fill="${GLASS}"/>`,
    // atap
    `<rect x="${X(r0)}" y="${Y(0.2)}" width="${W(r0, r1)}" height="${(s.wid * 0.6).toFixed(1)}" rx="6" fill="${c.body}" stroke="${c.edge}" stroke-width="1.5"/>`,
    `<rect x="${X(r0 + 0.02)}" y="${Y(0.26)}" width="${W(r0, r1 - 0.06)}" height="${(s.wid * 0.14).toFixed(1)}" rx="4" fill="#fff" opacity=".18"/>`,
  )

  if (s.rails) {
    parts.push(
      `<rect x="${X(r0)}" y="${Y(0.24)}" width="${W(r0, r1)}" height="2.5" rx="1" fill="${c.edge}"/>`,
      `<rect x="${X(r0)}" y="${Y(0.73)}" width="${W(r0, r1)}" height="2.5" rx="1" fill="${c.edge}"/>`,
    )
  }

  // lampu depan (kanan) & belakang (kiri)
  const lh = (s.wid * 0.18).toFixed(1)
  parts.push(
    `<rect x="${x + s.len - 7}" y="${Y(0.1)}" width="5" height="${lh}" rx="2" fill="#FEF9C3"/>`,
    `<rect x="${x + s.len - 7}" y="${Y(0.72)}" width="5" height="${lh}" rx="2" fill="#FEF9C3"/>`,
    `<rect x="${x + 2}" y="${Y(0.1)}" width="4" height="${lh}" rx="2" fill="#EF4444"/>`,
    `<rect x="${x + 2}" y="${Y(0.72)}" width="4" height="${lh}" rx="2" fill="#EF4444"/>`,
  )

  if (s.spoiler) {
    parts.push(`<rect x="${x - 3}" y="${Y(0.06)}" width="7" height="${(s.wid * 0.88).toFixed(1)}" rx="2" fill="#111827"/>`)
  }

  return `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${parts.join('')}</svg>`
}
