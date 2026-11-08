import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, TOKEN_KEY } from '@/lib/api'
import type { Tenant, User } from '@/types'

// Token super-admin disimpan sementara selama "masuk sebagai tenant".
const SUPER_TOKEN_KEY = 'dash_admin_super_token'

interface SessionPayload {
  user: User
  tenant: Tenant | null
  impersonating: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<User | null>(null)
  const tenant = ref<Tenant | null>(null)
  const impersonating = ref(false)

  const isLoggedIn = computed(() => token.value !== null)
  const isSuperadmin = computed(() => user.value?.role === 'superadmin')

  function setToken(value: string | null) {
    token.value = value
    if (value) localStorage.setItem(TOKEN_KEY, value)
    else localStorage.removeItem(TOKEN_KEY)
  }

  function setSession(payload: SessionPayload) {
    user.value = payload.user
    tenant.value = payload.tenant
    impersonating.value = payload.impersonating
  }

  async function login(email: string, password: string) {
    const { data } = await api.post<SessionPayload & { token: string }>('/auth/login', { email, password })
    localStorage.removeItem(SUPER_TOKEN_KEY)
    setToken(data.token)
    setSession(data)
  }

  async function fetchMe() {
    const { data } = await api.get<SessionPayload>('/auth/me')
    setSession(data)
  }

  function clear() {
    setToken(null)
    localStorage.removeItem(SUPER_TOKEN_KEY)
    user.value = null
    tenant.value = null
    impersonating.value = false
  }

  async function revokeCurrentToken() {
    try {
      await api.post('/auth/logout')
    } catch {
      // Token mungkin sudah tidak berlaku; tetap lanjut.
    }
  }

  async function logout() {
    if (impersonating.value) {
      await stopImpersonation()
      return
    }
    await revokeCurrentToken()
    clear()
  }

  // Super-admin masuk ke dashboard tenant dengan token sementara dari server.
  async function startImpersonation(tenantToken: string) {
    if (token.value) localStorage.setItem(SUPER_TOKEN_KEY, token.value)
    setToken(tenantToken)
    await fetchMe()
  }

  async function stopImpersonation() {
    const superToken = localStorage.getItem(SUPER_TOKEN_KEY)
    await revokeCurrentToken()
    localStorage.removeItem(SUPER_TOKEN_KEY)
    setToken(superToken)
    if (superToken) await fetchMe()
    else clear()
  }

  function setTenant(value: Tenant) {
    tenant.value = value
  }

  return {
    token,
    user,
    tenant,
    impersonating,
    isLoggedIn,
    isSuperadmin,
    login,
    fetchMe,
    logout,
    clear,
    setTenant,
    startImpersonation,
    stopImpersonation,
  }
})
