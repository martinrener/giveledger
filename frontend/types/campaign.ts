export interface Tenant {
  id: string
  slug: string
  name: string
}

export interface Donation {
  id: string
  campaignId: string
  donorName: string
  amountCents: number
  recordedAt: string
}

export interface Campaign {
  id: string
  name: string
  goalCents: number
  raisedCents: number
  currency: string
  status: `open` | `closed`
  deadline: string
  donations: Donation[]
}

export interface CreateCampaignPayload {
  name: string
  goalCents: number
  currency: string
  deadline: string
}

export interface RecordDonationPayload {
  donorName: string
  amountCents: number
  currency: string
}
