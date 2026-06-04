import { test, expect } from '../../fixtures'
import { generateDonationData, nonExistentId, zeroAmount, negativeAmount, singleCharName, oversizedDonorName, emptyString, unknownCurrency } from '../../functions/common'
import { createCampaign } from '../../helpers/campaigns'
import { createDonation, donateToNewCampaign, recordDonationOnClosedCampaign } from '../../helpers/donations'

test.describe('Donations API', () => {

    test.describe('Record donation', () => {

        test('DON-001 > Donations > Record > donating to an open campaign returns 201',
        { annotation: { type: 'id', description: 'DON-001' } },
        async ({ campaignDonation }) => {
            // Act
            const res = await donateToNewCampaign(campaignDonation)

            // Assert
            expect(res.status()).toBe(201)
        })

        test('DON-002 > Donations > Record > donating to a closed campaign returns 422',
        { annotation: { type: 'id', description: 'DON-002' } },
        async ({ campaignDonation }) => {
            // Act
            const res = await recordDonationOnClosedCampaign(campaignDonation)

            // Assert
            expect(res.status()).toBe(422)
            const body = await res.json()
            expect(body.error).toContain('closed')
        })

        test('DON-003 > Donations > Record > amount of zero returns 400',
        { annotation: { type: 'id', description: 'DON-003' } },
        async ({ campaignDonation }) => {
            // Act
            const res = await donateToNewCampaign(campaignDonation, { amount_cents: zeroAmount() })

            // Assert
            expect(res.status()).toBe(400)
        })

        test('DON-004 > Donations > Record > negative amount returns 400',
        { annotation: { type: 'id', description: 'DON-004' } },
        async ({ campaignDonation }) => {
            // Act
            const res = await donateToNewCampaign(campaignDonation, { amount_cents: negativeAmount() })

            // Assert
            expect(res.status()).toBe(400)
        })

        test('DON-005 > Donations > Record > empty donor name returns 400',
        { annotation: { type: 'id', description: 'DON-005' } },
        async ({ campaignDonation }) => {
            // Act
            const res = await donateToNewCampaign(campaignDonation, { donor_name: emptyString() })

            // Assert
            expect(res.status()).toBe(400)
        })

        test('DON-006 > Donations > Record > donor name of 1 char returns 400',
        { annotation: { type: 'id', description: 'DON-006' } },
        async ({ campaignDonation }) => {
            // Arrange — minimum donor name is 2 chars
            // Act
            const res = await donateToNewCampaign(campaignDonation, { donor_name: singleCharName() })

            // Assert
            expect(res.status()).toBe(400)
        })

        test('DON-007 > Donations > Record > unknown currency returns 400',
        { annotation: { type: 'id', description: 'DON-007' } },
        async ({ campaignDonation }) => {
            // Act
            const res = await donateToNewCampaign(campaignDonation, { currency: unknownCurrency() })

            // Assert
            expect(res.status()).toBe(400)
        })

        test('DON-010 > Donations > Record > donor name longer than 80 chars returns 400',
        { annotation: { type: 'id', description: 'DON-010' } },
        async ({ campaignDonation }) => {
            // Arrange — donor name max is 80 chars
            // Act
            const res = await donateToNewCampaign(campaignDonation, { donor_name: oversizedDonorName() })

            // Assert
            expect(res.status()).toBe(400)
        })

        test('DON-008 > Donations > Record > non-existent campaign ID returns 422',
        { annotation: { type: 'id', description: 'DON-008' } },
        async ({ campaignDonation: { donation } }) => {
            // Act — CampaignNotFoundException extends DomainException → 422
            const res = await donation.record(nonExistentId(), generateDonationData())

            // Assert
            expect(res.status()).toBe(422)
        })

    })

    test.describe('createDonation helper', () => {

        test('DON-009 > Donations > Helper > createDonation records without throwing',
        { annotation: { type: 'id', description: 'DON-009' } },
        async ({ campaignDonation: { campaign, donation } }) => {
            // Arrange
            const id = await createCampaign(campaign)

            // Act + Assert — throws if status !== 201
            await createDonation(donation, id)
        })

    })

})
