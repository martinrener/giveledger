import { test as setup } from '@playwright/test'
import 'dotenv/config'
import { registerAdmin } from '../../helpers/auth'

const TENANT_A_STATE        = 'test-results/.auth/tenant-a.json'
const TENANT_A_LOGOUT_STATE = 'test-results/.auth/tenant-a-logout.json'

// Full browser login so the Vue app runs, populates the Pinia store and persists
// session data to localStorage — required for the auth middleware on admin pages.
setup('register and authenticate tenant A admin', async ({ page, browser }) => {
    await registerAdmin(
        process.env.TENANT_A_SLUG!,
        process.env.TENANT_A_ADMIN_EMAIL!,
        process.env.TENANT_A_ADMIN_PASSWORD!,
    )

    await page.goto('/admin')
    await page.getByLabel('Email address').fill(process.env.TENANT_A_ADMIN_EMAIL!)
    await page.getByLabel('Password').fill(process.env.TENANT_A_ADMIN_PASSWORD!)
    await page.getByRole('button', { name: 'Log in' }).click()
    await page.waitForURL(/dashboard/)

    // Captures both the HttpOnly auth_token cookie and Pinia localStorage state
    await page.context().storageState({ path: TENANT_A_STATE })

    // Separate session for the logout test — prevents DASH-005 from invalidating
    // the shared auth_token and breaking other tests that run in parallel.
    const ctx = await browser.newContext({ baseURL: process.env.BASE_URL })
    const logoutPage = await ctx.newPage()
    await logoutPage.goto('/admin')
    await logoutPage.getByLabel('Email address').fill(process.env.TENANT_A_ADMIN_EMAIL!)
    await logoutPage.getByLabel('Password').fill(process.env.TENANT_A_ADMIN_PASSWORD!)
    await logoutPage.getByRole('button', { name: 'Log in' }).click()
    await logoutPage.waitForURL(/dashboard/)
    await ctx.storageState({ path: TENANT_A_LOGOUT_STATE })
    await ctx.close()
})

// Tenant B only needs API auth (used by BaseAPI.init() in isolation tests)
setup('register tenant B admin', async () => {
    await registerAdmin(
        process.env.TENANT_B_SLUG!,
        process.env.TENANT_B_ADMIN_EMAIL!,
        process.env.TENANT_B_ADMIN_PASSWORD!,
    )
})
