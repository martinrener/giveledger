import { BasePage } from '../fixtures/BasePage'

export class RegisterPage extends BasePage {
    static readonly URL = '/admin/register'

    async visit() {
        await this.goto(RegisterPage.URL)
    }

    // Full registration flow: select church → fill credentials → submit
    async register(tenantName: string, email: string, password: string) {
        await this.getByLabel('Church Slug').selectOption({ label: tenantName })
        await this.getByLabel('Email address').fill(email)
        await this.getByLabel('Password').fill(password)
        await this.getByRole('button', { name: 'Create account' }).click()
    }

    isSuccessVisible() {
        return this.getByText('Account created!').isVisible()
    }

    goToLogin() {
        return this.getByRole('link', { name: 'Log in' }).click()
    }
}
