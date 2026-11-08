import { api } from '@/lib/api'

/**
 * Setelah paket/promo tersimpan: unggah foto baru, atau hapus foto lama kalau diminta.
 * Mengembalikan data terbaru dari server (atau null kalau tidak ada perubahan foto).
 */
export async function syncImage<T>(resource: string, file: File | null, removed: boolean, hadImage: boolean): Promise<T | null> {
  if (file) {
    const body = new FormData()
    body.append('image', file)
    const { data } = await api.post<T>(`${resource}/image`, body)
    return data
  }
  if (removed && hadImage) {
    const { data } = await api.delete<T>(`${resource}/image`)
    return data
  }
  return null
}
