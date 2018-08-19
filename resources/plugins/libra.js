import pi from '~pi'

const Libra = () => {}

export const libra_key = 'libra'

Libra.install = function (Vue, options) {

  Vue.prototype.$libra = {

    /**
     * Restore previous data
     * <pre>
     * beforeMount() {
     *  this.$libra.restore(this)
     * }
     * </pre>
     * @param thisOfComponent
     */
    restore: (thisOfComponent) => {
      let data = pi.store(libra_key)
      thisOfComponent.$i18n.change(data.locale, thisOfComponent)
    }

  }

}

export default Libra
