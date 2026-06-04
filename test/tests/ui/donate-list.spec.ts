import { test, expect } from '../../fixtures'
import { tenantA, uniqueName } from '../../functions/common'
import { createCampaign, closeCampaign } from '../../helpers/campaigns'

test.describe('Donate List Page', () => {

    test('DL-001 > Donate List > open campaign appears in the public list',
    { annotation: { type: 'id', description: 'DL-001' } },
    async ({ campaignApi, donateListPage }) => {
        // Arrange
        const name = uniqueName()
        await createCampaign(campaignApi, { name })

        // Act
        await donateListPage.visit(tenantA().slug)

        // Assert
        await expect(donateListPage.campaignCard(name)).toBeVisible()
    })

    test('DL-002 > Donate List > closed campaign is not shown in the public list',
    { annotation: { type: 'id', description: 'DL-002' } },
    async ({ campaignApi, donateListPage }) => {
        // Arrange
        const name = uniqueName()
        const id = await createCampaign(campaignApi, { name })
        await closeCampaign(campaignApi, id)

        // Act
        await donateListPage.visit(tenantA().slug)

        // Assert
        await expect(donateListPage.campaignCard(name)).not.toBeVisible()
    })

    test('DL-003 > Donate List > search filters campaigns by name',
    { annotation: { type: 'id', description: 'DL-003' } },
    async ({ campaignApi, donateListPage }) => {
        // Arrange
        const name = uniqueName()
        await createCampaign(campaignApi, { name })
        await donateListPage.visit(tenantA().slug)

        // Act
        await donateListPage.search(name)

        // Assert
        await expect(donateListPage.campaignCard(name)).toBeVisible()
        const visibleNames = await donateListPage.campaignNames()
        expect(visibleNames.every(n => n.toLowerCase().includes(name.toLowerCase()))).toBe(true)
    })

    test('DL-004 > Donate List > clicking Donate on a campaign navigates to the donation form',
    { annotation: { type: 'id', description: 'DL-004' } },
    async ({ campaignApi, donateListPage }) => {
        // Arrange
        const name = uniqueName()
        await createCampaign(campaignApi, { name })
        await donateListPage.visit(tenantA().slug)

        // Act
        await donateListPage.clickDonate(name)

        // Assert
        await expect(donateListPage.page).toHaveURL(/\/donate\/[^/]+\/[^/]+$/)
    })

})
