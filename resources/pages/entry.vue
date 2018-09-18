<template>
  <div :id="preview" style="overflow: hidden;"></div>
</template>

<script>
  import pi from '~pi'
  import 'perfect-scrollbar/css/perfect-scrollbar.css'
  import PerfectScrollbar from 'perfect-scrollbar'

  let highlights
  let IFrames
  if (process.browser) {
    (
      { highlights } = require('~/plugins/highlights'),
      IFrames = require('~/assets/IFrames').default
    )
  }

  export default {
    layout: 'blank',
    data: () => ({
      preview: 'preview',
      scrollCtxId: null,
      perfectScroll: null,
    }),

    methods: {
      scrolling() {
        if (this.perfectScroll) {
          this.perfectScroll.update()
        } else {
          const scrollContainer = pi.query(this.scrollCtxId)
          this.perfectScroll = new PerfectScrollbar(scrollContainer, {
            maxScrollbarLength: 160
          })

          scrollContainer.addEventListener('ps-scroll-y', (evt) => {

          })

        }
      }
    },

    mounted() {
      const that = this

      IFrames.registers({
        REFRESH: (evtName, evtData) => {
          that.text = highlights({
            input: evtData.content,
            mode: evtData.mode.mime || evtData.mode.name,
            theme: evtData.theme,
            callback: (result, elId) => {
              pi.query(`#${that.preview}`).innerHTML = result
              that.scrollCtxId = elId
              that.scrolling()
            }
          })
        }
      })
    }
  }
</script>
