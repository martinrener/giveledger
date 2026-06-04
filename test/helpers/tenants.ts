import type { TenantApi } from '../api-objects/TenantApi'

export interface Tenant {
    id:   string
    slug: string
    name: string
}

export const getTenants = async (api: TenantApi): Promise<Tenant[]> => {
    const res = await api.list()
    if (!res.ok()) {
        throw new Error(`getTenants failed: ${res.status()}`)
    }
    return res.json()
}

export const getTenantSlugs = async (api: TenantApi): Promise<string[]> => {
    const tenants = await getTenants(api)
    return tenants.map(t => t.slug)
}
