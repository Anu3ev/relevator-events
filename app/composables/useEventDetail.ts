import type { Event } from '~~/types/event'
import type { EventData } from '~~/types/cms'

export const useEventDetail = async ({ slug }: { slug: string }) => {
  const events = useState<Event[]>('events-feed', () => [])
  const asyncData = await useAsyncData<EventData>(`event-${slug}`, () => {
    const cached = events.value.find(event => event.slug === slug)
    return cached
      ? Promise.resolve({ event: cached })
      : $fetch(`/api/events/${encodeURIComponent(slug)}`, { retry: 0 })
  }, { lazy: true })

  return {
    ...asyncData,
    event: computed(() => asyncData.data.value?.event ?? null)
  }
}
