import type { Event } from '~~/types/event'
import type { EventsData } from '~~/types/cms'

interface UseEventsFeedOptions {
  perPage: ComputedRef<number>
  order: ComputedRef<string>
}

export const useEventsFeed = async ({ perPage, order }: UseEventsFeedOptions) => {
  const events = useState<Event[]>('events-feed', () => [])
  const totalCount = useState('events-total', () => 0)
  const nextOffset = useState('events-offset', () => 0)
  const loaded = useState('events-loaded', () => false)
  const exhausted = useState('events-exhausted', () => false)
  const queryKey = useState('events-query', () => '')
  const loadingMore = useState('events-loading-more', () => false)
  const loadMoreError = useState<string | null>('events-load-more-error', () => null)
  const key = `${perPage.value}:${order.value}`

  if (queryKey.value !== key) {
    queryKey.value = key
    events.value = []
    totalCount.value = 0
    nextOffset.value = 0
    loaded.value = false
    exhausted.value = false
    loadMoreError.value = null
    loadingMore.value = false
  }

  const initial = await useAsyncData<EventsData>(`events-initial-${key}`, () => {
    if (loaded.value) {
      return Promise.resolve({ allEvents: events.value, _allEventsMeta: { count: totalCount.value } })
    }
    return $fetch('/api/events', { retry: 0, query: { first: perPage.value, skip: 0, order: order.value } })
  }, { lazy: true })

  watch(initial.data, (data) => {
    if (!data || loaded.value || queryKey.value !== key) return
    events.value = data.allEvents
    totalCount.value = data._allEventsMeta.count
    nextOffset.value = data.allEvents.length
    exhausted.value = data.allEvents.length === 0
    loaded.value = true
  }, { immediate: true })

  const hasMore = computed(() => loaded.value && !exhausted.value && events.value.length < totalCount.value)

  const loadMore = async () => {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    loadMoreError.value = null
    try {
      const data = await $fetch<EventsData>('/api/events', {
        retry: 0, query: { first: perPage.value, skip: nextOffset.value, order: order.value }
      })
      if (queryKey.value !== key) return
      // Keep the server offset independent of deduplication if content shifts between requests.
      nextOffset.value += data.allEvents.length
      totalCount.value = data._allEventsMeta.count
      const seen = new Set(events.value.map(event => event.id))
      events.value = [...events.value, ...data.allEvents.filter(event => !seen.has(event.id) && seen.add(event.id))]
      exhausted.value = data.allEvents.length === 0 || nextOffset.value >= totalCount.value
    } catch {
      if (queryKey.value !== key) return
      loadMoreError.value = 'Could not load more events. Your loaded events are still here.'
    } finally {
      if (queryKey.value === key) loadingMore.value = false
    }
  }

  return {
    events, hasMore, loadingMore, loadMore, loadMoreError, totalCount,
    pending: computed(() => !loaded.value && initial.status.value === 'pending'),
    eventsError: initial.error,
    retry: initial.refresh
  }
}
