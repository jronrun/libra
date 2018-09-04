<template>
  <v-navigation-drawer
    id="appDrawer"
    :mini-variant.sync="mini"
    fixed
    :dark="$vuetify.dark"
    app
    v-model="drawer"
    width="260"
  >
    <v-toolbar color="primary darken-1" dark>
      <img v-bind:src="computeLogo" height="36" alt="Libra of Constellation">
    </v-toolbar>
    <vue-perfect-scrollbar class="drawer-menu--scroll" :settings="scrollSettings">
      <v-list dense expand>
        <template v-for="(item, i) in menus">
          <!--group with subitems-->
          <v-list-group v-if="item.items" :key="item.name" :group="item.group" :prepend-icon="item.icon"
                        no-action="no-action">
            <v-list-tile slot="activator" ripple="ripple">
              <v-list-tile-content>
                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <template v-for="(subItem, i) in item.items">
              <!--sub group-->
              <v-list-group v-if="subItem.items" :key="subItem.name" :group="subItem.group" sub-group="sub-group">
                <v-list-tile slot="activator" ripple="ripple">
                  <v-list-tile-content>
                    <v-list-tile-title>{{ subItem.title }}</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
                <v-list-tile v-for="(grand, i) in subItem.children" :key="i" :to="genChildTarget(item, grand)"
                             :href="grand.href" ripple="ripple">
                  <v-list-tile-content>
                    <v-list-tile-title>{{ grand.title }}</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </v-list-group>
              <!--child item-->
              <v-list-tile v-else :key="i" :to="genChildTarget(item, subItem)" :href="subItem.href"
                           :disabled="subItem.disabled" :target="subItem.target" ripple="ripple">
                <v-list-tile-content>
                  <v-list-tile-title><span>{{ subItem.title }}</span></v-list-tile-title>
                </v-list-tile-content>
                <!-- <v-circle class="white--text pa-0 circle-pill" v-if="subItem.badge" color="red" disabled="disabled">{{ subItem.badge }}</v-circle> -->
                <v-list-tile-action v-if="subItem.action">
                  <v-icon :class="[subItem.actionClass || 'success--text']">{{ subItem.action }}</v-icon>
                </v-list-tile-action>
              </v-list-tile>
            </template>
          </v-list-group>
          <v-subheader v-else-if="item.header" :key="i">{{ item.header }}</v-subheader>
          <v-divider v-else-if="item.divider" :key="i"></v-divider>
          <!--top-level link-->
          <!--<v-list-tile v-else :to="!item.href ? { name: item.name } : null" :href="item.href" ripple="ripple"-->
          <v-list-tile v-else :href="item.href" ripple="ripple"
                       :disabled="item.disabled" :target="item.target" rel="noopener" :key="item.name">
            <v-list-tile-action v-if="item.icon">
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ item.title }}</v-list-tile-title>
            </v-list-tile-content>
            <!-- <v-circle class="white--text pa-0 chip--x-small" v-if="item.badge" :color="item.color || 'primary'" disabled="disabled">{{ item.badge }}</v-circle> -->
            <v-list-tile-action v-if="item.subAction">
              <v-icon class="">{{ item.subAction }}</v-icon>
            </v-list-tile-action>
            <!-- <v-circle class="caption blue lighten-2 white--text mx-0" v-else-if="item.chip" label="label" small="small">{{ item.chip }}</v-circle> -->
          </v-list-tile>
        </template>
      </v-list>
    </vue-perfect-scrollbar>
  </v-navigation-drawer>
