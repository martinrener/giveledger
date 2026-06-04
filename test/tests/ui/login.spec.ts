import { test, expect } from '../../fixtures'
import { tenantA, incorrectPassword } from '../../functions/common'

test.describe('Login Page', () => {

    test('LOGIN-001 > Login > valid credentials redirect to dashboard',
    { annotation: { type: 'id', description: 'LOGIN-001' } },
    async ({ loginPage }) => {
        // Arrange
        await loginPage.visit()

        // Act
        await loginPage.login(tenantA().email, tenantA().password)

        // Assert
        await expect(loginPage.page).toHaveURL(/dashboard/)
    })

    test('LOGIN-002 > Login > wrong password shows error message',
    { annotation: { type: 'id', description: 'LOGIN-002' } },
    async ({ loginPage }) => {
        // Arrange
        await loginPage.visit()

        // Act
        await loginPage.loginExpectError(tenantA().email, incorrectPassword())

        // Assert
        await expect(loginPage.errorMessage()).toBeVisible()
    })

    test('LOGIN-003 > Login > register link navigates to register page',
    { annotation: { type: 'id', description: 'LOGIN-003' } },
    async ({ loginPage }) => {
        // Arrange
        await loginPage.visit()

        // Act
        await loginPage.goToRegister()

        // Assert
        await expect(loginPage.page).toHaveURL('/admin/register')
    })

})
