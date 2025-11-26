import type { Event } from '~~/types/event'

interface UseEventDetailOptions {
  slug: string
}

interface EventData {
  event: Event | null
}

const EVENT_QUERY = `
  query EventBySlug($slug: String!) {
    event(filter: { slug: { eq: $slug } }) {
      id
      title
      slug
      dateAndTime
      image {
        url
      }
      description
      tags
      participantsTitle
      participants {
        name
        role
        avatar {
          url
        }
      },
      seo {
        title
        description
      }
    }
  }
`

export const useEventDetail = async ({ slug }: UseEventDetailOptions) => {
  const eventsCache = useState<Event[]>('events-feed', () => [])
  const cachedEvent = computed(() =>
    eventsCache.value.find((evt) => evt.slug === slug)
  )

  const asyncData = await useAsyncData<EventData>(`event-${slug}`, async () => {
    if (cachedEvent.value) {
      return { event: cachedEvent.value }
    }

    const { data } = await useDatoCms({
      query: EVENT_QUERY,
      variables: {
        slug
      }
    })

    return (data.value as EventData) ?? { event: null }
  })

  const event = computed(
    () =>
      cachedEvent.value ??
      ((asyncData.data.value as EventData | null)?.event ?? null)
  )

  return {
    ...asyncData,
    event
  }
}

