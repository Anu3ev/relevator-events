import type { Event } from './event'

export interface SeoBlock {
  title?: string | null
  description?: string | null
}

export interface HeroSectionBlock {
  _modelApiKey: 'hero_section'
  title?: string | null
  subtitle?: string | null
}

export interface EventsSectionBlock {
  _modelApiKey: 'events_section'
  title?: string | null
  limit?: number | null
  order?: string | null
}

export type ContentBlock = HeroSectionBlock | EventsSectionBlock

export interface HomePageData {
  homePage: {
    content: ContentBlock[]
    seo?: SeoBlock | null
  } | null
}

export interface EventsData {
  allEvents: Event[]
  _allEventsMeta: { count: number }
}

export interface EventData {
  event: Event | null
}
