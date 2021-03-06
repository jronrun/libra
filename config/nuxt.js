'use strict'

const resolve = require('path').resolve

module.exports = {
  build: {
    extend (config, { isClient, isServer, isDev }) {
      // config.resolve.alias['~pi'] = '~/plugins/PI.js'
      Object.assign(config.resolve.alias, {
        '~pi': '~/plugins/PI.js',
        '~helper': '~/plugins/helper.js',
        '~axios': '~/plugins/axios.js',
        '~types': '~/store/types.js',
        '~constants': '~/utils/constants.js'
      })
    },
    // https://github.com/webpack-contrib/webpack-bundle-analyzer
    analyze: {
      openAnalyzer: false,
      analyzerMode: 'static',
      generateStatsFile: true,
      statsFilename: 'webpack-stats.json'
    },
    vendor: [
      'babel-polyfill',
      '~pi',
      'vuetify',
      'vue-i18n',
      'axios'
    ]
  },

  router: {
    middleware: ['locale']
  },

  plugins: [
    // ssr: false to only include it on client-side
    { src: '~plugins/persist.js', ssr: false },
    '~plugins/vuetify.js',
    '~plugins/vue-i18n.js',
    '~plugins/ready.js'
  ],

  /*
  ** Headers of the page
  */
  head: {
    title: 'Libra of Constellation',
    meta: [
      {
        charset: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        hid: 'description',
        name: 'description',
        content: 'Libra of Constellation'
      }
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: 'favicon.ico'
      }
    ]
  },

  /*
  ** Global CSS
  */
  css: [
    // $ npm install material-design-icons-iconfont -D
    'material-design-icons-iconfont/dist/material-design-icons.css',
    { src: '~assets/css/app.styl', lang: 'styl' },
    '~assets/css/main.css'
  ],

  /*
  ** Customize the progress-bar color
  */
  loading: {
    color: 'blue',
    height: '2px'
  },

  /*
  ** Point to resources
  */
  srcDir: resolve(__dirname, '..', 'resources')
}
