import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

export default defineConfig({
    testDir:       './tests',
    fullyParallel: true,
    forbidOnly:    !!process.env.CI,
    retries:       process.env.CI ? 1 : 0,
    workers:       process.env.CI ? 2 : undefined,
    reporter: [
        ['html'],
        ['list'],
    ],
    use: {
        baseURL:           process.env.BASE_URL,
        trace:             'on-first-retry',
        screenshot:        'only-on-failure',
        video:             'retain-on-failure',
    },
    projects: [
        {
            name:      'setup',
            testMatch: /.*\.setup\.ts/,
        },
        {
            // API tests handle their own auth via BaseAPI.init() — no setup dependency
            name:      'api',
            testMatch: /.*\.api\.test\.ts/,
        },
        {
            name:         'chromium',
            use:          {
                ...devices['Desktop Chrome'],
                storageState: 'test-results/.auth/tenant-a.json',
            },
            dependencies: ['setup'],
            testMatch:    /.*\.spec\.ts/,
        },
    ],
})
