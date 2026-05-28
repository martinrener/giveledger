import type { Tenant } from '~/types/campaign'

export const useTenantsStore = defineStore(`tenants`, () => {
  const tenants = ref<Tenant[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchTenants = async () => {
    loading.value = true
    error.value = null
    try {
      tenants.value = await $fetch<Tenant[]>(`/api/tenants`)
    } catch (e) {
      error.value = e instanceof Error ? e.message : `Failed to load churches`
    } finally {
      loading.value = false
    }
  }

  return { tenants, loading, error, fetchTenants }
})
