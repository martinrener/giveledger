import { BasePage } from '../fixtures/BasePage'

export class DashboardPage extends BasePage {
    async visit(slug: string) {
        await this.goto(`/${slug}/dashboard`)
    }

    async goToNewCampaign() {
        await this.getByRole('link', { name: 'New Campaign' }).click()
        await this.waitForURL(/campaigns\/new/)
    }

    // Full close flow: click Close Campaign in row → confirm in modal → wait for status update
    async closeCampaign(campaignName: string) {
        const row = this.getByRole('row').filter({ hasText: campaignName })
        await row.getByRole('button', { name: 'Close Campaign' }).click()

        // Wait for modal, then confirm
        await this.getByText('You are about to close').waitFor()
        await this.getByRole('button', { name: 'Yes, Close' }).click()

        // Wait for the campaign status to update in the table
        await row.getByText('Closed').waitFor()
    }

    async clickDonors(campaignName: string) {
        await this.getByRole('row').filter({ hasText: campaignName }).click()
        await this.waitForURL(/donors/)
    }

    async logout() {
        await this.getByRole('button', { name: 'Log out' }).click()
        await this.waitForURL('/admin')
    }

    campaignNames() {
        return this.locator('tbody tr td:first-child').allTextContents()
    }

    isCampaignVisible(campaignName: string) {
        return this.getByRole('row').filter({ hasText: campaignName }).isVisible()
    }

    getCampaignStatus(campaignName: string) {
        return this.getByRole('row')
            .filter({ hasText: campaignName })
            .getByRole('cell')
            .nth(1)
            .textContent()
    }
}
