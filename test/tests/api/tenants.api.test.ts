import { test, expect } from '../../fixtures'
import { tenantA, tenantB } from '../../functions/common'
import { getTenantSlugs } from '../../helpers/tenants'

test.describe('Tenants API', () => {

    test('TEN-001 > Tenants > list returns all tenants with expected slugs',
    { annotation: { type: 'id', description: 'TEN-001' } },
    async ({ tenantApi }) => {
        // Act
        const slugs = await getTenantSlugs(tenantApi)

        // Assert
        expect(slugs).toContain(tenantA().slug)
        expect(slugs).toContain(tenantB().slug)
    })

})
