<template>
  <v-app id="athena">

    <v-navigation-drawer fixed app v-model="drawer" :dark="$vuetify.dark" ref="drawer">
      <v-img :aspect-ratio="16/9" src="/bg/34.jpg">
        <v-layout pa-2 column fill-height class="lightbox white--text">
          <v-spacer></v-spacer>
          <v-flex shrink>
            <div class="subheading"><img src="/logo.png" height="40"/></div>
            <!--<div class="body-1">&nbsp;&nbsp;{{$t('libra.title')}}</div>-->
          </v-flex>
        </v-layout>
      </v-img>

      <v-list>
        <template v-for="(item, i) in items">
          <v-divider v-if="item.divider" :key="i"></v-divider>
          <v-list-tile v-else :key="item.title" @click>
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
          </v-list-tile>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar color="primary" fixed :dark="$vuetify.dark" app ref="header" height="50">
      <v-toolbar-side-icon dark @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-spacer></v-spacer>
    </v-toolbar>

    <v-content>
      <!--https://stackoverflow.com/questions/51181726/vuetify-container-max-width-fixed-->
      <v-container fill-height fluid ma-0 pa-0 :style="style.container">
        <v-layout wrap :style="style.layout" v-resize="onResize">

          <v-flex v-show="leftFlex.visible"
                  :xs6="leftFlex.xs6"
                  :xs12="leftFlex.xs12"
                  :style="style.flex" ref="flex_mirror">
            <v-card :style="style.card">
              <no-ssr>
                <codemirror v-model="code" :options="mirrorOptions" @ready="onMirrorReady">
                </codemirror>
              </no-ssr>
            </v-card>
          </v-flex>

          <v-flex v-show="rightFlex.visible"
                  :xs6="rightFlex.xs6"
                  :xs12="rightFlex.xs12"
                  :style="style.flex" ref="flex_view">
            <v-card :style="style.card" :width="flexViewWidth" :id="flexViewCardId">

            </v-card>
          </v-flex>

        </v-layout>
      </v-container>
    </v-content>

    <settings-fab></settings-fab>

    <v-navigation-drawer class="setting-drawer" temporary right v-model="themeSettingDrawer" hide-overlay fixed>
      <theme-settings></theme-settings>
    </v-navigation-drawer>
  </v-app>
</template>

