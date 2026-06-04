import { test, expect } from '../../fixtures'
import { tenantA, uniqueName, validGoal, futureDeadline } from '../../functions/common'

test.describe('New Campaign Page', () => {

    test('NEW-001 > New Campaign > creating a campaign shows success state',
    { annotation: { type: 'id', description: 'NEW-001' } },
    async ({ newCampaignPage }) => {
        // Arrange
        await newCampaignPage.visit(tenantA().slug)

        // Act
        await newCampaignPage.create(uniqueName(), validGoal(), futureDeadline())

        // Assert
        await expect(newCampaignPage.successBanner()).toBeVisible()
    })

    test('NEW-002 > New Campaign > created campaign appears in the dashboard table',
    { annotation: { type: 'id', description: 'NEW-002' } },
    async ({ newCampaignPage, dashboardPage }) => {
        // Arrange
        const name = uniqueName()
        await newCampaignPage.visit(tenantA().slug)
        await newCampaignPage.create(name, validGoal(), futureDeadline())

        // Act
        await dashboardPage.visit(tenantA().slug)

        // Assert
        await expect(dashboardPage.campaignRow(name)).toBeVisible()
    })

})
