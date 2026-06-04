import { BasePage } from '../fixtures/BasePage'

export class LoginPage extends BasePage {
    static readonly URL = '/admin'

    async visit() {
        await this.goto(LoginPage.URL)
    }

    // Full login flow: fill credentials → submit → wait for dashboard redirect
    async login(email: string, password: string) {
        await this.getByLabel('Email address').fill(email)
        await this.getByLabel('Password').fill(password)
        await this.getByRole('button', { name: 'Log in' }).click()
        await this.waitForURL(/dashboard/)
    }

    async loginExpectError(email: string, password: string) {
        await this.getByLabel('Email address').fill(email)
        await this.getByLabel('Password').fill(password)
        await this.getByRole('button', { name: 'Log in' }).click()
    }

    getErrorMessage() {
        return this.locator('.text-red-600').textContent()
    }

    isOnLoginPage() {
        return this.getByRole('button', { name: 'Log in' }).isVisible()
    }
}
