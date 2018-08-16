import Vue from 'vue'

import VueI18n from 'vue-i18n'
Vue.use(VueI18n)

import VeeValidate, { Validator } from 'vee-validate'
import zh_CN from 'vee-validate/dist/locale/zh_CN'

const i18n = new VueI18n({
  locale: 'zh_CN'
});

Vue.use(VeeValidate, {
  i18n,
  i18nRootKey: 'validation',
  dictionary: {
    zh_CN
  }
})
