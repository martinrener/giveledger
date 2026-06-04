import { BasePage } from '../fixtures/BasePage'

export class DonorListPage extends BasePage {
    async visit(slug: string, campaignId: string) {
        await this.goto(`/${slug}/campaigns/${campaignId}/donors`)
    }

    async backToDashboard() {
        await this.getByRole('link', { name: 'Back to Dashboard' }).click()
        await this.waitForURL(/dashboard/)
    }

    campaignName() {
        return this.getByRole('heading', { level: 1 }).textContent()
    }

    donorNames() {
        return this.locator('tbody tr td:first-child').allTextContents()
    }

    donorCount() {
        return this.locator('tbody tr').count()
    }

    statusBadge() {
        return this.locator('[class*="rounded-full"]').first().textContent()
    }

    isDonorVisible(donorName: string) {
        return this.getByRole('cell', { name: donorName }).isVisible()
    }
}
