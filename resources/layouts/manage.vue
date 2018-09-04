<template>
  <v-app id="libra" class="app">
    <app-drawer></app-drawer>
    <app-toolbar></app-toolbar>
    <v-content>
      <div class="page-wrapper">
        <nuxt/>
      </div>

      <v-footer height="auto" class="white pa-3" absolute>
        <span class="caption">{{$t('libra.title')}} &copy {{ new Date().getFullYear() }}</span>
        <v-spacer></v-spacer>
        <img src="/logo.png" height="25"/>
      </v-footer>

    </v-content>

    <!-- Go to top -->
    <app-fab></app-fab>

    <!-- theme setting -->
    <v-btn small fab dark falt fixed top="top" right="right" class="setting-fab" color="red" @click="openThemeSettings">
      <v-icon>settings</v-icon>
    </v-btn>
    <v-navigation-drawer
      class="setting-drawer"
      temporary
      right
      v-model="themeSettingDrawer"
      hide-overlay
      fixed
    >
      <theme-settings></theme-settings>
    </v-navigation-drawer>
  </v-app>
</template>

<script>
  import AppToolbar from '@/components/AppToolbar'
  import ThemeSettings from '@/components/ThemeSettings'
  import AppFab from '@/components/AppFab'
  import AppDrawer from '@/components/AppDrawer'

  export default {
    components: {
      AppDrawer,
      AppToolbar,
      AppFab,
      ThemeSettings
    },
    data: () => ({
      expanded: true,
      themeSettingDrawer: false,
      snackbar: {
        show: false,
        text: '',
        color: '',
      }
    }),

    computed: {

    },

    created () {
      global.getApp = this
    },
    methods: {
      openThemeSettings () {
        this.$vuetify.goTo(0)
        this.themeSettingDrawer = (!this.themeSettingDrawer)
      }
    },

  }
</script>


<style lang="stylus" scoped>
  .page-wrapper
    min-height: calc(100vh - 64px - 50px - 81px);

  .setting-fab
    top: 50% !important;
    right: 0;
    border-radius: 0;

</style>
