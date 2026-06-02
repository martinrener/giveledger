import { request } from '@playwright/test'

/**
 * Registers an admin user for the given tenant slug.
 * Idempotent: 422 (email already registered) is treated as success.
 */
export const registerAdmin = async (
    tenantSlug: string,
    email:      string,
    password:   string,
): Promise<void> => {
    const ctx = await request.newContext({ baseURL: process.env.API_BASE_URL })

    const res = await ctx.post('/auth/register', {
        data: { tenant_slug: tenantSlug, email, password },
    })

    await ctx.dispose()

    if (res.status() !== 201 && res.status() !== 422) {
        throw new Error(`registerAdmin failed for ${email}: ${res.status()} ${await res.text()}`)
    }
}
