<script lang="ts" setup>
import type { CreateCampaignPayload } from '~/types/campaign'
import type { SelectOption } from '~/components/common/BaseSelect.vue'

const { t: $t } = useI18n()

const name     = ref(``)
const goal     = ref(``)
const currency = ref(``)
const deadline = ref(``)

const errors = reactive({
  name:     ``,
  goal:     ``,
  currency: ``,
  deadline: ``,
})

const currencyOptions: SelectOption[] = [
  { value: `USD`, label: `USD – US Dollar` },
  { value: `EUR`, label: `EUR – Euro` },
  { value: `GBP`, label: `GBP – British Pound` },
  { value: `ARS`, label: `ARS – Argentine Peso` },
  { value: `UYU`, label: `UYU – Uruguayan Peso` },
]

const emit = defineEmits<{ submit: [payload: CreateCampaignPayload] }>()

const validate = (): boolean => {
  errors.name     = ``
  errors.goal     = ``
  errors.currency = ``
  errors.deadline = ``

  let valid = true

  if (name.value.trim().length < 3 || name.value.trim().length > 100) {
    errors.name = $t(`validation.nameLength`)
    valid = false
  }
  if (!goal.value || parseFloat(goal.value) <= 0) {
    errors.goal = $t(`validation.amountPositive`)
    valid = false
  }
  if (!currency.value) {
    errors.currency = $t(`validation.invalidCurrency`)
    valid = false
  }
  if (!deadline.value) {
    errors.deadline = $t(`validation.required`)
    valid = false
  }

  return valid
}

const handleSubmit = () => {
  if (!validate()) { return }
  emit(`submit`, {
    name:      name.value.trim(),
    goalCents: Math.round(parseFloat(goal.value) * 100),
    currency:  currency.value,
    deadline:  deadline.value,
  })
}
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
    <BaseInput
      id="campaign-name"
      v-model="name"
      :label="$t(`campaign.name`)"
      :state="errors.name ? `error` : `default`"
      :error-message="errors.name"
      placeholder="e.g. Roof Restoration Fund"
    />

    <div class="grid grid-cols-2 gap-4">
      <BaseInput
        id="campaign-goal"
        v-model="goal"
        type="number"
        :label="$t(`campaign.goal`)"
        :state="errors.goal ? `error` : `default`"
        :error-message="errors.goal"
        placeholder="0.00"
      />
      <BaseSelect
        id="campaign-currency"
        v-model="currency"
        :label="$t(`campaign.currency`)"
        :options="currencyOptions"
        :state="errors.currency ? `error` : `default`"
        :error-message="errors.currency"
        :placeholder="$t(`validation.invalidCurrency`)"
      />
    </div>

    <BaseInput
      id="campaign-deadline"
      v-model="deadline"
      type="date"
      :label="$t(`campaign.deadline`)"
      :state="errors.deadline ? `error` : `default`"
      :error-message="errors.deadline"
    />

    <div class="flex justify-end">
      <BaseButton type="submit" variant="primary">
        {{ $t(`campaign.create`) }}
      </BaseButton>
    </div>
  </form>
</template>
