
export const state = () => ({
  // locale name keep same with vee-validate
  locales: [
    'en',
    'zh_CN'
  ],
  locale: 'en'
})

export const mutations = {
  SET_LANG(state, locale) {
    if (state.locales.includes(locale)) {
      state.locale = locale
    }
  }
}
