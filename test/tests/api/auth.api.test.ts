import { test, expect } from '../../fixtures'
import { tenantA, incorrectPassword, nonExistentEmail, anyPassword, nonExistentSlug, anyEmail } from '../../functions/common'
import { loginAsTenantA } from '../../helpers/auth'

test.describe('Auth API', () => {

    test.describe('Login', () => {

        test('AUTH-001 > Auth > Login > valid credentials return 200 with slug and email',
        { annotation: { type: 'id', description: 'AUTH-001' } },
        async ({ authApi }) => {
            // Act
            const res = await loginAsTenantA(authApi)

            // Assert
            expect(res.status()).toBe(200)
            const body = await res.json()
            expect(body.slug).toBe(tenantA().slug)
            expect(body.userEmail).toBe(tenantA().email)
        })

        test('AUTH-002 > Auth > Login > wrong password returns 422',
        { annotation: { type: 'id', description: 'AUTH-002' } },
        async ({ authApi }) => {
            // Act
            const res = await authApi.login(tenantA().email, incorrectPassword())

            // Assert
            expect(res.status()).toBe(422)
        })

        test('AUTH-003 > Auth > Login > non-existent email returns 422',
        { annotation: { type: 'id', description: 'AUTH-003' } },
        async ({ authApi }) => {
            // Act
            const res = await authApi.login(nonExistentEmail(), anyPassword())

            // Assert
            expect(res.status()).toBe(422)
        })

    })

    test.describe('Logout', () => {

        test('AUTH-004 > Auth > Logout > returns 200 and clears session',
        { annotation: { type: 'id', description: 'AUTH-004' } },
        async ({ authApi }) => {
            // Arrange
            await loginAsTenantA(authApi)

            // Act
            const res = await authApi.logout()

            // Assert
            expect(res.status()).toBe(200)
        })

    })

    test.describe('Register', () => {

        test('AUTH-005 > Auth > Register > non-existent tenant slug returns 422',
        { annotation: { type: 'id', description: 'AUTH-005' } },
        async ({ authApi }) => {
            // Act
            const res = await authApi.register(nonExistentSlug(), anyEmail(), anyPassword())

            // Assert
            expect(res.status()).toBe(422)
        })

        test('AUTH-006 > Auth > Register > already-registered email returns 422',
        { annotation: { type: 'id', description: 'AUTH-006' } },
        async ({ authApi }) => {
            // Arrange — tenantA admin is registered during setup
            // Act
            const res = await authApi.register(tenantA().slug, tenantA().email, anyPassword())

            // Assert
            expect(res.status()).toBe(422)
        })

    })

})
