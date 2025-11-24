import type { Event } from '~~/types/event'

interface UseEventsFeedOptions {
  perPage: ComputedRef<number>
  order: ComputedRef<string>
}

const EVENTS_QUERY = `
  query AllEvents($first: IntType!, $skip: IntType!, $order: [EventModelOrderBy!]!) {
    allEvents(orderBy: $order, first: $first, skip: $skip) {
      id
      title
      slug
      image {
        url
      }
      description
      dateAndTime
      tags
      participants {
        name
        role
        avatar {
          url
        }
      }
    }
    _allEventsMeta {
      count
    }
  }
`

export const useEventsFeed = async ({ perPage, order }: UseEventsFeedOptions) => {
  const events = ref<Event[]>([])
  const skip = ref(0)
  const loadingMore = ref(false)
  const hasMore = ref(false)
  const totalCount = ref(0)

  const { data, error } = await useDatoCms({
    query: EVENTS_QUERY,
    variables: {
      first: perPage.value,
      skip: 0,
      order: [order.value]
    }
  })

  if (data.value?.allEvents) {
    events.value = data.value.allEvents || []
    totalCount.value = data.value._allEventsMeta?.count || 0
    skip.value = perPage.value
    hasMore.value = events.value.length < totalCount.value
  }

  const loadMore = async () => {
    if (loadingMore.value || !hasMore.value) return

    loadingMore.value = true

    try {
      const { data: moreData } = await useDatoCms({
        query: EVENTS_QUERY,
        variables: {
          first: perPage.value,
          skip: skip.value,
          order: [order.value]
        }
      })

      const newEvents = moreData?.value.allEvents || []
      if (!newEvents.length) {
        hasMore.value = false
        return
      }

      events.value.push(...newEvents)
      skip.value += perPage.value
      hasMore.value = events.value.length < totalCount.value
    } catch (err) {
      console.error('Error loading more events:', err)
    } finally {
      loadingMore.value = false
    }
  }

  return {
    events,
    hasMore,
    loadingMore,
    loadMore,
    totalCount,
    eventsError: error
  }
}
