import { BasePage } from '../fixtures/BasePage'

export class LoginPage extends BasePage {
    static readonly URL = '/admin'

    async visit() {
        await this.goto(LoginPage.URL)
        await this.getByRole('button', { name: 'Log in' }).waitFor()
    }

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

    async goToRegister() {
        await this.getByRole('link', { name: 'Create an account' }).click()
        await this.waitForURL('/admin/register')
    }

    errorMessage() {
        return this.locator('.text-red-600')
    }
}
