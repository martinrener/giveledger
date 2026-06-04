import { BasePage } from '../fixtures/BasePage'

export class NewCampaignPage extends BasePage {
    async visit(slug: string) {
        await this.goto(`/${slug}/campaigns/new`)
    }

    // Full campaign creation flow: fill form → confirm modal → wait for success
    async create(name: string, goalDollars: number, deadline: string, currency = 'USD') {
        await this.getByLabel('Campaign Name').fill(name)
        await this.getByLabel('Goal').fill(String(goalDollars))
        await this.getByLabel('Currency').selectOption(currency)
        await this.getByLabel('Deadline').fill(deadline)

        // Submit form — opens the Launch Campaign confirmation modal
        await this.getByRole('button', { name: 'Create Campaign' }).click()

        // Wait for modal, then confirm
        await this.getByText('You are about to launch').waitFor()
        await this.getByRole('button', { name: 'Yes, Launch' }).click()

        // Wait for success state
        await this.getByText('Campaign created successfully.').waitFor()
    }

    isSuccessVisible() {
        return this.getByText('Campaign created successfully.').isVisible()
    }

    goBackToDashboard() {
        return this.getByRole('link', { name: 'Back to Dashboard' }).click()
    }
}
