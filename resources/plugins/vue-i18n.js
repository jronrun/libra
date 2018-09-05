'use strict'

import pi from '~pi'
import Vue from 'vue'
import VueI18n from 'vue-i18n'

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
  // this.$libra.restore('en', this, () => this.$t('login.messages'))
  app.i18n.change = (localeName, {$validator} = {}, validatorDictionary = {}) => {
    localeName = localeName || store.state.locale
    if (localeName !== store.state.locale) {
      loadLanguageAsync(localeName).then(() => {
        store.dispatch('setLocale', {locale: localeName}).then(() => {
          app.i18n.locale = store.state.locale
          changeValidateIfExist(localeName, $validator, validatorDictionary)
        }).catch((e) => {
          console.error(e)
        })

      })
    } else {
      changeValidateIfExist(localeName, $validator, validatorDictionary)
    }
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
