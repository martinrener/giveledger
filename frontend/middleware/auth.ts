export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) { return }

  const auth = useAuthStore()
  auth.restore()

  if (!auth.isAuthenticated) {
    return navigateTo(`/admin`)
  }
})
