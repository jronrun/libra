import pi from '~pi'
import Vue from 'vue'
import VueI18n from 'vue-i18n'

import * as types from '~types'

Vue.use(VueI18n)

export default ({app, store}) => {

  const localeEn = 'en'
  const loadedLanguages = [localeEn]

  // Set i18n instance on app
  // This way we can use it in middleware and pages asyncData/fetch
  app.i18n = new VueI18n({
    locale: store.state.locale,
    fallbackLocale: localeEn,
    messages: {
      [localeEn]: require('~/locales/en.json')
    }
  })

  // vee-validate: this.$validator
  app.i18n.change = (localeName, {$validator} = {}, validatorDictionary = {}) => {
    if (!store.state.locales.includes(localeName)) {
      console.warn(`There is none defined locale for ${localeName}`)
      return
    }

    loadLanguageAsync(localeName).then(() => {
      store.commit(types.SET_LANG, localeName)
      app.i18n.locale = store.state.locale

      changeValidateIfExist(localeName, $validator, validatorDictionary)
    })
  }

  const changeValidateIfExist = (localeName, validator, validatorDictionary = {}) => {
    if (validator) {
      if (pi.isFunction(validatorDictionary)) {
        validatorDictionary = JSON.parse(JSON.stringify(validatorDictionary() || {}))
      }

      import(`vee-validate/dist/locale/${localeName}`).then(localeDictionary => {
        validator.localize(localeName, Object.assign({}, localeDictionary, validatorDictionary))
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
