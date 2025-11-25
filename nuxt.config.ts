import { resolve } from 'node:path'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  fonts: {
    families: [
      {
        name: 'PP Mori',
        provider: 'local',
        global: true,
        weights: ['400', '450', '500', '600']
      }
    ]
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxtjs/tailwindcss',
    '@hexdigital/nuxt-datocms'
  ],

  alias: {
    // Force all datocms-listen imports to the ESM build shipped at the project root
    'datocms-listen': resolve(process.cwd(), 'node_modules/datocms-listen/dist/esm/index.js')
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ],

  datocms: {
    publicReadOnlyToken: process.env.DATOCMS_API_TOKEN,
    environment: process.env.DATOCMS_ENVIRONMENT || 'main'
  }
})
