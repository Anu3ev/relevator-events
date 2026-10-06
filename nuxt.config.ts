export default defineNuxtConfig({
  compatibilityDate: '2025-11-01',
  devtools: { enabled: false },
  fonts: {
    families: [{ name: 'PP Mori', provider: 'local', global: true, weights: ['400', '450', '500', '600'] }]
  },
  modules: ['@nuxt/eslint', '@nuxt/fonts', '@nuxt/image', '@nuxtjs/tailwindcss'],
  components: [{ path: '~/components', pathPrefix: false }],
  runtimeConfig: {
    datocmsToken: process.env.DATOCMS_API_TOKEN || '',
    datocmsEnvironment: process.env.DATOCMS_ENVIRONMENT || 'main',
    demoMode: false
  },
  app: { head: { htmlAttrs: { lang: 'en' } } }
})
