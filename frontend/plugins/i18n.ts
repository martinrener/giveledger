import { defineNuxtPlugin } from '#app'
import { createI18n } from 'vue-i18n'
import en from '~/i18n/en.json'
import es from '~/i18n/es.json'

const LOCALE_KEY = `locale`

const detectLocale = (): string => {
  if (!import.meta.client) { return `en` }
  const saved = localStorage.getItem(LOCALE_KEY)
  if (saved === `en` || saved === `es`) { return saved }
  return navigator.language.startsWith(`es`) ? `es` : `en`
}

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = createI18n({
    legacy:   false,
    locale:   detectLocale(),
    messages: { en, es },
  })

  nuxtApp.vueApp.use(i18n)
})
