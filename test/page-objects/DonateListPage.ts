import { BasePage } from '../fixtures/BasePage'

export class DonateListPage extends BasePage {
    async visit(slug: string) {
        await this.goto(`/donate/${slug}`)
    }

    async search(query: string) {
        await this.getByPlaceholder('Search campaigns...').fill(query)
    }

    async clickDonate(campaignName: string) {
        const card = this.locator('div').filter({
            has: this.locator('h3', { hasText: campaignName }),
        })
        await card.getByRole('button', { name: 'Donate' }).click()
        await this.waitForURL(new RegExp(campaignName.split(' ')[0]))
    }

    campaignNames() {
        return this.locator('h3').allTextContents()
    }

    isCampaignVisible(campaignName: string) {
        return this.getByRole('heading', { name: campaignName, level: 3 }).isVisible()
    }
}
