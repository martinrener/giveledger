import { BasePage } from '../fixtures/BasePage'

export class DashboardPage extends BasePage {
    async visit(slug: string) {
        await this.goto(`/${slug}/dashboard`)
        await this.getByRole('heading', { name: 'Campaigns', level: 1 }).waitFor()
    }

    async goToNewCampaign() {
        await this.getByRole('link', { name: 'New Campaign' }).click()
        await this.waitForURL(/campaigns\/new/)
    }

    async closeCampaign(campaignName: string) {
        const row = this.campaignRow(campaignName)
        await row.getByRole('button', { name: 'Close Campaign' }).click()

        await this.getByText('You are about to close').waitFor()
        await this.getByRole('button', { name: 'Yes, Close' }).click()

        // Wait for the row status to update
        await row.getByText('Closed').waitFor()
    }

    async clickDonors(campaignName: string) {
        await this.campaignRow(campaignName).click()
        await this.waitForURL(/donors/)
    }

    async logout() {
        await this.getByRole('button', { name: 'Log out' }).click()
        await this.waitForURL('/admin')
    }

    campaignRow(campaignName: string) {
        return this.getByRole('row').filter({ hasText: campaignName })
    }

    async campaignNames() {
        return this.locator('tbody tr td:first-child').allTextContents()
    }

    async getCampaignStatus(campaignName: string) {
        return this.campaignRow(campaignName).getByRole('cell').nth(1).textContent()
    }
}
