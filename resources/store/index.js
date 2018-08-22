'use strict'

import * as types from '~types'
const Request = process.server ? use('Adonis/Src/Request') : undefined

export const state = () => ({
  // locale name keep same with vee-validate
  locales: [
    'en',
    'zh_CN'
  ],
  locale: 'en'
})

export const mutations = {
  [types.SET_LANG](state, locale) {
    if (state.locales.includes(locale)) {
      state.locale = locale
    }
  }
}

export const actions = {
  nuxtServerInit ({ commit }, { req, res }) {

    if (req.headers.cookie) {
      try {
        const request = new Request(req, res, use('Adonis/Src/Config'))
        let value = request.cookie('libra-constellation-values')
        let credentials = JSON.parse(JSON.parse(value).token.d)
        commit(`user/${types.SET_CREDENTIALS}`, {credentials: `${credentials.type} ${credentials.token}`})
      } catch (err) { /* No valid cookie found */ }
    }

  }
}
