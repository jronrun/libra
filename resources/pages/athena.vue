<template>
  <v-app id="athena">

    <v-navigation-drawer fixed app v-model="drawer" :dark="$vuetify.dark">
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
        <v-layout wrap :style="style.layout">
          <no-ssr>
            <codemirror v-model="code" :options="mirrorOptions" @ready="onMirrorReady">
            </codemirror>
          </no-ssr>
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
  import ThemeSettings from '@/components/ThemeSettings'
  import SettingsFab from '~/components/widgets/SettingsFab'
  import '~/static/mirror/theme/lemon.css'

  let NMAssist
  if (process.browser) {
    ({NMAssist} = require('~/plugins/notemirror'))
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
      style: {
        layout: {
          margin: 0,
          padding: 0
        },
        container: {
          padding: 0,
          margin: 0
        }
      },
      drawer: false,
      themeSettingDrawer: false,
      items: [
        { icon: 'inbox', title: 'Inbox' },
        { icon: 'star', title: 'Starred' },
        { icon: 'send', title: 'Sent mail' },
        { icon: 'drafts', title: 'Drafts' },
        { divider: true },
        { icon: 'mail', title: 'All mail' },
        { icon: 'delete', title: 'Trash' },
        { icon: 'error', title: 'Spam' }
      ]
    }),

    beforeMount() {
      this.$libra.restore(this)
      this.mirrorOptions = NMAssist.getMirrorOptions()
    },

    mounted() {
      this.$libra.restoreTheme(this)
    },

    created () {
      global.getApp = this
      global.getApp.$on('APP_THEME_SETTINGS', () => {
        this.openThemeSettings()
      })
    },

    methods: {
      openThemeSettings () {
        this.$vuetify.goTo(0)
        this.themeSettingDrawer = (!this.themeSettingDrawer)
      },
      onMirrorReady(cm) {
        const mirror = new NMAssist(cm)
        const mirrorW = this.$vuetify.breakpoint.width
        const mirrorH = this.$vuetify.breakpoint.height - this.$refs.header.computedHeight

        mirror.setSize(mirrorW, mirrorH)
        mirror.chgStyle({padding: '8px'})
        mirror.mapPredefineKeys({Esc: 'Ctrl-Esc'})

        this.instance = mirror

        //TODO rem
        window.mirror=mirror
      }
    }

  }
</script>
