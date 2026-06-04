import { BasePage } from '../fixtures/BasePage'

export class DonorListPage extends BasePage {
    async visit(slug: string, campaignId: string) {
        await this.goto(`/${slug}/campaigns/${campaignId}/donors`)
        await this.getByRole('heading', { level: 1 }).waitFor()
    }

    async backToDashboard() {
        // Link text includes "← Back to Dashboard" — use regex to match partial text
        await this.getByRole('link', { name: /Back to Dashboard/ }).click()
        await this.waitForURL(/dashboard/)
    }

    donorRow(donorName: string) {
        return this.locator('tbody tr').filter({ hasText: donorName })
    }

    async donorNames() {
        await this.locator('tbody tr').first().waitFor()
        return this.locator('tbody tr td:first-child').allTextContents()
    }

    async donorCount() {
        return this.locator('tbody tr').count()
    }
}
