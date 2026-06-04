import { BasePage } from '../fixtures/BasePage'

export class DonationFormPage extends BasePage {
    async visit(slug: string, campaignId: string) {
        await this.goto(`/donate/${slug}/${campaignId}`)
    }

    // Full donation flow: fill form → confirm modal → wait for success
    async donate(donorName: string, amountDollars: number) {
        await this.getByLabel('Your Name').fill(donorName)
        await this.getByLabel('Amount').fill(String(amountDollars))

        // Submit the form — opens the confirmation modal
        await this.getByRole('button', { name: 'Confirm Donation' }).click()

        // Wait for modal, then confirm with the modal button (last occurrence = modal's button)
        await this.getByText('Confirm your donation').waitFor()
        await this.getByRole('button', { name: 'Confirm Donation' }).last().click()

        // Wait for success state
        await this.getByText('Thank you for your donation!').waitFor()
    }

    isDonationSuccessVisible() {
        return this.getByText('Thank you for your donation!').isVisible()
    }

    isClosedWarningVisible() {
        return this.getByText('This campaign is no longer accepting donations.').isVisible()
    }

    campaignName() {
        return this.getByRole('heading', { level: 1 }).textContent()
    }
}
