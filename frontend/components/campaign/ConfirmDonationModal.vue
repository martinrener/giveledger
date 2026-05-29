<script lang="ts" setup>
export interface Props {
  open:         boolean
  campaignName: string
  donorName:    string
  amountCents:  number
  currency:     string
}

const { open, campaignName, donorName, amountCents, currency } = defineProps<Props>()

const emit = defineEmits<{ confirm: []; close: [] }>()

const { t: $t }       = useI18n()
const { formatCents } = useCurrency()
</script>

<template>
  <BaseModal :open="open" :title="$t(`donation.confirm_title`)" @close="emit(`close`)">
    <template #body>
      <p class="text-sm text-neutral-700">
        {{
          $t(`donation.confirm_body`, {
            name:     donorName,
            amount:   formatCents(amountCents, currency),
            campaign: campaignName,
          })
        }}
      </p>
    </template>
    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="emit(`close`)">
        {{ $t(`common.cancel`) }}
      </BaseButton>
      <BaseButton variant="primary" size="sm" @click="emit(`confirm`)">
        {{ $t(`donation.confirm`) }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