</template>
<script>
  const Menu = [
    {header: 'Apps'},
    {
      title: 'Dashboard',
      group: 'apps',
      icon: 'dashboard',
      name: 'Dashboard',
    },
    {
      title: 'Chat',
      group: 'apps',
      icon: 'chat_bubble',
      target: '_blank',
      name: 'Chat',
    },
    {
      title: 'Inbox',
      group: 'apps',
      name: 'Mail',
      target: '_blank',
      icon: 'email',
    },
    {
      title: 'Media',
      group: 'apps',
      name: 'Media',
      icon: 'perm_media',
    },
    {
      title: 'Widgets',
      group: 'widgets',
      component: 'widgets',
      icon: 'widgets',
      items: [
        {name: 'social', title: 'Social', component: 'components/social'},
        {name: 'statistic', title: 'Statistic', badge: 'new', component: 'components/statistic'},
        {name: 'chart', title: 'Chart', component: 'components/chart'},
        {name: 'list', title: 'List', component: 'components/widget-list'},
        // { name: 'post', title: 'Post', component: 'components/widget-post' },
      ]
    },
    {header: 'UI Elements'},
    {
      title: 'General',
      group: 'components',
      component: 'components',
      icon: 'tune',
      items: [
        {name: 'alerts', title: 'Alerts', component: 'components/alerts'},
        {name: 'avatars', title: 'Avatars', component: 'components/avatars'},
        {name: 'badges', title: 'Badges', component: 'components/badges'},
        {name: 'buttons', title: 'Buttons', component: 'components/buttons'},
        {name: 'cards', title: 'Cards', component: 'components/cards'},
        {name: 'carousels', title: 'Carousels', component: 'components/carousels'},
        {name: 'chips', title: 'Chips', component: 'components/chips'},
        {name: 'dialogs', title: 'Dialogs', component: 'components/dialogs'},
        {name: 'icons', title: 'Icons', component: 'components/icons'},
        {name: 'tables', title: 'Data Tables', component: 'components/tables'},
        {name: 'parallax', title: 'Parallax  image', component: 'components/parallax'},
        {name: 'snackbar', title: 'Snackbar', component: 'components/snackbar'},
        {name: 'progress', title: 'Progress', component: 'components/progress'},
        {name: 'slider', title: 'Slider', component: 'components/sliders'},
        {name: 'tooltip', title: 'Tooltip', component: 'components/tooltips'},
        {name: 'pagination', title: 'Pagination', component: 'components/paginations'},
        {name: 'typography', title: 'Typography', component: 'components/typography'},
        {name: 'color', title: 'Color', component: 'components/color'},

      ]
    },
    {
      title: 'Pickers',
      group: 'pickers',
      component: 'picker',
      icon: 'filter_vintage',
      items: [
        {name: 'timepicker', title: 'Timepicker', component: 'pickers/timepicker'},
        {name: 'datepicker', title: 'Datepicker', component: 'pickers/datepicker'},

      ]
    },
    {
      title: 'Layout',
      group: 'layout',
      component: 'layout',
      icon: 'view_compact',
      items: [
        {name: 'bottom-sheets', title: 'Bottom panels', component: 'components/bottom-sheets'},
        {name: 'expansion-panels', title: 'Expansion panels', component: 'components/expansion-panels'},
        {name: 'footer', title: 'Footer', component: 'components/footer'},
        {name: 'lists', title: 'Lists', component: 'components/lists'},
        {name: 'jumbotrons', title: 'Jumbotrons', badge: 'new', component: 'components/jumbotrons'},
        {name: 'menus', title: 'Menus', component: 'components/menus'},
        // { name: 'navigation-drawers', title: 'Navigation drawers', component: 'components/navigation-drawers' },
        {name: 'tabs', title: 'Tabs', component: 'components/tabs'},
        {name: 'toolbar', title: 'Toolbars', component: 'components/toolbar'},
        {name: 'timeline', title: 'Timeline', component: 'components/timeline'},
      ]
    },
    {
      title: 'Forms & Controls',
      group: 'forms',
      component: 'forms',
      icon: 'edit',
      items: [
        {name: 'basic', title: 'General', component: 'components/basic-forms'},
        {name: 'selects', title: 'Selects', badge: 'new', component: 'components/selects'},
        {name: 'selection-controls', title: 'Selection Controls', component: 'components/selection-controls'},
        {name: 'text-fields', title: 'Text Fields', component: 'components/text-fields'},
        {name: 'steppers', title: 'Steppers', component: 'components/steppers'},
        {name: 'editors', title: 'Editors', component: 'components/editors'},
      ]
    },
    {divider: true},
    {header: 'Extras'},
    {
      title: 'Pages',
      group: 'extra',
      icon: 'list',
      items: [
        {name: 'Login', title: 'Login', component: 'Login'},
        {name: '404', title: '404', component: 'NotFound'},
        {name: '403', title: '403', component: 'AccessDenied'},
        {name: '500', title: '500', component: 'ServerError'},
      ]
    },
  ];
  // reorder menu
  Menu.forEach((item) => {
    if (item.items) {
      item.items.sort((x, y) => {
        let textA = x.title.toUpperCase();
        let textB = y.title.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
    }
  });

  import VuePerfectScrollbar from '~/plugins/scrollbar'

  export default {
    name: 'app-drawer',
    components: {
      VuePerfectScrollbar,
    },
    props: {
      expanded: {
        type: Boolean,
        default: true
      },
    },
    data: () => ({
      mini: false,
      drawer: true,
      menus: Menu,
      scrollSettings: {
        maxScrollbarLength: 160
      }
    }),
    computed: {
      computeGroupActive() {
        return true;
      },
      computeLogo() {
        return '/logo.png';
      },

      sideToolbarColor() {
        return this.$vuetify.options.extra.sideNav;
      }
    },
    created() {
      global.getApp.$on('APP_DRAWER_TOGGLED', () => {
        this.drawer = (!this.drawer);
      });
    },

    methods: {
      genChildTarget(item, subItem) {
        // if (subItem.href) {
        //   return;
        // }
        // if (subItem.component) {
        //   return {
        //     name: subItem.component,
        //   };
        // }
        // return {name: `${item.group}/${(subItem.name)}`};
      },
    }
  };
</script>


<style lang="stylus">
  // @import '../../node_modules/vuetify/src/stylus/settings/_elevations.styl';

  #appDrawer
    overflow: hidden
    .drawer-menu--scroll
      height: calc(100vh - 48px)
      overflow: auto

</style>
