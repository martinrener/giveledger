import { BasePage } from '../fixtures/BasePage'

export class DonationFormPage extends BasePage {
    async visit(slug: string, campaignId: string) {
        await this.goto(`/donate/${slug}/${campaignId}`)
        await this.getByRole('heading', { level: 1 }).waitFor()
    }

    async donate(donorName: string, amountDollars: number) {
        await this.getByLabel('Your Name').fill(donorName)
        await this.getByLabel('Amount').fill(String(amountDollars))

        // Submit form — opens confirmation modal
        await this.getByRole('button', { name: 'Confirm Donation' }).click()

        // Wait for modal, confirm with the modal button (last occurrence)
        await this.getByText('Confirm your donation').waitFor()
        await this.getByRole('button', { name: 'Confirm Donation' }).last().click()

        await this.getByText('Thank you for your donation!').waitFor()
    }

    donationSuccess() {
        return this.getByText('Thank you for your donation!')
    }

    async goBack() {
        await this.getByRole('link', { name: /Back/ }).first().click()
        await this.waitForURL(/\/donate\//)
    }

    closedWarning() {
        return this.getByText('This campaign is no longer accepting donations.')
    }
}
