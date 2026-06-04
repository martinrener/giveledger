import { test as base } from '@playwright/test'
import type { Page } from '@playwright/test'
import { BasePage } from './BasePage'
import { BaseAPI } from './BaseAPI'
import { CampaignApi } from '../api-objects/CampaignApi'
import { DonationApi } from '../api-objects/DonationApi'
import { AuthApi } from '../api-objects/AuthApi'
import { TenantApi } from '../api-objects/TenantApi'
import { PublicCampaignApi } from '../api-objects/PublicCampaignApi'
import { LandingPage } from '../page-objects/LandingPage'
import { DonateListPage } from '../page-objects/DonateListPage'
import { DonationFormPage } from '../page-objects/DonationFormPage'
import { LoginPage } from '../page-objects/LoginPage'
import { RegisterPage } from '../page-objects/RegisterPage'
import { DashboardPage } from '../page-objects/DashboardPage'
import { NewCampaignPage } from '../page-objects/NewCampaignPage'
import { DonorListPage } from '../page-objects/DonorListPage'
import { tenantA, tenantB } from '../functions/common'

export type CustomPage = BasePage & Page

export interface IsolationContext {
    tenantA: CampaignApi
    tenantB: CampaignApi
}

export interface CampaignDonationContext {
    campaign: CampaignApi
    donation: DonationApi
}

interface MyFixtures {
    // API fixtures
    campaignApi:         CampaignApi
    donationApi:         DonationApi
    authApi:             AuthApi
    tenantApi:           TenantApi
    publicCampaignApi:   PublicCampaignApi
    unauthCampaignApi:   CampaignApi
    isolation:           IsolationContext
    campaignDonation:    CampaignDonationContext

    // Page fixtures
    landingPage:         LandingPage
    donateListPage:      DonateListPage
    donationFormPage:    DonationFormPage
    loginPage:           LoginPage
    registerPage:        RegisterPage
    dashboardPage:       DashboardPage
    newCampaignPage:     NewCampaignPage
    donorListPage:       DonorListPage
}

export const test = base.extend<MyFixtures>({
    // --- API fixtures ---

    campaignApi: async ({}, use) => {
        const api = new BaseAPI()
        await api.init(tenantA().email, tenantA().password)
        await use(new CampaignApi(api))
        await api.dispose()
    },

    donationApi: async ({}, use) => {
        const api = new BaseAPI()
        await api.init(tenantA().email, tenantA().password)
        await use(new DonationApi(api))
        await api.dispose()
    },

    authApi: async ({}, use) => {
        const api = new BaseAPI()
        await api.initUnauthenticated('')
        await use(new AuthApi(api))
        await api.dispose()
    },

    tenantApi: async ({}, use) => {
        const api = new BaseAPI()
        await api.initUnauthenticated('')
        await use(new TenantApi(api))
        await api.dispose()
    },

    publicCampaignApi: async ({}, use) => {
        const api = new BaseAPI()
        await api.initUnauthenticated(tenantA().slug)
        await use(new PublicCampaignApi(api))
        await api.dispose()
    },

    unauthCampaignApi: async ({}, use) => {
        const api = new BaseAPI()
        await api.initUnauthenticated(tenantA().slug)
        await use(new CampaignApi(api))
        await api.dispose()
    },

    campaignDonation: async ({}, use) => {
        const api = new BaseAPI()
        await api.init(tenantA().email, tenantA().password)
        await use({
            campaign: new CampaignApi(api),
            donation: new DonationApi(api),
        })
        await api.dispose()
    },

    isolation: async ({}, use) => {
        const apiA = new BaseAPI()
        await apiA.init(tenantA().email, tenantA().password)
        const apiB = new BaseAPI()
        await apiB.init(tenantB().email, tenantB().password)
        await use({
            tenantA: new CampaignApi(apiA),
            tenantB: new CampaignApi(apiB),
        })
        await Promise.all([apiA.dispose(), apiB.dispose()])
    },

    // --- Page fixtures ---

    landingPage: async ({ page }, use) => {
        await use(new LandingPage(page))
    },

    donateListPage: async ({ page }, use) => {
        await use(new DonateListPage(page))
    },

    donationFormPage: async ({ page }, use) => {
        await use(new DonationFormPage(page))
    },

    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page))
    },

    registerPage: async ({ page }, use) => {
        await use(new RegisterPage(page))
    },

    dashboardPage: async ({ page }, use) => {
        await use(new DashboardPage(page))
    },

    newCampaignPage: async ({ page }, use) => {
        await use(new NewCampaignPage(page))
    },

    donorListPage: async ({ page }, use) => {
        await use(new DonorListPage(page))
    },
})

export { expect } from '@playwright/test'
