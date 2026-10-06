<template>
  <div>
    <HeroSection>
      <template #title>{{ heroTitle }}</template>
      <template #subtitle>{{ heroSubtitle }}</template>
    </HeroSection>

    <section
      id="events"
      class="mx-auto flex w-full scroll-mt-24 flex-col gap-8 py-10 sm:py-16"
      aria-labelledby="events-heading"
      :aria-busy="pending || loadingMore"
    >
      <div class="space-y-3">
        <h2 id="events-heading" class="text-3xl font-semibold sm:text-5xl">
          {{ eventsTitle }}
        </h2>
        <p class="text-sm text-white/65">All event times are shown in UTC.</p>
        <p v-if="sampleContent" class="max-w-2xl text-sm text-brand-accent">
          Sample event directory. Listings are demonstration content and may include past events.
        </p>
      </div>

      <p v-if="pending" role="status" class="py-12 text-center text-white/75">
        Loading events...
      </p>
      <div
        v-else-if="eventsError && !events.length"
        role="alert"
        class="flex flex-col items-center gap-5 rounded-3xl bg-white/5 px-6 py-12 text-center"
      >
        <p class="text-xl">Could not load events. Please try again.</p>
        <BaseButton variant="secondary" @click="retry()">Try again</BaseButton>
      </div>
      <template v-else>
        <EventGrid :events="events" />
        <div v-if="loadMoreError" role="alert" class="space-y-4 text-center">
          <p class="text-red-300">{{ loadMoreError }}</p>
          <BaseButton variant="secondary" :disabled="loadingMore" @click="loadMore">
            {{ loadingMore ? 'Loading...' : 'Try again' }}
          </BaseButton>
        </div>
        <div v-else-if="hasMore" class="flex justify-center">
          <BaseButton variant="secondary" :disabled="loadingMore" @click="loadMore">
            {{ loadingMore ? 'Loading...' : 'Load more' }}
          </BaseButton>
        </div>
        <p v-if="events.length" role="status" class="text-center text-sm text-white/60">
          Showing {{ events.length }} of {{ totalCount }} events
        </p>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
const {
  heroTitle,
  heroSubtitle,
  eventsTitle,
  seo,
  eventsPerPage,
  eventsOrder
} = await useHomePageContent()

const {
  events,
  hasMore,
  loadingMore,
  loadMore,
  loadMoreError,
  totalCount,
  pending,
  eventsError,
  retry
} = await useEventsFeed({ perPage: eventsPerPage, order: eventsOrder })

const sampleContent = computed(() => events.value.some(event => {
  return event.id.startsWith('demo-event-') || /^(?:card title|event title)\b/i.test(event.title)
}))
const pageTitle = computed(() => {
  const title = seo.value?.title?.trim()
  if (!title || /^(?:hero|page|seo) title$/i.test(title)) return 'Events | Relevator'

  return title
})

useHead(() => ({
  title: pageTitle.value,
  meta: [{
    name: 'description',
    content: seo.value?.description || 'Explore music events, workshops and conversations.'
  }]
}))
</script>
