import { test, expect } from '../../fixtures'
import { tenantA, tenantB } from '../../functions/common'

test.describe('Landing Page', () => {

    test('LAND-001 > Landing > shows all registered tenant cards',
    { annotation: { type: 'id', description: 'LAND-001' } },
    async ({ landingPage }) => {
        // Act
        await landingPage.visit()

        // Assert
        await expect(landingPage.tenantCard(tenantA().name)).toBeVisible()
        await expect(landingPage.tenantCard(tenantB().name)).toBeVisible()
    })

    test('LAND-002 > Landing > clicking a tenant card navigates to its campaign list',
    { annotation: { type: 'id', description: 'LAND-002' } },
    async ({ landingPage }) => {
        // Arrange
        await landingPage.visit()

        // Act
        await landingPage.selectTenant(tenantA().name)

        // Assert
        await expect(landingPage.page).toHaveURL(new RegExp(`/donate/${tenantA().slug}`))
    })

    test('LAND-003 > Landing > admin panel link navigates to login page',
    { annotation: { type: 'id', description: 'LAND-003' } },
    async ({ landingPage }) => {
        // Arrange
        await landingPage.visit()

        // Act
        await landingPage.goToAdminPanel()

        // Assert
        await expect(landingPage.page).toHaveURL('/admin')
    })

})
