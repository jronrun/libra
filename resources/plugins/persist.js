'use strict'

import pi from '~pi'
import * as types from '~types'
import {libra_key} from '~/plugins/libra'

export default ({app, store}) => {

  store.subscribe(({type, payload}) => {
    if (type === types.SET_LANG) {
      pi.store(libra_key, {locale: payload})
    }
  })

}
