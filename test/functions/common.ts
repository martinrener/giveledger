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
