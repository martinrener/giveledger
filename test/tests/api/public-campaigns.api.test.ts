import { test, expect } from '../../fixtures'
import { validAmount, largeGoal, nonExistentSlug } from '../../functions/common'
import { createCampaign, closeCampaign, getPublicCampaigns } from '../../helpers/campaigns'
import { createDonation } from '../../helpers/donations'
import type { Campaign } from '../../helpers/campaigns'

test.describe('Public Campaigns API', () => {

    test.describe('List', () => {

        test('PUB-001 > Public Campaigns > List > open campaign appears in public list',
        { annotation: { type: 'id', description: 'PUB-001' } },
        async ({ campaignApi, publicCampaignApi }) => {
            // Arrange
            const id = await createCampaign(campaignApi)

            // Act
            const campaigns = await getPublicCampaigns(publicCampaignApi)

            // Assert
            expect(campaigns.some((c: Campaign) => c.id === id)).toBe(true)
        })

        test('PUB-002 > Public Campaigns > List > closed campaign is excluded from public list',
        { annotation: { type: 'id', description: 'PUB-002' } },
        async ({ campaignApi, publicCampaignApi }) => {
            // Arrange
            const id = await createCampaign(campaignApi)
            await closeCampaign(campaignApi, id)

            // Act
            const campaigns = await getPublicCampaigns(publicCampaignApi)

            // Assert
            expect(campaigns.some((c: Campaign) => c.id === id)).toBe(false)
        })

        test('PUB-003 > Public Campaigns > List > unknown tenant slug returns 404',
        { annotation: { type: 'id', description: 'PUB-003' } },
        async ({ publicCampaignApi }) => {
            // Act
            const res = await publicCampaignApi.listBySlug(nonExistentSlug())

            // Assert
            expect(res.status()).toBe(404)
        })

        test('PUB-004 > Public Campaigns > List > raisedCents reflects recorded donations',
        { annotation: { type: 'id', description: 'PUB-004' } },
        async ({ campaignDonation, publicCampaignApi }) => {
            // Arrange
            const { campaign, donation } = campaignDonation
            const amount = validAmount()
            const id = await createCampaign(campaign, { goal_cents: largeGoal() })
            await createDonation(donation, id, { amount_cents: amount })

            // Act
            const campaigns = await getPublicCampaigns(publicCampaignApi)

            // Assert
            const found = campaigns.find((c: Campaign) => c.id === id)
            expect(found?.raisedCents).toBe(amount)
        })

    })

})
