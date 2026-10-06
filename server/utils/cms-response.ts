import type { Event, EventMedia, EventParticipant } from '../../types/event'
import type { ContentBlock, EventData, EventsData, HomePageData, SeoBlock } from '../../types/cms'

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid CMS response')
  return value as Record<string, unknown>
}

function requiredString(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Invalid CMS response')
  return value
}

function optionalString(value: unknown): string | undefined {
  return value == null ? undefined : requiredString(value)
}

function media(value: unknown): EventMedia | undefined {
  return value == null ? undefined : { url: requiredString(record(value).url) }
}

function seo(value: unknown): SeoBlock | undefined {
  if (value == null) return undefined
  const item = record(value)
  return { title: optionalString(item.title), description: optionalString(item.description) }
}

function participant(value: unknown): EventParticipant {
  const item = record(value)
  return { name: requiredString(item.name), role: optionalString(item.role), avatar: media(item.avatar) }
}

function event(value: unknown): Event {
  const item = record(value)
  if (item.participants != null && !Array.isArray(item.participants)) throw new Error('Invalid CMS response')
  const metadata = seo(item.seo)
  return {
    id: requiredString(item.id),
    title: requiredString(item.title),
    slug: requiredString(item.slug),
    dateAndTime: optionalString(item.dateAndTime),
    image: media(item.image),
    description: optionalString(item.description),
    tags: optionalString(item.tags),
    participantsTitle: optionalString(item.participantsTitle),
    participants: Array.isArray(item.participants) ? item.participants.map(participant) : undefined,
    seo: metadata ? { title: metadata.title ?? undefined, description: metadata.description ?? undefined } : undefined
  }
}

export function readEventsData(value: unknown): EventsData {
  const data = record(value)
  const count = record(data._allEventsMeta).count
  if (!Array.isArray(data.allEvents) || typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0) {
    throw new Error('Invalid CMS response')
  }
  return { allEvents: data.allEvents.map(event), _allEventsMeta: { count } }
}

export function readEventData(value: unknown): EventData {
  const data = record(value)
  return { event: data.event === null ? null : event(data.event) }
}

export function readHomePageData(value: unknown): HomePageData {
  const data = record(value)
  if (data.homePage === null) return { homePage: null }
  const homePage = record(data.homePage)
  if (!Array.isArray(homePage.content)) throw new Error('Invalid CMS response')
  const content: ContentBlock[] = []
  for (const value of homePage.content) {
    const block = record(value)
    if (block._modelApiKey === 'hero_section') {
      content.push({ _modelApiKey: 'hero_section', title: optionalString(block.title), subtitle: optionalString(block.subtitle) })
    } else if (block._modelApiKey === 'events_section') {
      if (block.limit != null && (typeof block.limit !== 'number' || !Number.isSafeInteger(block.limit))) throw new Error('Invalid CMS response')
      content.push({
        _modelApiKey: 'events_section',
        title: optionalString(block.title),
        limit: block.limit == null ? undefined : block.limit as number,
        order: optionalString(block.order)
      })
    }
    // A block type outside the requested fragments is intentionally ignored.
  }
  return { homePage: { content, seo: seo(homePage.seo) } }
}
