import { faker } from '@faker-js/faker'

export interface CampaignPayload {
    name:       string
    goal_cents: number
    currency:   string
    deadline:   string
}

export interface DonationPayload {
    donor_name:   string
    amount_cents: number
    currency:     string
}

export const generateCampaignData = (overrides: Partial<CampaignPayload> = {}): CampaignPayload => ({
    name:       `Campaign-${faker.string.alphanumeric(8)}`,
    goal_cents: faker.number.int({ min: 10_000, max: 1_000_000 }),
    currency:   'USD',
    deadline:   faker.date.future({ years: 1 }).toISOString().split('T')[0],
    ...overrides,
})

export const generateDonationData = (overrides: Partial<DonationPayload> = {}): DonationPayload => ({
    donor_name:   faker.person.fullName(),
    amount_cents: faker.number.int({ min: 100, max: 50_000 }),
    currency:     'USD',
    ...overrides,
})

// Date helpers
export const yesterday = (): string => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d.toISOString().split('T')[0]
}

export const today = (): string => new Date().toISOString().split('T')[0]

// Name helpers
export const uniqueName    = (): string => `Test-${faker.string.alphanumeric(10)}`
export const oversizedName = (): string => faker.string.alpha(101)

// Generates a valid UUID v4 that does not correspond to any existing entity
export const nonExistentId = (): string => faker.string.uuid()

// --- Semantic invalid values ---

// Amounts
export const zeroAmount     = (): number => 0
export const negativeAmount = (): number => -100
export const validAmount    = (): number => faker.number.int({ min: 100, max: 10_000 })

// A goal large enough that test donations won't trigger auto-close
export const largeGoal = (): number => 10_000_000

// Names / strings
export const tooShortName      = (): string => 'AB'                      // 2 chars — campaign min is 3
export const singleCharName    = (): string => 'A'                       // 1 char  — donor min is 2
export const oversizedDonorName = (): string => faker.string.alpha(81)   // 81 chars — donor max is 80
export const emptyString       = (): string => ''
export const unknownCurrency   = (): string => 'XYZ'

// Auth test values
export const incorrectPassword = (): string => 'wrong-password'
export const nonExistentEmail  = (): string => 'nobody@nowhere.com'
export const nonExistentSlug   = (): string => 'nonexistent-church'
export const anyEmail          = (): string => faker.internet.email()
export const anyPassword       = (): string => 'password123'

// Tenant credentials from env — centralises process.env access so tests stay clean
export const tenantA = () => ({
    slug:     process.env.TENANT_A_SLUG     ?? '',
    email:    process.env.TENANT_A_ADMIN_EMAIL    ?? '',
    password: process.env.TENANT_A_ADMIN_PASSWORD ?? '',
})

export const tenantB = () => ({
    slug:     process.env.TENANT_B_SLUG     ?? '',
    email:    process.env.TENANT_B_ADMIN_EMAIL    ?? '',
    password: process.env.TENANT_B_ADMIN_PASSWORD ?? '',
})
