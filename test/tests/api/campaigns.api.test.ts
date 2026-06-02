import { test, expect } from '../../fixtures'
import { generateCampaignData } from '../../functions/common'
import { createCampaign, closeCampaign } from '../../functions/campaigns'
import type { Campaign } from '../../functions/campaigns'

test.describe('Campaigns API', () => {

    test.describe('Create', () => {

        test('valid campaign returns 201',
        { annotation: { type: 'ID', description: 'CAMP-001' } },
        async ({ campaignApi }) => {
            // Arrange
            const data = generateCampaignData()

            // Act
            const res = await campaignApi.create(data)

            // Assert
            expect(res.status()).toBe(201)
        })

        test('name shorter than 3 chars returns 400',
        { annotation: { type: 'ID', description: 'CAMP-002' } },
        async ({ campaignApi }) => {
            // Arrange
            const data = generateCampaignData({ name: 'AB' })

            // Act
            const res = await campaignApi.create(data)

            // Assert
            expect(res.status()).toBe(400)
        })

        test('goal of zero returns 400',
        { annotation: { type: 'ID', description: 'CAMP-003' } },
        async ({ campaignApi }) => {
            // Arrange
            const data = generateCampaignData({ goal_cents: 0 })

            // Act
            const res = await campaignApi.create(data)

            // Assert
            expect(res.status()).toBe(400)
        })

        test('past deadline returns 400',
        { annotation: { type: 'ID', description: 'CAMP-004' } },
        async ({ campaignApi }) => {
            // Arrange
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const data = generateCampaignData({
                deadline: yesterday.toISOString().split('T')[0],
            })

            // Act
            const res = await campaignApi.create(data)

            // Assert
            expect(res.status()).toBe(400)
        })

        test('unauthenticated request returns 401',
        { annotation: { type: 'ID', description: 'CAMP-009' } },
        async ({ unauthCampaignApi }) => {
            // Arrange
            const data = generateCampaignData()

            // Act
            const res = await unauthCampaignApi.create(data)

            // Assert
            expect(res.status()).toBe(401)
        })

    })

    test.describe('List', () => {

        test('created campaign appears with correct fields',
        { annotation: { type: 'ID', description: 'CAMP-005' } },
        async ({ campaignApi }) => {
            // Arrange
            const id = await createCampaign(campaignApi)

            // Act
            const res = await campaignApi.list()
            const campaigns: Campaign[] = await res.json()

            // Assert
            const found = campaigns.find(c => c.id === id)
            expect(found).toBeDefined()
            expect(found!.status).toBe('open')
            expect(found!.raisedCents).toBe(0)
        })

        test('unauthenticated request returns 401',
        { annotation: { type: 'ID', description: 'CAMP-008' } },
        async ({ unauthCampaignApi }) => {
            // Act
            const res = await unauthCampaignApi.list()

            // Assert
            expect(res.status()).toBe(401)
        })

    })

    test.describe('Close', () => {

        test('closing an open campaign returns 200',
        { annotation: { type: 'ID', description: 'CAMP-006' } },
        async ({ campaignApi }) => {
            // Arrange
            const id = await createCampaign(campaignApi)

            // Act
            const res = await campaignApi.close(id)

            // Assert
            expect(res.status()).toBe(200)
        })

        test('closing an already-closed campaign returns 422',
        { annotation: { type: 'ID', description: 'CAMP-007' } },
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

        test('unauthenticated request returns 401',
        { annotation: { type: 'ID', description: 'CAMP-010' } },
        async ({ unauthCampaignApi }) => {
            // Act — auth is checked before campaign lookup so any UUID works
            const res = await unauthCampaignApi.close('00000000-0000-0000-0000-000000000000')

            // Assert
            expect(res.status()).toBe(401)
        })

    })

})
