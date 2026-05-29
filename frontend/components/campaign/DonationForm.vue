<script lang="ts" setup>
import type { RecordDonationPayload } from '~/types/campaign'

export interface Props {
  currency: string
}

const { currency } = defineProps<Props>()

const { t: $t } = useI18n()

const donorName = ref(``)
const amount    = ref(``)

const errors = reactive({
  donorName: ``,
  amount:    ``,
})

const emit = defineEmits<{ submit: [payload: RecordDonationPayload] }>()

const validate = (): boolean => {
  errors.donorName = ``
  errors.amount    = ``
  let valid = true

  if (donorName.value.trim().length < 2) {
    errors.donorName = $t(`validation.required`)
    valid = false
  }
  if (!amount.value || parseFloat(amount.value) <= 0) {
    errors.amount = $t(`validation.amountPositive`)
    valid = false
  }

  return valid
}

const handleSubmit = () => {
  if (!validate()) { return }
  emit(`submit`, {
    donorName:   donorName.value.trim(),
    amountCents: Math.round(parseFloat(amount.value) * 100),
    currency,
  })
}
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
    <BaseInput
      id="donor-name"
      v-model="donorName"
      :label="$t(`donation.donor`)"
      :state="errors.donorName ? `error` : `default`"
      :error-message="errors.donorName"
      placeholder="Jane Smith"
    />
    <BaseInput
      id="donation-amount"
      v-model="amount"
      type="number"
      :label="$t(`donation.amount`)"
      :state="errors.amount ? `error` : `default`"
      :error-message="errors.amount"
      placeholder="0.00"
    />
    <div class="flex justify-end">
      <BaseButton type="submit" variant="primary">
        {{ $t(`donation.confirm`) }}
      </BaseButton>
    </div>
  </form>
</template>
