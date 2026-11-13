import axios from 'axios'
import { locale, t } from '@/i18n'

export const TOKEN_KEY = 'dash_admin_token'

// Saat dev, '/api' diteruskan Vite ke backend (lihat server.proxy di vite.config.ts).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  // Pesan error & validasi dari backend ikut bahasa yang dipilih.
  config.headers['X-Locale'] = locale.value
  return config
})

let unauthorizedHandler: (() => void) | null = null

// Dipanggil saat token tidak berlaku lagi (401); diset dari main.ts.
export function onUnauthorized(handler: () => void) {
  unauthorizedHandler = handler
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) unauthorizedHandler?.()
    return Promise.reject(error)
  },
)

export type FieldErrors = Record<string, string[]>

export function errorMessage(error: unknown, fallback = t('common.error')): string {
  if (!axios.isAxiosError(error)) return fallback
  if (!error.response) return t('common.offline')
  if (error.response.status === 429) return t('common.tooMany')
  return (error.response.data as { message?: string } | undefined)?.message || fallback
}

export function fieldErrors(error: unknown): FieldErrors {
  if (axios.isAxiosError(error) && error.response?.status === 422) {
    return (error.response.data as { errors?: FieldErrors }).errors ?? {}
  }
  return {}
}
