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
      <v-container fill-height :style="style.container">
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
            <v-card :style="style.card" :width="flexViewWidth">
                aaa
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
  import '~/static/mirror/theme/lemon.css'

  let NMAssist
  if (process.browser) {
    ({NMAssist} = require('~/plugins/notemirror'))
  }

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
      code: '',
      mirrorOptions: null,
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
    },

    created() {
      global.getApp = this
      global.getApp.$on('APP_THEME_SETTINGS', () => {
        this.openThemeSettings()
      })
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
            let previewW = breakpoint.width - ((this.$refs.flex_mirror || {}).width || 0)
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

          let mirrorW = breakpoint.width - ((this.$refs.flex_view || {}).width || 0)
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
      onMirrorReady(cm) {
        const mirror = new NMAssist(cm)

        mirror.chgStyle({padding: '8px'})
        mirror.mapPredefineKeys({Esc: 'Ctrl-Esc'})

        this.instance = mirror
        this.handleMirrorResize()

        //TODO rem
        window.tt=this
      }
    },

    watch: {
    }

  }
</script>
