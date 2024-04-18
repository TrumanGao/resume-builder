import { defineStore } from 'pinia'
import localeMessageMap from '../locale/message.json'

export const useLocaleStore = defineStore({
  id: 'locale',
  state: (): {
    locale: 'zh' | 'en'
  } => ({
    locale: 'zh'
  }),
  getters: {
    message(state) {
      return localeMessageMap[state.locale]
    }
  },
  actions: {
    setLocale(locale: 'zh' | 'en') {
      this.locale = locale
    }
  }
})