<script>
  import pi from '~pi'
  import ThemeSettings from '@/components/ThemeSettings'
  import SettingsFab from '~/components/widgets/SettingsFab'

  let IFrames
  let MarkdownAssist

  let NMAssist
  let NMAssistDirective
  if (process.browser) {
    (
      {NMAssist, NMAssistDirective} = require('~/plugins/notemirror'),
      MarkdownAssist = require('~/assets/MarkdownAssist').default,
      IFrames = require('~/assets/IFrames').default
    )

    NMAssist.requireTheme('lemon')
  }

  const RESTORE_KEY = 'mirror_restore_data'
  const doCompose = (target, visible = false, xs6 = false, xs12 = false) => {
    target.visible = visible
    target.xs6 = xs6
    target.xs12 = xs12
  }

  export default {
    layout: 'blank',
    components: {
      SettingsFab,
      ThemeSettings
    },
    data: () => ({
      instance: null,
      frameInstance: null,
      code: '',
      mirrorOptions: null,
      flexViewCardId: 'flexViewCard',
      leftFlex: {
        visible: true,
        xs6: false,
        xs12: true
      },
      rightFlex: {
        visible: false,
        xs6: false,
        xs12: false
      },
      flexViewWidth: 0,
      style: {
        layout: {
          margin: 0,
          padding: 0
        },
        container: {
          padding: 0,
          margin: 0
        },
        flex: {
          padding: 0
        },
        card: {
          overflow: 'hidden',
          'box-shadow': 'none',
          height: '100%'
        }
      },
      drawer: false,
      themeSettingDrawer: false,
      items: [
        {icon: 'inbox', title: 'Inbox'},
        {icon: 'star', title: 'Starred'},
        {icon: 'send', title: 'Sent mail'},
        {icon: 'drafts', title: 'Drafts'},
        {divider: true},
        {icon: 'mail', title: 'All mail'},
        {icon: 'delete', title: 'Trash'},
        {icon: 'error', title: 'Spam'}
      ]
    }),

    beforeMount() {
      this.$libra.restore(this)
      this.mirrorOptions = NMAssist.getMirrorOptions()
    },

    mounted() {
      this.$libra.restoreTheme(this)
      IFrames.registers({

      })

      this.frameInstance = IFrames.create({}, `#${this.flexViewCardId}`)
      this.frameInstance.openUrl('/entry')
    },

    created() {
      global.getApp = this
      global.getApp.$on('APP_THEME_SETTINGS', () => {
        this.openThemeSettings()
      })
    },

    computed:{

    },

    methods: {
      // 1 left flex full, 2 half left & half right, 3 right flex full
      compose(type = 1) {
        switch (type) {
          case 1:
            doCompose(this.leftFlex, true, false, true)
            doCompose(this.rightFlex, false)
            break
          case 2:
            doCompose(this.leftFlex, true, true, false)
            doCompose(this.rightFlex, true, true, false)
            break
          case 3:
            doCompose(this.leftFlex, false)
            doCompose(this.rightFlex, true, false, true)
            break
        }

        pi.delay(() => this.handleResize(), 300)

        if (1 !== type) {
          this.syncPreview({data: this.instance.state()})
        }
      },
      onResize() {
        pi.debounce(this.handleResize, 300, {maxWait: 500})()
      },
      handleResize() {
        this.handleMirrorResize()
        this.handlePreviewResize()
      },
      handlePreviewResize() {
        if (this.rightFlex.visible) {
          const breakpoint = this.$vuetify.breakpoint
          if (this.rightFlex.xs6) {
            let previewW = breakpoint.width - ((this.$refs.flex_mirror || {}).clientWidth || 0)
            if (this.drawer && !this.$refs.drawer.showOverlay) {
              previewW = previewW - this.$refs.drawer.calculatedWidth
            }

            this.flexViewWidth = previewW
          } else if (this.rightFlex.xs12) {
            this.flexViewWidth = breakpoint.width
          }
        }
      },
      handleMirrorResize() {
        if (this.instance && this.leftFlex.visible) {
          const breakpoint = this.$vuetify.breakpoint

          let mirrorW = breakpoint.width - ((this.$refs.flex_view || {}).clientWidth || 0)
          if (this.drawer && !this.$refs.drawer.showOverlay) {
            mirrorW = mirrorW - this.$refs.drawer.calculatedWidth
          }

          const mirrorH = breakpoint.height - this.$refs.header.computedHeight
          this.instance.setSize(mirrorW, mirrorH)
        }
      },
      openThemeSettings() {
        this.$vuetify.goTo(0)
        this.themeSettingDrawer = (!this.themeSettingDrawer)
      },
      syncPreview({data}) {
        if (this.rightFlex) {
          this.frameInstance.tellEvent('REFRESH', data)
        }
      },
      onMirrorReady(cm) {
        const mirror = new NMAssist(cm)
        mirror.chgStyle({padding: '8px'})
        mirror.mapPredefineKeys({Esc: 'Ctrl-Esc'})

        this.instance = mirror
        this.handleMirrorResize()
        this.initRestore()
        this.initDirectives()
        this.instance.setNotifyContentHandle(this.syncPreview)

        //TODO rem
        global.tt=this
        global.MarkdownAssist = MarkdownAssist
        global.IFrames = IFrames
      },

      setText(txt) {
        this.instance.val(pi.unsign(txt))
      },
      previewTexts(){
        this.compose(3)
        let previewInstance = new MarkdownAssist(this.instance)
        let text = previewInstance.render(this.instance.val())
        this.frameInstance.write(text)
      },

      initRestore() {
        let that = this
        this.instance.state(pi.store(RESTORE_KEY))

        global.onbeforeunload = () => {
          pi.store(RESTORE_KEY, that.instance.state())
        }
      },
      initDirectives() {
        const assistDirective = new NMAssistDirective(this.instance)
        assistDirective.registerHandle({
          w: function (args, cm) {
            alert(JSON.stringify(args))
            this.w(args,cm)
          }
        })

        assistDirective.register('test', false, function (args, cm) {
          alert('test')
          this.w(args,cm)
        })

      }
    }

  }
</script>
