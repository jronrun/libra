'use strict'

import Vue from 'vue'
import extend from '../utils/extend-vue-app'
import Libra from '~/plugins/libra'

Vue.use(Libra)

export default async function ({app, store}) {

  // ready beforeMount -> component beforeMount -> component mounted -> ready mounted
  extend(app, {
    beforeMount() {

    },
    mounted() {

    }
  })
}
