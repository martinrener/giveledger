import { request } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

// Playwright resolves paths starting with "/" against the origin only (standard URL spec),
// so "/auth/login" + baseURL "http://host/api" → "http://host/auth/login" (drops /api).
// We construct absolute URLs explicitly to avoid this.
export const base = (): string => (process.env.API_BASE_URL ?? 'http://localhost/api').replace(/\/$/, '')

export class BaseAPI {
    private ctx!: APIRequestContext
    public slug!: string

    async init(email: string, password: string): Promise<void> {
        this.ctx = await request.newContext()

        const res = await this.ctx.post(`${base()}/auth/login`, {
            data: { email, password },
        })

        if (!res.ok()) {
            throw new Error(`BaseAPI login failed for ${email}: ${res.status()} ${await res.text()}`)
        }

        const body = await res.json()
        this.slug = body.slug
    }

    async initUnauthenticated(slug: string): Promise<void> {
        this.ctx = await request.newContext()
        this.slug = slug
    }

    // Admin routes: /api/:slug/...
    adminGet(path: string, opts?: Parameters<APIRequestContext['get']>[1]) {
        return this.ctx.get(`${base()}/${this.slug}${path}`, opts)
    }

    adminPost(path: string, opts?: Parameters<APIRequestContext['post']>[1]) {
        return this.ctx.post(`${base()}/${this.slug}${path}`, opts)
    }

    // Public donate routes: /api/donate/:slug/...
    donateGet(path: string, opts?: Parameters<APIRequestContext['get']>[1]) {
        return this.ctx.get(`${base()}/donate/${this.slug}${path}`, opts)
    }

    donatePost(path: string, opts?: Parameters<APIRequestContext['post']>[1]) {
        return this.ctx.post(`${base()}/donate/${this.slug}${path}`, opts)
    }

    // Raw — caller provides a path segment (used in isolation tests to cross slugs)
    get(path: string, opts?: Parameters<APIRequestContext['get']>[1]) {
        return this.ctx.get(`${base()}${path}`, opts)
    }

    post(path: string, opts?: Parameters<APIRequestContext['post']>[1]) {
        return this.ctx.post(`${base()}${path}`, opts)
    }

    async dispose(): Promise<void> {
        await this.ctx.dispose()
    }
}
