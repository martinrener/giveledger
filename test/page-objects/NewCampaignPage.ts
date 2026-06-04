import { BasePage } from '../fixtures/BasePage'

export class NewCampaignPage extends BasePage {
    async visit(slug: string) {
        await this.goto(`/${slug}/campaigns/new`)
        await this.getByRole('heading', { name: 'Create Campaign', level: 1 }).waitFor()
    }

    async create(name: string, goalDollars: number, deadline: string, currency = 'USD') {
        await this.getByLabel('Campaign Name').fill(name)
        await this.getByLabel('Goal').fill(String(goalDollars))
        await this.getByLabel('Currency').selectOption(currency)
        await this.getByLabel('Deadline').fill(deadline)

        await this.getByRole('button', { name: 'Create Campaign' }).click()

        await this.getByText('You are about to launch').waitFor()
        await this.getByRole('button', { name: 'Yes, Launch' }).click()

        await this.getByText('Campaign created successfully.').waitFor()
    }

    successBanner() {
        return this.getByText('Campaign created successfully.')
    }

    async goBackToDashboard() {
        await this.getByRole('link', { name: 'Back to Dashboard' }).click()
        await this.waitForURL(/dashboard/)
    }
}
