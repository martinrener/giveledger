import { BasePage } from '../fixtures/BasePage'

export class LandingPage extends BasePage {
    static readonly URL = '/'

    async visit() {
        await this.goto(LandingPage.URL)
    }

    async selectTenant(tenantName: string) {
        const card = this.locator('div').filter({
            has: this.locator('h3', { hasText: tenantName }),
        })
        await card.getByRole('link', { name: 'View Campaigns' }).click()
        await this.waitForURL(/\/donate\//)
    }

    async goToAdminPanel() {
        await this.getByRole('link', { name: 'Go to Admin Panel →' }).click()
        await this.waitForURL('/admin')
    }

    tenantNames() {
        return this.locator('h3').allTextContents()
    }
}
