import { defineNuxtPlugin } from '#app'
import { createI18n } from 'vue-i18n'
import en from '~/i18n/en.json'

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = createI18n({
    legacy: false,
    locale: `en`,
    messages: { en },
  })

  nuxtApp.vueApp.use(i18n)
})
