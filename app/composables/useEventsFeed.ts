import type { Event } from '~~/types/event'
import type { EventsData } from '~~/types/cms'

interface UseEventsFeedOptions {
  perPage: ComputedRef<number>
  order: ComputedRef<string>
}

/** Keep loaded events across navigation; pending requests belong to the current page. */
export const useEventsFeed = async ({ perPage, order }: UseEventsFeedOptions) => {
  const events = useState<Event[]>('events-feed', () => [])
  const totalCount = useState('events-total', () => 0)
  const nextOffset = useState('events-offset', () => 0)
  const loaded = useState('events-loaded', () => false)
  const exhausted = useState('events-exhausted', () => false)
  const queryKey = useState('events-query', () => '')
  const loadingMore = ref(false)
  const loadMoreError = ref<string | null>(null)
  const key = `${perPage.value}:${order.value}`
  let activeRequest: AbortController | undefined

  onScopeDispose(() => {
    activeRequest?.abort()
    activeRequest = undefined
  })

  if (queryKey.value !== key) {
    queryKey.value = key
    events.value = []
    totalCount.value = 0
    nextOffset.value = 0
    loaded.value = false
    exhausted.value = false
  }

  const initial = useAsyncData<EventsData>(`events-initial-${key}`, (_app, { signal }) => {
    if (loaded.value) {
      return Promise.resolve({ allEvents: events.value, _allEventsMeta: { count: totalCount.value } })
    }

    return $fetch('/api/events', {
      retry: 0,
      signal,
      query: { first: perPage.value, skip: 0, order: order.value }
    })
  }, { lazy: true })

  // Register before awaiting so Vue disposes this watcher with the owning page.
  watch(initial.data, (data) => {
    if (!data || loaded.value || queryKey.value !== key) return

    events.value = data.allEvents
    totalCount.value = data._allEventsMeta.count
    nextOffset.value = data.allEvents.length
    exhausted.value = data.allEvents.length === 0
    loaded.value = true
  }, { immediate: true, flush: 'sync' })

  const hasMore = computed(() => loaded.value && !exhausted.value && events.value.length < totalCount.value)
  const pending = computed(() => !loaded.value && initial.status.value === 'pending')

  const loadMore = async () => {
    if (loadingMore.value || !hasMore.value) return

    const request = new AbortController()
    activeRequest = request
    loadingMore.value = true
    loadMoreError.value = null

    try {
      const data = await $fetch<EventsData>('/api/events', {
        retry: 0,
        signal: request.signal,
        query: { first: perPage.value, skip: nextOffset.value, order: order.value }
      })
      if (activeRequest !== request || queryKey.value !== key) return

      // Advance by the server page size even when content shifts and repeats an event.
      nextOffset.value += data.allEvents.length
      totalCount.value = data._allEventsMeta.count
      const seen = new Set(events.value.map(event => event.id))
      const uniqueEvents: Event[] = []
      for (const event of data.allEvents) {
        if (seen.has(event.id)) continue

        seen.add(event.id)
        uniqueEvents.push(event)
      }
      events.value = [...events.value, ...uniqueEvents]
      exhausted.value = data.allEvents.length === 0 || nextOffset.value >= totalCount.value
    } catch {
      if (request.signal.aborted || activeRequest !== request || queryKey.value !== key) return

      loadMoreError.value = 'Could not load more events. Your loaded events are still here.'
    } finally {
      if (activeRequest === request) {
        activeRequest = undefined
        loadingMore.value = false
      }
    }
  }

  await initial

  return {
    events,
    hasMore,
    loadingMore,
    loadMore,
    loadMoreError,
    totalCount,
    pending,
    eventsError: initial.error,
    retry: initial.refresh
  }
}
