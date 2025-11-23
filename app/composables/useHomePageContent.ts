interface HeroSectionBlock {
  _modelApiKey: 'hero_section'
  title?: string
  subtitle?: string
}

interface EventsSectionBlock {
  _modelApiKey: 'events_section'
  title?: string
  limit?: number
  order?: string
}

interface SeoBlock {
  title?: string
  description?: string
}

type ContentBlock = EventsSectionBlock | HeroSectionBlock

const DEFAULT_EVENTS_LIMIT = 12
const DEFAULT_EVENTS_ORDER = 'dateAndTime_ASC'

const HOME_PAGE_QUERY = `
  query HomePage {
    homePage {
      content {
        ... on EventsSectionRecord {
          _modelApiKey
          title
          limit
          order
        }
        ... on HeroSectionRecord {
          _modelApiKey
          title
          subtitle
        }
      }
      seo {
        title
        description
      }
    }
  }
`

export const useHomePageContent = async () => {
  const { data, error } = await useAsyncDatoCms({
    query: HOME_PAGE_QUERY
  })

  const sections = computed(() => {
    const blocks = (data.value?.homePage?.content as ContentBlock[] | undefined) ?? []

    return blocks.reduce<{ hero?: HeroSectionBlock; events?: EventsSectionBlock }>((acc, block) => {
      if (!acc.hero && block._modelApiKey === 'hero_section') acc.hero = block as HeroSectionBlock
      if (!acc.events && block._modelApiKey === 'events_section') acc.events = block as EventsSectionBlock
      return acc
    }, {})
  })

  const heroSection = computed(() => sections.value.hero ?? null)
  const eventsSection = computed(() => sections.value.events ?? null)
  const seo = computed(() => data.value?.homePage?.seo as SeoBlock | undefined)

  const eventsPerPage = computed(() => eventsSection.value?.limit ?? DEFAULT_EVENTS_LIMIT)
  const eventsOrder = computed(() => eventsSection.value?.order ?? DEFAULT_EVENTS_ORDER)

  return {
    heroSection,
    eventsSection,
    seo,
    eventsPerPage,
    eventsOrder,
    homeError: error
  }
}
