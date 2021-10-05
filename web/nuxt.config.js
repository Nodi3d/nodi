import path from 'path';
import firebase from './.firebase.env.js';

export default {
  env: {
    firebase
  },

  // Disable server-side rendering (https://go.nuxtjs.dev/ssr-mode)
  ssr: false,

  // Target (https://go.nuxtjs.dev/config-target)
  target: 'static',

  router: {
    middleware: []
  },

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'Nodi: An Online Node-based Geometry Design Tool and Platform',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
      { hid: 'description', name: 'description', content: 'An Online Node-based Geometry Design Tool and Platform' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:100,300,400' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Noto+Sans+JP' }
    ]
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
    '@primer/css/index.scss',
    '@primer/octicons/index.scss',
    '~/assets/styles/foundations/common.scss'
  ],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    '~/plugins/firebase.ts',
    '~/plugins/firebase.auth.ts'
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/svg',
    'nuxt-typed-vuex'
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    '@nuxtjs/axios'
  ],

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {},

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
    parallel: true,
    babel: {
      compact: true
    },
    terser: {
      terserOptions: {
        keep_fnames: true
      }
    },
    plugins: [
    ],
    extend: (config, ctx) => {
      if (ctx.isClient) {
        config.module.rules.push({
          test: /\.(glsl|vs|fs|vert|frag)$/,
          exclude: /node_modules/,
          use: [
            'raw-loader',
            'glslify-loader'
          ]
        });
      }
    }
  }
};
