import Vue from 'vue'
import VeeValidate, { Validator } from 'vee-validate'
// import zh_CN from 'vee-validate/dist/locale/zh_CN'


Vue.use(VeeValidate)

Vue.mixin({
  localize (localeName) {
    // asynchronously load the locale file then localize the validator with it.
    import(`vee-validate/dist/locale/${localeName}`).then(locale => {
      Validator.localize(localeName, locale)
    })
  }
})
