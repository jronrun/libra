'use strict'

import pi from '~pi'
import axios from '~axios'
import * as types from '~types'

export const state = () => ({
  credentials: ''
})

export const mutations = {
  [types.SET_CREDENTIALS](state, payload) {
    state.credentials = payload.credentials
  }
}

export const actions = {
  /*
     1. import { mapActions } from 'vuex'

         methods: {
            ...mapActions('user', [
              'login'
            ])
         }

         this.login({account: this.account}).then((response) => {
            this.loading = false
            this.$router.push({path: '/'})
          }).catch(({response: {status, data: {message}}}) => {
            this.loading = false
          })

     2. this.$store.dispatch('user/login', {account: this.account}).then(...)
    */
  login({commit, dispatch, state}, {account}) {

    return new Promise((resolve, reject) => {
      axios.post('/login', {
        username: account.email.trim(),
        password: pi.sign(account.password.trim())
      }).then(response => {
        let {data: {token}} = response
        let credentials = pi.deepUnsign(token)
        commit(types.SET_CREDENTIALS, {credentials: `${credentials.type} ${credentials.token}`})
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  }

}
