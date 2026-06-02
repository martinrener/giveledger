import { request } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

export class BaseAPI {
    private ctx!: APIRequestContext
    public slug!: string

    async init(email: string, password: string): Promise<void> {
        this.ctx = await request.newContext({
            baseURL: process.env.API_BASE_URL,
        })

        const res = await this.ctx.post('/auth/login', {
            data: { email, password },
        })

        if (!res.ok()) {
            throw new Error(`BaseAPI login failed for ${email}: ${res.status()} ${await res.text()}`)
        }

        const body = await res.json()
        this.slug = body.slug
    }

    async initUnauthenticated(slug: string): Promise<void> {
        this.ctx = await request.newContext({
            baseURL: process.env.API_BASE_URL,
        })
        this.slug = slug
    }

    // Admin routes: GET /api/:slug/...
    adminGet(path: string, opts?: Parameters<APIRequestContext['get']>[1]) {
        return this.ctx.get(`/${this.slug}${path}`, opts)
    }

    // Admin routes: POST /api/:slug/...
    adminPost(path: string, opts?: Parameters<APIRequestContext['post']>[1]) {
        return this.ctx.post(`/${this.slug}${path}`, opts)
    }

    // Public donate routes: GET /api/donate/:slug/...
    donateGet(path: string, opts?: Parameters<APIRequestContext['get']>[1]) {
        return this.ctx.get(`/donate/${this.slug}${path}`, opts)
    }

    // Public donate routes: POST /api/donate/:slug/...
    donatePost(path: string, opts?: Parameters<APIRequestContext['post']>[1]) {
        return this.ctx.post(`/donate/${this.slug}${path}`, opts)
    }

    // Raw — caller provides full path (used in isolation tests to send wrong slug)
    get(path: string, opts?: Parameters<APIRequestContext['get']>[1]) {
        return this.ctx.get(path, opts)
    }

    post(path: string, opts?: Parameters<APIRequestContext['post']>[1]) {
        return this.ctx.post(path, opts)
    }

    async dispose(): Promise<void> {
        await this.ctx.dispose()
    }
}
