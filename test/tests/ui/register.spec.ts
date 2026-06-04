import { test, expect } from '../../fixtures'
import { tenantA, anyEmail, anyPassword } from '../../functions/common'

test.describe('Register Page', () => {

    test('REG-001 > Register > successful registration shows success banner',
    { annotation: { type: 'id', description: 'REG-001' } },
    async ({ registerPage }) => {
        // Arrange
        await registerPage.visit()

        // Act — fresh random email so the account doesn't exist yet
        await registerPage.register(tenantA().name, anyEmail(), anyPassword())

        // Assert
        await expect(registerPage.successBanner()).toBeVisible()
    })

    test('REG-002 > Register > already-registered email shows an error',
    { annotation: { type: 'id', description: 'REG-002' } },
    async ({ registerPage }) => {
        // Arrange — tenantA admin was registered during setup
        await registerPage.visit()

        // Act
        await registerPage.register(tenantA().name, tenantA().email, anyPassword())

        // Assert
        await expect(registerPage.errorMessage()).toBeVisible()
    })

    test('REG-003 > Register > login link navigates to login page',
    { annotation: { type: 'id', description: 'REG-003' } },
    async ({ registerPage }) => {
        // Arrange
        await registerPage.visit()

        // Act
        await registerPage.goToLogin()

        // Assert
        await expect(registerPage.page).toHaveURL('/admin')
    })

})
