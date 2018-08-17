'use strict'

const resolve = require('path').resolve

module.exports = {
  build: {
    extend (config, { isClient, isServer, isDev }) {
      config.resolve.alias['~pi'] = '~/plugins/PI.js'
    },
    // https://github.com/webpack-contrib/webpack-bundle-analyzer
    analyze: {
      openAnalyzer: false,
      analyzerMode: 'static',
      generateStatsFile: true,
      statsFilename: 'webpack-stats.json'
    },
    vendor: [
      '~pi',
      'vuetify',
      'vue-i18n',
      'axios'
    ]
  },

  router: {

  },
  plugins: [
    // ssr: false to only include it on client-side
    { src: '~plugins/persist.js', ssr: false },
    '~plugins/vuetify.js', '~plugins/vue-i18n.js'
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
    { src: '~assets/css/app.styl', lang: 'styl' },
    '~assets/css/main.css'
  ],

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#744d82' },

  /*
  ** Point to resources
  */
  srcDir: resolve(__dirname, '..', 'resources')
}
