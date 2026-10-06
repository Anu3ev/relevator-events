import type { HomePageData } from '~~/types/cms'
import { DEFAULT_EVENTS_LIMIT, DEFAULT_EVENTS_ORDER, MAX_EVENTS_LIMIT, isEventOrder } from '~~/shared/cms'

/** Read CMS presentation settings with useful defaults when content is missing. */
export const useHomePageContent = async () => {
  const { data } = await useAsyncData<HomePageData>('home-page', (_app, { signal }) => {
    return $fetch('/api/home', { retry: 0, signal })
  })
  const blocks = computed(() => data.value?.homePage?.content ?? [])
  const heroSection = computed(() => blocks.value.find(block => block._modelApiKey === 'hero_section'))
  const eventsSection = computed(() => blocks.value.find(block => block._modelApiKey === 'events_section'))
  const placeholderHero = computed(() => {
    const title = heroSection.value?.title?.trim()
    return !title || /^hero title$/i.test(title)
  })

  const heroTitle = computed(() => {
    if (placeholderHero.value) return 'Discover music events'

    return heroSection.value?.title
  })
  const heroSubtitle = computed(() => {
    if (placeholderHero.value) {
      return 'Explore conversations, workshops and live sessions from the music community.'
    }

    return heroSection.value?.subtitle || 'Explore events from the music community.'
  })
  const eventsTitle = computed(() => {
    const title = eventsSection.value?.title?.trim()
    if (!title || /^grid title$/i.test(title)) return 'Explore events'

    return title
  })
  const eventsPerPage = computed(() => {
    const limit = eventsSection.value?.limit || DEFAULT_EVENTS_LIMIT
    return Math.min(MAX_EVENTS_LIMIT, Math.max(1, limit))
  })
  const eventsOrder = computed(() => {
    const order = eventsSection.value?.order
    if (isEventOrder(order)) return order

    return DEFAULT_EVENTS_ORDER
  })
  const seo = computed(() => data.value?.homePage?.seo)

  return { heroTitle, heroSubtitle, eventsTitle, eventsPerPage, eventsOrder, seo }
}
