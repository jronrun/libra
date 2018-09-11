<template>
  <div id="themeSetting">
    <v-toolbar color="primary" dark>
      <v-toolbar-title>
        {{$t('manage.settings.theme')}}
      </v-toolbar-title>
    </v-toolbar>

    <v-card width="100%" height="100%" :dark="$vuetify.dark">
      <v-container>
        <v-layout column>
          <v-flex>
            <v-subheader class="px-1 my-2">
              {{$t('manage.settings.color')}}
            </v-subheader>
            <div class="color-option">
              <v-layout wrap>
                <label class="color-option--label flex xs6 pa-1" v-for="(option,index) in themeColorOptions" :key="index">
                  <input type="radio" name="color" v-bind:value="option.key" v-model="themeColor">
                  <span class="color-option--item bg">
                <span class="overlay">
                  <span class="material-icons">check</span>
                </span>
                <span class="color-option--item--header sideNav" :class="option.value.sideNav"></span>
                <span class="color-option--item--header mainNav" :class="option.value.mainNav"></span>
                <span class="sideMenu" :class="option.value.sideManu"></span>
              </span>
                </label>
              </v-layout>
            </div>
            <div class="theme-options">
              <v-subheader class="px-1 my-2">
                {{$t('manage.settings.sidebar')}}
              </v-subheader>
              <v-divider></v-divider>
              <div class="my-3">
                <v-btn-toggle v-model="sideBarOption">
                  <v-btn flat value="dark">
                    {{$t('manage.settings.dark')}}
                  </v-btn>
                  <v-btn flat value="light">
                    {{$t('manage.settings.light')}}
                  </v-btn>
                </v-btn-toggle>
              </div>
            </div>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>

  </div>
</template>

<script>
  const defaultColor = 'indigo'
  const defaultDark = 'light'

  export default {
    data() {
      return {
        themeColor: defaultColor,
        sideBarOption: defaultDark,
        setDefaultColorCount: 0,
        setDefaultDarkCount: 0
      }
    },
    computed: {
      themeColorOptions() {
        return [
          {
            key: 'blue',
            value: {
              sideNav: 'blue',
              mainNav: 'blue',
              sideManu: 'white'
            }
          },
          {
            key: 'cyan',
            value: {
              sideNav: 'cyan',
              mainNav: 'cyan',
              sideManu: 'white'
            }
          },
          {
            key: 'teal',
            value: {
              sideNav: 'teal',
              mainNav: 'teal',
              sideManu: 'white'
            }
          },
          {
            key: 'red',
            value: {
              sideNav: 'red',
              mainNav: 'red',
              sideManu: 'white'
            }
          },
          {
            key: 'orange',
            value: {
              sideNav: 'orange',
              mainNav: 'orange',
              sideManu: 'white'
            }
          },
          {
            key: 'purple',
            value: {
              sideNav: 'purple',
              mainNav: 'purple',
              sideManu: 'white'
            }
          },
          {
            key: 'indigo',
            value: {
              sideNav: 'indigo',
              mainNav: 'indigo',
              sideManu: 'white'
            }
          },
          {
            key: 'cyan',
            value: {
              sideNav: 'cyan',
              mainNav: 'cyan',
              sideManu: 'white'
            }
          },
          {
            key: 'pink',
            value: {
              sideNav: 'pink',
              mainNav: 'pink',
              sideManu: 'white'
            }
          },
          {
            key: 'green',
            value: {
              sideNav: 'green',
              mainNav: 'green',
              sideManu: 'white'
            }
          },
          {
            key: 'lime',
            value: {
              sideNav: 'lime',
              mainNav: 'lime',
              sideManu: 'white'
            }
          },
          {
            key: 'yellow',
            value: {
              sideNav: 'yellow',
              mainNav: 'yellow',
              sideManu: 'white'
            }
          },
          {
            key: 'amber',
            value: {
              sideNav: 'amber',
              mainNav: 'amber',
              sideManu: 'white'
            }
          },
          {
            key: 'brown',
            value: {
              sideNav: 'brown',
              mainNav: 'brown',
              sideManu: 'white'
            }
          },
          {
            key: 'blueGrey',
            value: {
              sideNav: 'blueGrey',
              mainNav: 'blueGrey',
              sideManu: 'white'
            }
          },
          {
            key: 'grey',
            value: {
              sideNav: 'grey',
              mainNav: 'grey',
              sideManu: 'white'
            }
          }
        ]
      }
    },

    methods: {},

    mounted() {
      this.$libra.restoreTheme(this).then((theme) => {
        this.themeColor = theme.color
        this.sideBarOption = theme.dark
      })
    },

    watch: {
      themeColor: {
        handler(val) {
          let isDefaultColor = val === defaultColor
          if (isDefaultColor) {
            this.setDefaultColorCount++
          }

          if (!isDefaultColor || this.setDefaultColorCount > 1) {
            this.$libra.theme(this, {color: val})
          }
        },
        immediate: true
      },
      sideBarOption: {
        handler(val) {
          let isDefaultDark = val === defaultDark
          if (isDefaultDark) {
            this.setDefaultDarkCount++
          }

          if (!isDefaultDark || this.setDefaultDarkCount > 1) {
            this.$libra.theme(this, {dark: val})
          }
        },
        immediate: true
      }
    }

  }
</script>

<style lang="stylus" scoped>
  .color-option
    &--label
      position: relative
      display: block
      cursor: pointer
      & input[type="radio"]
        display: none
        & + span
          position: relative
          & > .overlay
            display: none;
            position: absolute
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, .3);
            text-align: center;
            line-height: 30px;
            color: #fff;
        &:checked + span > .overlay
          display: block
      & .bg
        background-color: #f1f1f1
    &--item
      overflow: hidden;
      display: block;
      box-shadow: 0 0 2px rgba(0, 0, 0, .1);
      margin-bottom: 15px;
      &--header
        height: 10px
      & > span
        display: block;
        float: left;
        width: 50%;
        height: 20px;
</style>
