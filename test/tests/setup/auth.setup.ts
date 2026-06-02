import { test as setup, request } from '@playwright/test'
import 'dotenv/config'
import { registerAdmin } from '../../functions/auth'

const TENANT_A_STATE = 'test-results/.auth/tenant-a.json'

setup('register and authenticate tenant A admin', async ({ page }) => {
    // Register (idempotent — 422 if email already exists)
    await registerAdmin(
        process.env.TENANT_A_SLUG!,
        process.env.TENANT_A_ADMIN_EMAIL!,
        process.env.TENANT_A_ADMIN_PASSWORD!,
    )

    // Login via page.request so the HttpOnly cookie lands in the browser context
    const loginRes = await page.request.post(
        `${process.env.API_BASE_URL}/auth/login`,
        { data: {
            email:    process.env.TENANT_A_ADMIN_EMAIL,
            password: process.env.TENANT_A_ADMIN_PASSWORD,
        }},
    )

    if (!loginRes.ok()) {
        throw new Error(`Setup login failed: ${loginRes.status()} ${await loginRes.text()}`)
    }

    // Persist the browser context (includes the auth_token cookie) for UI tests
    await page.context().storageState({ path: TENANT_A_STATE })
})
