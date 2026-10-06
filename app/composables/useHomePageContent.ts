import type { HomePageData } from '~~/types/cms'

export const useHomePageContent = async () => {
  const { data, error } = await useAsyncData<HomePageData>('home-page', () => $fetch('/api/home', { retry: 0 }))
  const blocks = computed(() => data.value?.homePage?.content ?? [])
  const heroSection = computed(() => blocks.value.find(block => block._modelApiKey === 'hero_section'))
  const eventsSection = computed(() => blocks.value.find(block => block._modelApiKey === 'events_section'))
  const placeholderHero = computed(() => !heroSection.value?.title || /^hero title$/i.test(heroSection.value.title.trim()))

  return {
    heroTitle: computed(() => placeholderHero.value ? 'Discover music events' : heroSection.value?.title),
    heroSubtitle: computed(() => placeholderHero.value
      ? 'Explore conversations, workshops and live sessions from the music community.'
      : heroSection.value?.subtitle || 'Explore events from the music community.'),
    eventsTitle: computed(() => !eventsSection.value?.title || /^grid title$/i.test(eventsSection.value.title.trim())
      ? 'Explore events' : eventsSection.value.title),
    seo: computed(() => data.value?.homePage?.seo),
    eventsPerPage: computed(() => Math.min(100, Math.max(1, eventsSection.value?.limit || 12))),
    eventsOrder: computed(() => eventsSection.value?.order || 'dateAndTime_ASC'),
    homeError: error
  }
}
