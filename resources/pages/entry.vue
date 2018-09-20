<template>
  <div :id="preview" style="overflow: hidden;"></div>
</template>

<script>
  import pi from '~pi'
  import 'perfect-scrollbar/css/perfect-scrollbar.css'
  import PerfectScrollbar from 'perfect-scrollbar'

  let CompileAssist
  let MarkdownAssist
  let highlights
  let IFrames
  let CMAssist
  if (process.browser) {
    (
      { CMAssist, highlights } = require('~/plugins/highlights'),
      // MarkdownAssist = require('~/assets/MarkdownAssist').default,
      CompileAssist = require('~/assets/CompileAssist').default,
      IFrames = require('~/assets/IFrames').default
    )
  }

  const CMAssistHighlightOptions = {
    styles: {
      margin: 0,
      padding: '1rem',
      overflow: 'auto',
      position: 'relative',
      height: '100%',
      width: '100%'
    }
  }

  export default {
    layout: 'blank',
    data: () => ({
      preview: 'preview',
      scrollCtxId: null,
      perfectScroll: null,
      compileInstance: null
    }),

    created() {
      if (process.browser) {
        this.$nextTick(() => {
          this.$nuxt.$loading.start()
        })
      }
    },

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
      },

      async previewInput({input, mode, theme}) {
        const modeInfo = CMAssist.langInfo(mode) || {}

        const result = await this.compileInstance.compile({
          input,
          modeName: modeInfo.name,
          theme
        }, {
          render: IFrames.getInstance(),
          markdownOptions: {
            CMAssist,
            CMAssistHighlightOptions
          }
        })

        pi.query(`#${this.preview}`).innerHTML = result

        // const that = this
        // this.text = highlights({
        //   input, mode, theme,
        //   callback: (result, elId) => {
        //     pi.query(`#${that.preview}`).innerHTML = result
        //     that.scrollCtxId = elId
        //     that.scrolling()
        //   }
        // })
      }
    },

    mounted() {
      const that = this
      this.compileInstance = new CompileAssist()

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
      global.pi=pi
    }
  }
</script>
