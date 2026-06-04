import { test, expect } from '../../fixtures'
import { tenantA, uniqueName } from '../../functions/common'
import { createCampaign } from '../../helpers/campaigns'
import { createDonation } from '../../helpers/donations'

test.describe('Donor List Page', () => {

    test('DONOR-001 > Donors > page shows recorded donations for the campaign',
    { annotation: { type: 'id', description: 'DONOR-001' } },
    async ({ campaignApi, donationApi, donorListPage }) => {
        // Arrange
        const campaignId = await createCampaign(campaignApi)
        const donorName  = uniqueName()
        await createDonation(donationApi, campaignId, { donor_name: donorName })

        // Act
        await donorListPage.visit(tenantA().slug, campaignId)

        // Assert
        await expect(donorListPage.donorRow(donorName)).toBeVisible()
    })

    test('DONOR-002 > Donors > Back to Dashboard link returns to the dashboard',
    { annotation: { type: 'id', description: 'DONOR-002' } },
    async ({ campaignApi, donorListPage }) => {
        // Arrange
        const campaignId = await createCampaign(campaignApi)
        await donorListPage.visit(tenantA().slug, campaignId)

        // Act
        await donorListPage.backToDashboard()

        // Assert
        await expect(donorListPage.page).toHaveURL(/dashboard/)
    })

})
