import { test, expect } from '../../fixtures'
import { tenantA, uniqueName } from '../../functions/common'
import { createCampaign } from '../../helpers/campaigns'

test.describe('Dashboard Page', () => {

    test('DASH-001 > Dashboard > campaign table shows existing campaigns',
    { annotation: { type: 'id', description: 'DASH-001' } },
    async ({ campaignApi, dashboardPage }) => {
        // Arrange
        const name = uniqueName()
        await createCampaign(campaignApi, { name })

        // Act
        await dashboardPage.visit(tenantA().slug)

        // Assert
        await expect(dashboardPage.campaignRow(name)).toBeVisible()
    })

    test('DASH-002 > Dashboard > New Campaign button navigates to create page',
    { annotation: { type: 'id', description: 'DASH-002' } },
    async ({ dashboardPage }) => {
        // Arrange
        await dashboardPage.visit(tenantA().slug)

        // Act
        await dashboardPage.goToNewCampaign()

        // Assert
        await expect(dashboardPage.page).toHaveURL(/campaigns\/new/)
    })

    test('DASH-003 > Dashboard > closing a campaign updates its status to Closed',
    { annotation: { type: 'id', description: 'DASH-003' } },
    async ({ campaignApi, dashboardPage }) => {
        // Arrange
        const name = uniqueName()
        await createCampaign(campaignApi, { name })
        await dashboardPage.visit(tenantA().slug)

        // Act
        await dashboardPage.closeCampaign(name)

        // Assert
        const status = await dashboardPage.getCampaignStatus(name)
        expect(status?.trim()).toBe('Closed')
    })

    test('DASH-004 > Dashboard > clicking a campaign row navigates to its donors page',
    { annotation: { type: 'id', description: 'DASH-004' } },
    async ({ campaignApi, dashboardPage }) => {
        // Arrange
        const name = uniqueName()
        await createCampaign(campaignApi, { name })
        await dashboardPage.visit(tenantA().slug)

        // Act
        await dashboardPage.clickDonors(name)

        // Assert
        await expect(dashboardPage.page).toHaveURL(/donors/)
    })

})

// Isolated describe so the logout test uses its own token and doesn't invalidate
// the shared auth state that other parallel tests depend on.
test.describe('Dashboard Page – logout', () => {
    test.use({ storageState: 'test-results/.auth/tenant-a-logout.json' })

    test('DASH-005 > Dashboard > logout navigates to the login page',
    { annotation: { type: 'id', description: 'DASH-005' } },
    async ({ dashboardPage }) => {
        // Arrange
        await dashboardPage.visit(tenantA().slug)

        // Act
        await dashboardPage.logout()

        // Assert
        await expect(dashboardPage.page).toHaveURL('/admin')
    })

})
