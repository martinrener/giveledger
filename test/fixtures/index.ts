import { test as base } from '@playwright/test'
import type { Page } from '@playwright/test'
import { BasePage } from './BasePage'
import { BaseAPI } from './BaseAPI'
import { CampaignApi } from '../api-objects/CampaignApi'

export type CustomPage = BasePage & Page

interface MyFixtures {
    customPage:        CustomPage
    apiContext:        BaseAPI
    tenantBContext:    BaseAPI
    campaignApi:       CampaignApi
    unauthCampaignApi: CampaignApi
}

export const test = base.extend<MyFixtures>({
    customPage: async ({ page }, use) => {
        const bp = new BasePage(page)
        await use(bp as CustomPage)
        await bp.dispose()
    },

    apiContext: async ({}, use) => {
        const api = new BaseAPI()
        await api.init(
            process.env.TENANT_A_ADMIN_EMAIL!,
            process.env.TENANT_A_ADMIN_PASSWORD!,
        )
        await use(api)
        await api.dispose()
    },

    tenantBContext: async ({}, use) => {
        const api = new BaseAPI()
        await api.init(
            process.env.TENANT_B_ADMIN_EMAIL!,
            process.env.TENANT_B_ADMIN_PASSWORD!,
        )
        await use(api)
        await api.dispose()
    },

    campaignApi: async ({}, use) => {
        const api = new BaseAPI()
        await api.init(
            process.env.TENANT_A_ADMIN_EMAIL!,
            process.env.TENANT_A_ADMIN_PASSWORD!,
        )
        await use(new CampaignApi(api))
        await api.dispose()
    },

    unauthCampaignApi: async ({}, use) => {
        const api = new BaseAPI()
        await api.initUnauthenticated(process.env.TENANT_A_SLUG!)
        await use(new CampaignApi(api))
        await api.dispose()
    },
})

export { expect } from '@playwright/test'
