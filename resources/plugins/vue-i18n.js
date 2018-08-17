import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

export default ({ app, store }) => {

  const defaultLocale = 'en'
  const loadedLanguages = [defaultLocale]

  // Set i18n instance on app
  // This way we can use it in middleware and pages asyncData/fetch
  app.i18n = new VueI18n({
    locale: store.state.locale,
    fallbackLocale: defaultLocale,
    messages: {
      [defaultLocale]: require('~/locales/en.json')
    }
  })

  // vee-validate: this.$validator
  app.i18n.change = (localeName, { $validator } = {}) => {
    if (!store.state.locales.includes(localeName)) {
      console.warn(`There is none defined locale for ${localeName}`)
      return
    }

    loadLanguageAsync(localeName).then(() => {
      store.commit('SET_LANG', localeName)
      app.i18n.locale = store.state.locale

      changeValidateIfExist(localeName, $validator)
    })
  }

  const changeValidateIfExist = (localeName, validator) => {
    if (validator) {
      import(`vee-validate/dist/locale/${localeName}`).then(locale => {
        validator.localize(localeName, locale)
      })
    }
  }

  const loadLanguageAsync = (localeName) => {
    if (app.i18n.locale !== localeName) {
      if (!loadedLanguages.includes(localeName)) {
        return import(`~/locales/${localeName}.json`).then(messages => {
          app.i18n.setLocaleMessage(localeName, messages)
          loadedLanguages.push(localeName)
          return Promise.resolve(localeName)
        })
      }
    }

    return Promise.resolve(localeName)
  }

}
