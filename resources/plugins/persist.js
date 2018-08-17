import pi from '~pi'
import Vue from 'vue'
import Libra, { libra_key } from '~/plugins/libra'

Vue.use(Libra)

export default ({app, store}) => {

  store.subscribe(({type, payload}) => {
    if ('SET_LANG' === type) {
      pi.store(libra_key, {locale: payload})
    }
  })

}
