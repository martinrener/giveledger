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
        return this.getByTestId('tenant-card').filter({ has: this.getByRole('heading', { name: tenantName, level: 3 }) })
    }

    async tenantNames() {
        await this.getByRole('heading', { level: 3 }).first().waitFor()
        return this.getByRole('heading', { level: 3 }).allTextContents()
    }
}
