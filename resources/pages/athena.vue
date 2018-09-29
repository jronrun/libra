<template>
  <v-app id="athena">

    <v-navigation-drawer fixed app v-model="drawer" :dark="$vuetify.dark" ref="drawer">
      <v-img :aspect-ratio="16/9" src="/bg/7.jpg">
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

    <v-toolbar :manual-scroll="toolbarHidden" color="primary" fixed :dark="$vuetify.dark" app ref="header" height="50">
      <v-toolbar-side-icon dark @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-spacer></v-spacer>

      <v-btn icon dark :loading="composeInfo.loading" @click="toggleCompose">
          <v-icon>{{composeInfo.icon}}</v-icon>
      </v-btn>

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
            <v-card :style="style.card" :width="flexViewWidth" :height="flexViewHeight" :id="flexViewCardId">

            </v-card>
          </v-flex>

        </v-layout>
      </v-container>
    </v-content>

    <settings-fab :buttons="settingsButtons"></settings-fab>

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
  let NMAssist
  let NMAssistDirective
  if (process.browser) {
    (
      {NMAssist, NMAssistDirective} = require('~/plugins/notemirror'),
      IFrames = require('~/assets/IFrames').default
    )

    NMAssist.requireTheme('lemon')
  }

  const RESTORE_KEY = 'athena'
  const doCompose = (target, visible = false, xs6 = false, xs12 = false) => {
    target.visible = visible
    target.xs6 = xs6
    target.xs12 = xs12
  }

  const ATHENA_TOOLBAR_EVENT = 'ATHENA_TOOLBAR'
  const ATHENA_DRAWER_EVENT = 'ATHENA_DRAWER'
  const ATHENA_PREVIEW_EVENT = 'ATHENA_PREVIEW'

  const INPUT_READ_NOTIFY = {
    OPEN: 2, CLOSE: 3
  }

  // 1 left flex full, 2 half left & half right, 3 right flex full
  const COMPOSE_TYPE = {
    EDITOR: 1, PREVIEW: 2, VIEW: 3
  }

  const defaultComposeType = COMPOSE_TYPE.EDITOR
  const composeIcons = ['edit', 'visibility', 'aspect_ratio']
  const nextComposeType = (type) => {
    return ((type + 1) > 3) ? 1 : (type + 1)
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
      toolbarHidden: false,
      settingsButtons: [
        {
          event: ATHENA_TOOLBAR_EVENT,
          color: 'purple',
          icon: 'web_asset',
          label: 'button.toggle.toolbar'
        },
        {
          event: ATHENA_DRAWER_EVENT,
          color: 'cyan',
          icon: 'menu',
          label: 'button.toggle.menu'
        },
        {
          event: ATHENA_PREVIEW_EVENT,
          color: 'teal',
          icon: 'visibility',
          label: 'button.toggle.preview'
        }
      ],
      composeInfo: {
        type: defaultComposeType,
        icon: composeIcons[defaultComposeType],
        loading: false
      },
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
      flexViewHeight: 0,
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
          'box-shadow': 'none'
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

      const that = this
      IFrames.registers({
        LINE_COUNT: () => {
          return {
            linesCount: that.instance.lineCount()
          }
        }
      })

      this.frameInstance = IFrames.create({
        scrolling: 'no'
      }, `#${this.flexViewCardId}`)
    },

    created() {
      if (process.browser) {
        this.$nextTick(() => {
          this.$nuxt.$loading.start()
        })
      }

      global.getApp = this
      global.getApp.$on('APP_THEME_SETTINGS', () => {
        this.openThemeSettings()
      })

      global.getApp.$on(ATHENA_TOOLBAR_EVENT, () => {
        this.toggleToolbar()
      })

      global.getApp.$on(ATHENA_DRAWER_EVENT, () => {
        this.drawer = !this.drawer
      })

      global.getApp.$on(ATHENA_PREVIEW_EVENT, () => {
        this.toggleCompose()
      })
    },

    computed:{

    },

    methods: {
      toggleToolbar() {
        this.toolbarHidden = !this.toolbarHidden
        pi.delay(() => this.handleResize(), 400)
      },
      toggleCompose() {
        this.composeInfo.loading = true
        this.composeInfo.type = nextComposeType(this.composeInfo.type)

        this.composeInfo.icon = composeIcons[nextComposeType(this.composeInfo.type) - 1]
        this.compose(this.composeInfo.type)
        pi.delay(() => this.composeInfo.loading = false, 600)
      },
      compose(type = COMPOSE_TYPE.EDITOR) {
        switch (type) {
          case COMPOSE_TYPE.EDITOR:
            doCompose(this.leftFlex, true, false, true)
            doCompose(this.rightFlex, false)
            break
          case COMPOSE_TYPE.PREVIEW:
            doCompose(this.leftFlex, true, true, false)
            doCompose(this.rightFlex, true, true, false)
            break
          case COMPOSE_TYPE.VIEW:
            doCompose(this.leftFlex, false)
            doCompose(this.rightFlex, true, false, true)
            break
        }

        this.composeInfo.type = type
        pi.delay(() => this.handleResize(), 300)

        if (COMPOSE_TYPE.EDITOR !== type) {
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

          let theH = breakpoint.height
          if (!this.toolbarHidden) {
            theH -= this.$refs.header.computedHeight
          }
          this.flexViewHeight = theH
        }
      },
      handleMirrorResize() {
        if (this.instance && this.leftFlex.visible) {
          const breakpoint = this.$vuetify.breakpoint

          let mirrorW = breakpoint.width - ((this.$refs.flex_view || {}).clientWidth || 0)
          if (this.drawer && !this.$refs.drawer.showOverlay) {
            mirrorW = mirrorW - this.$refs.drawer.calculatedWidth
          }

          let mirrorH = breakpoint.height
          if (!this.toolbarHidden) {
            mirrorH -= this.$refs.header.computedHeight
          }
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
      scrollMdToPv() {
        if (COMPOSE_TYPE.PREVIEW === this.composeInfo.type) {
          this.frameInstance.tellEvent('SCROLL_MD_TO_PV', this.instance.visibleLines())
        }
      },
      onMirrorReady(cm) {
        const scroll = pi.debounce(this.scrollMdToPv, 50, {maxWait: 100})
        const mirror = new NMAssist(cm, {
          scroll
        })

        mirror.chgStyle({padding: '8px'})
        mirror.mapPredefineKeys({Esc: 'Ctrl-Esc'})

        this.instance = mirror
        this.handleMirrorResize()
        this.initRestore()
        this.initDirectives()
        this.instance.setNotifyContentHandle(this.syncPreview)
        this.instance.inputReadNotifyTgl(INPUT_READ_NOTIFY.OPEN)

        //TODO rem
        global.tt=this
        global.IFrames = IFrames
        global.pi=pi
        global.NMAssist = NMAssist
      },

      initRestore() {
        let that = this

        const data = pi.store(RESTORE_KEY)
        this.instance.state(data.entry)
        this.drawer = data.drawer
        this.toolbarHidden = data.toolbarHidden

        this.frameInstance.openUrl('/entry', () => {
          if (that.composeInfo.type !== data.composeType) {
            that.compose(data.composeType)
          }

          if (process.browser) {
            that.$nuxt.$loading.finish()
          }
        })

        global.onbeforeunload = () => {
          pi.store(RESTORE_KEY, {
            drawer: that.drawer,
            composeType: that.composeInfo.type,
            toolbarHidden: that.toolbarHidden,
            entry: that.instance.state()
          })
        }
      },
      initDirectives() {
        const that = this
        const assistDirective = new NMAssistDirective(this.instance)
        assistDirective.registerHandle({
          menu: function (args, cm) {
            that.toggleToolbar()
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
