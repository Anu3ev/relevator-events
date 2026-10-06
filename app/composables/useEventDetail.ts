import type { Event } from '~~/types/event'
import type { EventData } from '~~/types/cms'

/** Reuse a complete feed record before requesting a directly opened event. */
export const useEventDetail = async ({ slug }: { slug: string }) => {
  const events = useState<Event[]>('events-feed', () => [])
  const asyncData = await useAsyncData<EventData>(`event-${slug}`, (_app, { signal }) => {
    const cachedEvent = events.value.find(event => event.slug === slug)
    if (cachedEvent) return Promise.resolve({ event: cachedEvent })

    return $fetch(`/api/events/${encodeURIComponent(slug)}`, { retry: 0, signal })
  }, { lazy: true })

  return {
    event: computed(() => asyncData.data.value?.event ?? null),
    pending: asyncData.pending,
    error: asyncData.error,
    status: asyncData.status,
    refresh: asyncData.refresh
  }
}
