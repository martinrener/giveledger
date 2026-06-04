import { request } from '@playwright/test'
import type { AuthApi } from '../api-objects/AuthApi'
import { tenantA } from '../functions/common'

const base = (): string => (process.env.API_BASE_URL ?? 'http://localhost/api').replace(/\/$/, '')

export const loginAsTenantA = (api: AuthApi) =>
    api.login(tenantA().email, tenantA().password)

export const registerAdmin = async (
    tenantSlug: string,
    email:      string,
    password:   string,
): Promise<void> => {
    const ctx = await request.newContext()

    const res = await ctx.post(`${base()}/auth/register`, {
        data: { tenant_slug: tenantSlug, email, password },
    })

    const status = res.status()
    const body   = status !== 201 && status !== 422 ? await res.text() : ''
    await ctx.dispose()

    // 201 = created, 422 = email already registered — both are fine
    if (status !== 201 && status !== 422) {
        throw new Error(`registerAdmin failed for ${email}: ${status} ${body}`)
    }
}
