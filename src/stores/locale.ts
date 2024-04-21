import { defineStore } from 'pinia'
import localeMessageMap from '../locale/message.json'
import type { Locale } from '../index.d'

export const useLocaleStore = defineStore({
  id: 'locale',
  state: (): {
    locale: Locale
  } => ({
    locale: 'zh'
  }),
  getters: {
    message(state) {
      return localeMessageMap[state.locale]
    }
  },
  actions: {
    setLocale(locale: Locale) {
      this.locale = locale
    }
  }
})
