'use strict'

import pi from '~pi'
import Vue from 'vue'
import Libra, { libra_key } from '~/plugins/libra'
import * as types from '~types'

Vue.use(Libra)

// export default ({app, store}) => {
export default (ctx) => {
console.log('ctx')
console.log(ctx)
  // store.subscribe(({type, payload}) => {
  //   if (type.endsWith(types.SET_LANG)) {
  //     pi.store(libra_key, {locale: payload})
  //   }
  // })

}
