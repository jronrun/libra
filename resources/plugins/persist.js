'use strict'

import pi from '~pi'
import * as types from '~types'
import {LIBRA_KEY} from '~constants'

export default ({app, store}) => {

  store.subscribe(({type, payload}) => {
    switch (type) {
      case types.SET_LANG:
        pi.store(LIBRA_KEY, {locale: payload})
        break
      case types.SET_THEME:
        const original = pi.store(LIBRA_KEY)
        pi.store(LIBRA_KEY, {
          theme: Object.assign({}, original.theme || {}, payload)
        })
        break
    }
  })

}
