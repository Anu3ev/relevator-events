// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  fonts: {
    families: [
      { name: 'PPMori', provider: 'local' }
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

  datocms: {
    publicReadOnlyToken: process.env.DATOCMS_API_TOKEN
  }
})
