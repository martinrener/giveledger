import { test as setup } from '@playwright/test'
import 'dotenv/config'
import { registerAdmin } from '../../helpers/auth'

const TENANT_A_STATE = 'test-results/.auth/tenant-a.json'
const TENANT_B_STATE = 'test-results/.auth/tenant-b.json'

setup('register and authenticate tenant A admin', async ({ page }) => {
    await registerAdmin(
        process.env.TENANT_A_SLUG!,
        process.env.TENANT_A_ADMIN_EMAIL!,
        process.env.TENANT_A_ADMIN_PASSWORD!,
    )

    const loginRes = await page.request.post(
        `${process.env.API_BASE_URL}/auth/login`,
        { data: {
            email:    process.env.TENANT_A_ADMIN_EMAIL,
            password: process.env.TENANT_A_ADMIN_PASSWORD,
        }},
    )
    if (!loginRes.ok()) {
        throw new Error(`Setup login failed (Tenant A): ${loginRes.status()} ${await loginRes.text()}`)
    }

    await page.context().storageState({ path: TENANT_A_STATE })
})

setup('register and authenticate tenant B admin', async ({ page }) => {
    await registerAdmin(
        process.env.TENANT_B_SLUG!,
        process.env.TENANT_B_ADMIN_EMAIL!,
        process.env.TENANT_B_ADMIN_PASSWORD!,
    )

    const loginRes = await page.request.post(
        `${process.env.API_BASE_URL}/auth/login`,
        { data: {
            email:    process.env.TENANT_B_ADMIN_EMAIL,
            password: process.env.TENANT_B_ADMIN_PASSWORD,
        }},
    )
    if (!loginRes.ok()) {
        throw new Error(`Setup login failed (Tenant B): ${loginRes.status()} ${await loginRes.text()}`)
    }

    await page.context().storageState({ path: TENANT_B_STATE })
})
