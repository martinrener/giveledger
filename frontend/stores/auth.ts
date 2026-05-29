interface AuthSession {
  slug: string
  churchName: string
  userEmail: string
}

const apiError = (e: unknown, fallback: string): string => {
  const data = (e as { data?: { error?: string } })?.data
  return data?.error ?? (e instanceof Error ? e.message : fallback)
}

export const useAuthStore = defineStore(`auth`, () => {
  const slug       = ref<string | null>(null)
  const churchName = ref<string | null>(null)
  const userEmail  = ref<string | null>(null)
  const loading    = ref(false)
  const error      = ref<string | null>(null)

  const isAuthenticated = computed(() => slug.value !== null)

  const persist = () => {
    if (!import.meta.client || slug.value === null) { return }
    localStorage.setItem(`auth_session`, JSON.stringify({
      slug:       slug.value,
      churchName: churchName.value,
      userEmail:  userEmail.value,
    }))
  }

  const restore = () => {
    if (!import.meta.client) { return }
    const raw = localStorage.getItem(`auth_session`)
    if (raw === null) { return }
    try {
      const session = JSON.parse(raw) as AuthSession
      slug.value       = session.slug
      churchName.value = session.churchName
      userEmail.value  = session.userEmail
    } catch {
      localStorage.removeItem(`auth_session`)
    }
  }

  const login = async (email: string, password: string) => {
    loading.value = true
    error.value   = null
    try {
      const session = await $fetch<AuthSession>(`/api/auth/login`, {
        method: `POST`,
        body:   { email, password },
      })
      slug.value       = session.slug
      churchName.value = session.churchName
      userEmail.value  = session.userEmail
      persist()
    } catch (e) {
      error.value = apiError(e, `Login failed`)
    } finally {
      loading.value = false
    }
  }

  const register = async (tenantSlug: string, email: string, password: string) => {
    loading.value = true
    error.value   = null
    try {
      await $fetch(`/api/auth/register`, {
        method: `POST`,
        body:   { tenant_slug: tenantSlug, email, password },
      })
    } catch (e) {
      error.value = apiError(e, `Registration failed`)
    } finally {
      loading.value = false
    }
  }

  const clearSession = () => {
    slug.value       = null
    churchName.value = null
    userEmail.value  = null
    if (import.meta.client) {
      localStorage.removeItem(`auth_session`)
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      await $fetch(`/api/auth/logout`, { method: `POST` })
    } catch {
      // server error doesn't block local cleanup
    } finally {
      clearSession()
      loading.value = false
    }
  }

  return {
    slug,
    churchName,
    userEmail,
    isAuthenticated,
    loading,
    error,
    restore,
    login,
    register,
    logout,
    clearSession,
  }
})
