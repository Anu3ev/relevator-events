<template>
  <div class="min-h-full bg-black text-white">
    {{ events }}
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Image {
  url: string
}

interface Event {
  id: string
  title: string
  slug: string
  dateAndTime?: string
  image?: Image
  tags?: string
  description?: string
}

// Configuration
const ITEMS_PER_PAGE = 12

const EVENTS_QUERY = `
  query AllEvents($first: IntType!, $skip: IntType!) {
    allEvents(
      orderBy: dateAndTime_ASC
      first: $first
      skip: $skip
    ) {
      id
      title
      slug
      description(markdown: true)
      dateAndTime
      tags
    }
    _allEventsMeta {
      count
    }
  }
`

// State
const events = ref<Event[]>([])
const skip = ref(0)
const loadingMore = ref(false)
const hasMore = ref(false)
const totalCount = ref(0)

// Initial fetch
const { data, error } = await useAsyncDatoCms({
  query: EVENTS_QUERY,
  variables: {
    first: ITEMS_PER_PAGE,
    skip: 0
  }
})

// Initialize events and metadata
if (data.value?.allEvents) {
  events.value = data.value.allEvents || []
  console.log('Initialized events:', events.value)
  totalCount.value = data.value._allEventsMeta?.count || 0
  skip.value = ITEMS_PER_PAGE
  hasMore.value = events.value.length < totalCount.value
}

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return

  loadingMore.value = true

  try {
   const { data: moreData } = await useDatoCms({
      query: EVENTS_QUERY,
      variables: {
        first: ITEMS_PER_PAGE,
        skip: skip.value
      }
    })

    const newEvents = moreData?.value.allEvents || []

    if (!newEvents.length) {
      hasMore.value = false
      return
    }

    events.value.push(...newEvents)
    skip.value += ITEMS_PER_PAGE
    hasMore.value = events.value.length < totalCount.value
  } catch (err) {
    console.error('Error loading more events:', err)
  } finally {
    loadingMore.value = false
  }
}

// SEO
useHead({
  title: 'Hero Title',
  meta: [
    {
      name: 'description',
      content: 'Dive into the Rhythm Report for deep insights, emerging trends, and exclusive interviews shaping the future of music and rights management.'
    }
  ]
})
</script>
