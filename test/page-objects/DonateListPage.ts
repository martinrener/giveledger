import { BasePage } from '../fixtures/BasePage'

export class DonateListPage extends BasePage {
    async visit(slug: string) {
        await this.goto(`/donate/${slug}`)
        // Wait for loading to finish — either campaigns or empty state
        await this.getByRole('heading', { level: 3 }).or(this.getByTestId('campaign-list-empty')).first().waitFor()
    }

    async search(query: string) {
        await this.getByPlaceholder('Search campaigns...').fill(query)
    }

    async clickDonate(campaignName: string) {
        await this.campaignCard(campaignName).getByRole('button', { name: 'Donate' }).click()
        await this.waitForURL(/donate\/[^/]+\/[^/]+$/)
    }

    campaignCard(campaignName: string) {
        return this.getByTestId('campaign-card').filter({ has: this.getByRole('heading', { name: campaignName, level: 3 }) })
    }

    async campaignNames() {
        return this.getByRole('heading', { level: 3 }).allTextContents()
    }
}
