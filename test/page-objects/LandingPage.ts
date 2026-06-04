import { BasePage } from '../fixtures/BasePage'

export class LandingPage extends BasePage {
    static readonly URL = '/'

    async visit() {
        await this.goto(LandingPage.URL)
        await this.getByRole('heading', { level: 1 }).waitFor()
    }

    async selectTenant(tenantName: string) {
        await this.tenantCard(tenantName).getByRole('link', { name: 'View Campaigns' }).click()
        await this.waitForURL(/\/donate\//)
    }

    async goToAdminPanel() {
        await this.getByRole('link', { name: 'Go to Admin Panel →' }).click()
        await this.waitForURL('/admin')
    }

    tenantCard(tenantName: string) {
        return this.locator('.overflow-hidden.rounded-xl').filter({ has: this.locator('h3', { hasText: tenantName }) })
    }

    async tenantNames() {
        await this.locator('h3').first().waitFor()
        return this.locator('h3').allTextContents()
    }
}
