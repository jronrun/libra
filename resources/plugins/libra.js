'use strict'

import pi from '~pi'
import {SET_THEME} from '~types'
import {LIBRA_KEY} from '~constants'
import colors from 'vuetify/es5/util/colors'

const Libra = () => {}

Libra.install = function (Vue, options) {

  const core = {

    /**
     * Restore previous data
     * <pre>
     * beforeMount() {
     *  this.$libra.restore(this)
     * }
     * </pre>
     */
    restore: (thisOfComponent, validatorDictionary = {}) => {
      let data = pi.store(LIBRA_KEY)
      thisOfComponent.$i18n.change(data.locale, thisOfComponent, validatorDictionary)
    },

    restoreTheme: (thisOfComponent, delay = 500) => {
      return new Promise((resolve, reject) => {
        const theme = pi.store(LIBRA_KEY).theme
        pi.delay((theTheme) => {
          core.theme(thisOfComponent, theTheme)
          resolve(theTheme)
        }, delay, theme)
      })
    },
    theme: (thisOfComponent, {color = undefined, dark = undefined} = {}) => {
      let update = {}
      let hasValue = false
      if (!pi.isUndefined(color)) {
        hasValue = true
        thisOfComponent.$vuetify.theme.primary = colors[color].base
        Object.assign(update, {color})
      }

      if (!pi.isUndefined(dark)) {
        hasValue = true
        thisOfComponent.$vuetify.dark = dark === 'dark'
        Object.assign(update, {dark})
      }

      if (hasValue) {
        thisOfComponent.$store.commit(SET_THEME, update)
      }
    }
  }

  Vue.prototype.$libra = core
}

export default Libra
