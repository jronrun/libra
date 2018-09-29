<template>
  <div :id="preview" style="overflow: hidden;position: absolute;" v-resize="onResize"></div>
</template>

<script>
  import pi from '~pi'
  import 'perfect-scrollbar/css/perfect-scrollbar.css'
  import PerfectScrollbar from 'perfect-scrollbar'

  let CompileAssist
  let MarkdownPreviewAssist
  let IFrames
  let CMAssist
  if (process.browser) {
    (
      { CMAssist } = require('~/plugins/highlights'),
      MarkdownPreviewAssist = require('~/assets/MarkdownPreviewAssist').default,
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

  const defaultHandle = async (input, {modeName, theme}) => {
    return await CMAssist.getHighlight(Object.assign({}, CMAssistHighlightOptions, {
      input, mode: modeName, theme
    }))
  }

  export default {
    layout: 'blank',
    data: () => ({
      preview: 'preview',
      scrollCtxId: null,
      perfectScroll: null,
      compileInstance: null,
      previewInstance: null
    }),

    created() {
      if (process.browser) {
        this.$nextTick(() => {
          this.$nuxt.$loading.start()
        })
      }
    },

    methods: {
      onResize() {
        pi.debounce(this.handleResize, 300, {maxWait: 500})()
      },
      handleResize() {
        const breakpoint = this.$vuetify.breakpoint
        pi.styles(`#${this.preview}`,{
          width: `${breakpoint.width}px`,
          height: `${breakpoint.height}px`
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

        pi.query(`#${this.preview}`).innerHTML = result.compiled
        this.scrolling()
        this.previewInstance.buildScrollMap()
      }
    },

    mounted() {
      const that = this
      this.scrollCtxId = `#${this.preview}`
      this.compileInstance = new CompileAssist({defaultHandle})
      this.previewInstance = new MarkdownPreviewAssist({
        selector: this.scrollCtxId,
        IFrames
      })

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
      global.PerfectScrollbar=PerfectScrollbar
    }
  }
</script>
