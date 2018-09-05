<template>
  <v-toolbar color="primary" fixed dark app>
    <v-toolbar-side-icon @click.stop="handleDrawerToggle"></v-toolbar-side-icon>

    <v-spacer></v-spacer>
    <v-btn icon @click="handleFullScreen()">
      <v-icon>fullscreen</v-icon>
    </v-btn>

    <v-btn icon @click="handleThemeSettings()">
      <v-icon>color_lens</v-icon>
    </v-btn>

    <v-menu offset-y>
      <v-btn icon dark slot="activator">
        <v-tooltip bottom>
          <v-icon dark slot="activator">language</v-icon>
          <span>{{$t("libra.language")}}</span>
        </v-tooltip>
      </v-btn>
      <v-list>
        <v-list-tile
          v-for="lang in locales"
          :key="lang.value"
          @click="handleLocale(lang.value)"
        >
          <v-list-tile-title>{{lang.name}}</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>

    <v-menu offset-y origin="center center" class="elelvation-1" :nudge-bottom="14" transition="scale-transition">
      <v-btn icon flat slot="activator">
        <v-badge color="red" overlap>
          <span slot="badge">3</span>
          <v-icon medium>notifications</v-icon>
        </v-badge>
      </v-btn>
      <notification-list>
      </notification-list>
    </v-menu>

    <v-menu offset-y origin="center center" :nudge-bottom="10" transition="scale-transition">
      <v-btn icon large flat slot="activator">
        <v-avatar size="30px">
          <v-icon medium>person</v-icon>
        </v-avatar>
      </v-btn>

      <v-list class="pa-0">
        <v-list-tile v-for="(item,index) in items" :to="!item.href ? { name: item.name } : null" :href="item.href"
                     @click="item.click" ripple="ripple" :disabled="item.disabled" :target="item.target" rel="noopener"
                     :key="index">
          <v-list-tile-action v-if="item.icon">
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>

    </v-menu>
  </v-toolbar>
</template>

<script>
  import pi from '~pi'
  import NotificationList from '@/components/widgets/list/NotificationList'

  export default {
    name: 'app-toolbar',
    components: {
      NotificationList
    },
    data: () => ({
      locales: [],
      items: [
        {
          icon: 'account_circle',
          href: '#',
          title: 'Profile',
          click: (e) => {
            console.log(e)
          }
        },
        {
          icon: 'settings',
          href: '#',
          title: 'Settings',
          click: (e) => {
            console.log(e)
          }
        },
        {
          icon: 'fullscreen_exit',
          href: '#',
          title: 'Logout',
          click: (e) => {
            global.getApp.$emit('APP_LOGOUT')
          }
        }
      ],
    }),
    created() {
      this.locales = this.$store.state.locales
    },
    computed: {
      toolbarColor() {
        return this.$vuetify.options.extra.mainNav
      }
    },
    methods: {
      handleDrawerToggle() {
        global.getApp.$emit('APP_DRAWER_TOGGLED')
      },
      handleFullScreen() {
        pi.toggleFullScreen()
      },
      handleLocale(aLocale) {
        this.$i18n.change(aLocale)
      },
      handleThemeSettings() {
        global.getApp.$emit('APP_THEME_SETTINGS')
      }
    }
  }
</script>
