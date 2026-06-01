const LOCALE_KEY = `locale`

export const useLocale = () => {
  const { locale } = useI18n()

  const setLocale = (lang: string) => {
    locale.value = lang
    if (import.meta.client) {
      localStorage.setItem(LOCALE_KEY, lang)
    }
  }

  return { locale, setLocale }
}
