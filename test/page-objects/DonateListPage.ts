import { BasePage } from '../fixtures/BasePage'

export class DonateListPage extends BasePage {
    async visit(slug: string) {
        await this.goto(`/donate/${slug}`)
        // Wait for loading to finish — either campaigns or empty state
        await this.locator('h3, p:has-text("No campaigns")').first().waitFor()
    }

    async search(query: string) {
        await this.getByPlaceholder('Search campaigns...').fill(query)
    }

    async clickDonate(campaignName: string) {
        await this.campaignCard(campaignName).getByRole('button', { name: 'Donate' }).click()
        await this.waitForURL(/donate\/[^/]+\/[^/]+$/)
    }

    campaignCard(campaignName: string) {
        return this.locator('.flex-col.gap-4.rounded-xl').filter({ has: this.locator('h3', { hasText: campaignName }) })
    }

    async campaignNames() {
        return this.locator('h3').allTextContents()
    }
}
