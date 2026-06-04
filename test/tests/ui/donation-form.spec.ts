import { test, expect } from '../../fixtures'
import { tenantA, uniqueName, validAmount } from '../../functions/common'
import { createCampaign } from '../../helpers/campaigns'

test.describe('Donation Form Page', () => {

    test('DF-001 > Donation Form > full donation flow completes and shows success message',
    { annotation: { type: 'id', description: 'DF-001' } },
    async ({ campaignApi, donationFormPage }) => {
        // Arrange
        const campaignId = await createCampaign(campaignApi)

        // Act
        await donationFormPage.visit(tenantA().slug, campaignId)
        await donationFormPage.donate(uniqueName(), validAmount())

        // Assert
        await expect(donationFormPage.donationSuccess()).toBeVisible()
    })

    test('DF-002 > Donation Form > back link returns to the campaign list',
    { annotation: { type: 'id', description: 'DF-002' } },
    async ({ campaignApi, donationFormPage }) => {
        // Arrange
        const campaignId = await createCampaign(campaignApi)
        await donationFormPage.visit(tenantA().slug, campaignId)

        // Act
        await donationFormPage.goBack()

        // Assert
        await expect(donationFormPage.page).toHaveURL(`/donate/${tenantA().slug}`)
    })

})
