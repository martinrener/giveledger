import { BasePage } from '../fixtures/BasePage'

export class RegisterPage extends BasePage {
    static readonly URL = '/admin/register'

    async visit() {
        await this.goto(RegisterPage.URL)
        await this.getByRole('button', { name: 'Create account' }).waitFor()
    }

    async register(tenantName: string, email: string, password: string) {
        // Wait for tenant options to load
        await this.getByLabel('Church Slug').waitFor()
        await this.getByLabel('Church Slug').selectOption({ label: tenantName })
        await this.getByLabel('Email address').fill(email)
        await this.getByLabel('Password').fill(password)
        await this.getByRole('button', { name: 'Create account' }).click()
    }

    successBanner() {
        return this.getByText('Account created!')
    }

    errorMessage() {
        return this.locator('.text-red-600')
    }

    async goToLogin() {
        await this.getByRole('link', { name: 'Log in' }).click()
        await this.waitForURL('/admin')
    }
}
