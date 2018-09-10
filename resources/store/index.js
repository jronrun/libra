'use strict'

import pi from '~pi'
import axios from '~axios'
import * as types from '~types'
import {withErrorHint} from "~helper"

// const Request = process.server ? use('Adonis/Src/Request') : undefined

export const state = () => ({
  locales: [
    {
      name: 'English',
      value: 'en'
    },
    {
      name: '简体中文',
      value: 'zh_CN'
    }
  ],
  locale: 'en',
  theme: { /* color, dark */ }
})

export const getters = {

  locale: (state) => state.locales.filter(lang => state.locale === lang.value)[0]

}

export const mutations = {
  [types.SET_LANG](state, locale) {
    state.locale = locale
  },

  [types.SET_THEME](state, payload) {
    state.theme = Object.assign({}, state.theme, payload)
  }
}

export const actions = {
  nuxtServerInit({commit}, {req, res}) {

    if (req.headers.cookie) {
      try {
        // const request = new Request(req, res, use('Adonis/Src/Config'))
        // let value = request.cookie('libra-constellation-values')

        // let locale = JSON.parse(value).custom_locale.d
        // commit(types.SET_LANG, locale)
        //
        // let credentials = JSON.parse(JSON.parse(value).token.d)
        // commit(`user/${types.SET_CREDENTIALS}`, {credentials: `${credentials.type} ${credentials.token}`})
      } catch (err) { /* No valid cookie found */ }
    }
  },

  setLocale({commit, dispatch, state}, {locale}) {
    commit(types.SET_LANG, locale)

    return new Promise((resolve, reject) => {
      axios.post('/settings/locale', {locale}).then(response => {
        resolve(response)
      }).catch(error => {
        withErrorHint(error)
        reject(error)
      })
    })
  }
}
