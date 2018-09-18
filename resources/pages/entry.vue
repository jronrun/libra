<template>
  <div :id="preview" style="overflow: hidden;"></div>
</template>

<script>
  import pi from '~pi'
  import 'perfect-scrollbar/css/perfect-scrollbar.css'
  import PerfectScrollbar from 'perfect-scrollbar'

  let MarkdownAssist
  let highlights
  let IFrames
  if (process.browser) {
    (
      { highlights } = require('~/plugins/highlights'),
        // MarkdownAssist = require('~/assets/MarkdownAssist').default,
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

    created() {
      if (process.browser) {
        this.$nextTick(() => {
          this.$nuxt.$loading.start()
        })
      }
    },

    methods: {
      importTest() {
        import('~/assets/MarkdownAssist').then((module)=>{
          const b = module.default;
          console.log(b)
        })
      },
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
      },

      previewInput({input, mode, theme}) {
        if (pi.isURL(input)) {
          IFrames.getInstance().openUrl(input)
          return
        }

        const that = this
        this.text = highlights({
          input, mode, theme,
          callback: (result, elId) => {
            pi.query(`#${that.preview}`).innerHTML = result
            that.scrollCtxId = elId
            that.scrolling()
          }
        })
      }
    },

    mounted() {
      const that = this

      IFrames.registers({
        REFRESH: (evtName, evtData) => {
          const input = evtData.content
          const mode = evtData.mode.mime || evtData.mode.name
          const theme = evtData.theme
          that.previewInput({input, mode, theme})
        }
      })

      if (process.browser) {
        this.$nextTick(() => {
          this.$nuxt.$loading.finish()
        })
      }

      //TODO rem
      global.ee = this
    }
  }
</script>
