import { test, expect } from '../../fixtures'
import { generateCampaignData, yesterday, today, uniqueName, oversizedName, nonExistentId, tooShortName, unknownCurrency, zeroAmount, validAmount, largeGoal } from '../../functions/common'
import { createCampaign, closeCampaign, getCampaigns } from '../../helpers/campaigns'
import { createDonation } from '../../helpers/donations'

test.describe('Campaigns API', () => {

    test.describe('Create', () => {

        test('CAMP-001 > Campaigns > Create > valid campaign returns 201',
        { annotation: { type: 'id', description: 'CAMP-001' } },
        async ({ campaignApi }) => {
            // Arrange
            const data = generateCampaignData()

            // Act
            const res = await campaignApi.create(data)

            // Assert
            expect(res.status()).toBe(201)
        })

        test('CAMP-002 > Campaigns > Create > name shorter than 3 chars returns 400',
        { annotation: { type: 'id', description: 'CAMP-002' } },
        async ({ campaignApi }) => {
            // Arrange
            const data = generateCampaignData({ name: tooShortName() })

            // Act
            const res = await campaignApi.create(data)

            // Assert
            expect(res.status()).toBe(400)
        })

        test('CAMP-003 > Campaigns > Create > goal of zero returns 400',
        { annotation: { type: 'id', description: 'CAMP-003' } },
        async ({ campaignApi }) => {
            // Arrange
            const data = generateCampaignData({ goal_cents: zeroAmount() })

            // Act
            const res = await campaignApi.create(data)

            // Assert
            expect(res.status()).toBe(400)
        })

        test('CAMP-004 > Campaigns > Create > past deadline returns 400',
        { annotation: { type: 'id', description: 'CAMP-004' } },
        async ({ campaignApi }) => {
            // Arrange
            const data = generateCampaignData({ deadline: yesterday() })

            // Act
            const res = await campaignApi.create(data)

            // Assert
            expect(res.status()).toBe(400)
        })

        test('CAMP-009 > Campaigns > Create > unauthenticated request returns 401',
        { annotation: { type: 'id', description: 'CAMP-009' } },
        async ({ unauthCampaignApi }) => {
            // Arrange
            const data = generateCampaignData()

            // Act
            const res = await unauthCampaignApi.create(data)

            // Assert
            expect(res.status()).toBe(401)
        })

        test('CAMP-011 > Campaigns > Create > duplicate open name returns 422',
        { annotation: { type: 'id', description: 'CAMP-011' } },
        async ({ campaignApi }) => {
            // Arrange — create first, then attempt same name again
            const name = uniqueName()
            await createCampaign(campaignApi, { name })

            // Act
            const res = await campaignApi.create(generateCampaignData({ name }))

            // Assert
            expect(res.status()).toBe(422)
        })

        test('CAMP-012 > Campaigns > Create > name longer than 100 chars returns 400',
        { annotation: { type: 'id', description: 'CAMP-012' } },
        async ({ campaignApi }) => {
            // Arrange
            const data = generateCampaignData({ name: oversizedName() })

            // Act
            const res = await campaignApi.create(data)

            // Assert
            expect(res.status()).toBe(400)
        })

        test('CAMP-013 > Campaigns > Create > unknown currency returns 400',
        { annotation: { type: 'id', description: 'CAMP-013' } },
        async ({ campaignApi }) => {
            // Arrange
            const data = generateCampaignData({ currency: unknownCurrency() })

            // Act
            const res = await campaignApi.create(data)

            // Assert
            expect(res.status()).toBe(400)
        })

        test('CAMP-014 > Campaigns > Create > deadline of today returns 400',
        { annotation: { type: 'id', description: 'CAMP-014' } },
        async ({ campaignApi }) => {
            // Arrange — deadline must be at least tomorrow
            const data = generateCampaignData({ deadline: today() })

            // Act
            const res = await campaignApi.create(data)

            // Assert
            expect(res.status()).toBe(400)
        })

    })

    test.describe('List', () => {

        test('CAMP-005 > Campaigns > List > created campaign appears with correct fields',
        { annotation: { type: 'id', description: 'CAMP-005' } },
        async ({ campaignApi }) => {
            // Arrange
            const id = await createCampaign(campaignApi)

            // Act
            const campaigns = await getCampaigns(campaignApi)

            // Assert
            const found = campaigns.find(c => c.id === id)
            expect(found).toBeDefined()
            expect(found!.status).toBe('open')
            expect(found!.raisedCents).toBe(0)
        })

        test('CAMP-008 > Campaigns > List > unauthenticated request returns 401',
        { annotation: { type: 'id', description: 'CAMP-008' } },
        async ({ unauthCampaignApi }) => {
            // Act
            const res = await unauthCampaignApi.list()

            // Assert
            expect(res.status()).toBe(401)
        })

        test('CAMP-015 > Campaigns > List > raisedCents updates after donations',
        { annotation: { type: 'id', description: 'CAMP-015' } },
        async ({ campaignDonation }) => {
            // Arrange
            const { campaign, donation } = campaignDonation
            const amount1 = validAmount()
            const amount2 = validAmount()
            const id = await createCampaign(campaign, { goal_cents: largeGoal() })
            await createDonation(donation, id, { amount_cents: amount1 })
            await createDonation(donation, id, { amount_cents: amount2 })

            // Act
            const campaigns = await getCampaigns(campaign)

            // Assert
            const found = campaigns.find(c => c.id === id)
            expect(found!.raisedCents).toBe(amount1 + amount2)
        })

        test('CAMP-016 > Campaigns > List > campaign auto-closes when goal is reached',
        { annotation: { type: 'id', description: 'CAMP-016' } },
        async ({ campaignDonation }) => {
            // Arrange — donate exactly the goal to trigger auto-close
            const { campaign, donation } = campaignDonation
            const goal = validAmount()
            const id = await createCampaign(campaign, { goal_cents: goal })
            await createDonation(donation, id, { amount_cents: goal })

            // Act — listing triggers autoClose on the backend
            const campaigns = await getCampaigns(campaign)

            // Assert
            const found = campaigns.find(c => c.id === id)
            expect(found!.status).toBe('closed')
        })

    })

    test.describe('Close', () => {

        test('CAMP-006 > Campaigns > Close > closing an open campaign returns 200',
        { annotation: { type: 'id', description: 'CAMP-006' } },
        async ({ campaignApi }) => {
            // Arrange
            const id = await createCampaign(campaignApi)

            // Act
            const res = await campaignApi.close(id)

            // Assert
            expect(res.status()).toBe(200)
        })

        test('CAMP-007 > Campaigns > Close > closing an already-closed campaign returns 422',
        { annotation: { type: 'id', description: 'CAMP-007' } },
        async ({ campaignApi }) => {
            // Arrange
            const id = await createCampaign(campaignApi)
            await closeCampaign(campaignApi, id)

            // Act
            const res = await campaignApi.close(id)

            // Assert
            expect(res.status()).toBe(422)
            const body = await res.json()
            expect(body.error).toContain('closed')
        })

        test('CAMP-010 > Campaigns > Close > unauthenticated request returns 401',
        { annotation: { type: 'id', description: 'CAMP-010' } },
        async ({ unauthCampaignApi }) => {
            // Act — auth is checked before campaign lookup so any UUID works
            const res = await unauthCampaignApi.close(nonExistentId())

            // Assert
            expect(res.status()).toBe(401)
        })

    })

    test.describe('Isolation', () => {

        test('TENT-001 > Isolation > Tenant B cannot list Tenant A campaigns',
        { annotation: { type: 'id', description: 'TENT-001' } },
        async ({ isolation }) => {
            // Arrange
            await createCampaign(isolation.tenantA)

            // Act — Tenant B token attempts to read Tenant A admin route
            const res = await isolation.tenantB.listAs(isolation.tenantA.slug)

            // Assert
            expect(res.status()).toBe(403)
        })

        test('TENT-002 > Isolation > Tenant B cannot create a campaign in Tenant A',
        { annotation: { type: 'id', description: 'TENT-002' } },
        async ({ isolation }) => {
            // Act — Tenant B token attempts to create in Tenant A
            const res = await isolation.tenantB.createAs(isolation.tenantA.slug, generateCampaignData())

            // Assert
            expect(res.status()).toBe(403)
        })

        test('TENT-003 > Isolation > Tenant B cannot close a Tenant A campaign',
        { annotation: { type: 'id', description: 'TENT-003' } },
        async ({ isolation }) => {
            // Arrange
            const campaignId = await createCampaign(isolation.tenantA)

            // Act — Tenant B token attempts to close it
            const res = await isolation.tenantB.closeAs(isolation.tenantA.slug, campaignId)

            // Assert
            expect(res.status()).toBe(403)
        })

        test('TENT-004 > Isolation > no auth cookie on admin route returns 401',
        { annotation: { type: 'id', description: 'TENT-004' } },
        async ({ unauthCampaignApi }) => {
            // Act
            const res = await unauthCampaignApi.list()

            // Assert
            expect(res.status()).toBe(401)
        })

    })

})
