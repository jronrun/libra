<template>
  <div id="settings-fab">
    <v-speed-dial
      v-model="fab"
      :top="top"
      :bottom="bottom"
      :right="right"
      :left="left"
      :direction="direction"
      :open-on-hover="hover"
      :transition="transition"
      style="z-index: 50000;"
    >

      <v-btn slot="activator" v-model="fab" color="primary" dark fab small>
        <v-icon>flash_on</v-icon>
        <v-icon>close</v-icon>
      </v-btn>

      <v-tooltip left>
        <v-btn fab dark small color="green" @click="localesDialog = !localesDialog" slot="activator">
          <v-icon>language</v-icon>
        </v-btn>
        <span>{{$t('libra.language')}}</span>
      </v-tooltip>

      <v-tooltip left>
        <v-btn fab dark small color="indigo" @click="handleThemeSettings()" slot="activator">
          <v-icon>color_lens</v-icon>
        </v-btn>
        <span>{{$t('libra.theme')}}</span>
      </v-tooltip>

      <v-tooltip left>
        <v-btn fab dark small color="red" @click="handleFullScreen()" slot="activator">
          <v-icon>fullscreen</v-icon>
        </v-btn>
        <span>{{$t('libra.fullscreen')}}</span>
      </v-tooltip>

      <v-tooltip left v-for="item in buttons" :key="item.event">
        <v-btn fab dark small :color="item.color" @click="handleButton(item.event)" slot="activator">
          <v-icon>{{item.icon}}</v-icon>
        </v-btn>
        <span>{{$t(item.label)}}</span>
      </v-tooltip>

    </v-speed-dial>

    <v-dialog v-model="localesDialog" max-width="300px">
      <v-card>
        <v-card-title>
          <span class="headline">{{$t('libra.language')}}</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex>
                <v-select
                  v-model="localesSelected"
                  :items="locales"
                  item-text="name"
                  item-value="value"
                  label="Select"
                  persistent-hint
                  return-object
                  single-line
                  @change="handleLocale"
                ></v-select>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat @click.native="localesDialog = false">{{$t('button.close')}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>

</template>

<script>
  import pi from '~pi'

  export default {
    data: () => ({
      localesSelected: [],
      locales: [],
      localesDialog: false,

      direction: 'top',
      fab: false,
      fling: false,
      hover: true,
      tabs: null,
      top: false,
      right: true,
      bottom: true,
      left: false,
      transition: 'slide-y-reverse-transition'
    }),

    props: {
      buttons: {
        type: Array,
        default: () => [/* {event, color, icon, label} */]
      }
    },

    mounted() {
      pi.delay((thiz) => {
        thiz.locales = thiz.$store.state.locales
        thiz.localesSelected = thiz.$store.getters.locale
      }, 2000, this)
    },

    methods: {
      handleButton(eventName) {
        global.getApp.$emit(eventName)
      },
      handleFullScreen() {
        pi.toggleFullScreen((isFull) => {
          global.getApp.$emit('APP_FULL_SCREEN', isFull)
        })
      },
      handleLocale() {
        this.$i18n.change(this.localesSelected.value)
        this.localesDialog = false
      },
      handleThemeSettings() {
        global.getApp.$emit('APP_THEME_SETTINGS')
      }
    },

    computed: {},

    watch: {}
  }
</script>

<style>
  #settings-fab .v-speed-dial {
    position: absolute;
  }

  #settings-fab .v-btn--floating {
    position: relative;
  }
</style>
