<template>
  <div>
    <HeroSection>
      <template #title>
        {{ heroSection?.title }}
      </template>
      <template #subtitle>
        {{ heroSection?.subtitle }}
      </template>
    </HeroSection>

    <!-- Events Section -->
    <section v-if="events.length" class="flex flex-col mx-auto w-full py-20 gap-8">
      <h2 class="text-5xl font-semibold">{{ eventsSection?.title }}</h2>

      <!-- Error State -->
      <div v-if="error" class="text-center text-red-400">
        <p class="text-2xl">
          Error loading events. Please try again later.
        </p>
      </div>

      <!-- Events Grid -->
      <template v-else>
        <EventGrid :events="events" />

        <!-- Load More Button -->
        <div v-if="hasMore" class="flex justify-center">
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="loadingMore"
            @click="loadMore"
          >
            {{ loadingMore ? 'Loading...' : 'Load More' }}
          </BaseButton>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
const {
  heroSection,
  seo,
  eventsPerPage,
  eventsSection,
  eventsOrder,
  homeError
} = await useHomePageContent()

const {
  events,
  hasMore,
  loadingMore,
  loadMore,
  eventsError
} = await useEventsFeed({
  perPage: eventsPerPage,
  order: eventsOrder
})

const error = computed(() => homeError?.value || eventsError?.value)

useHead(() => ({
  title: seo.value?.title,
  meta: [
    {
      name: 'description',
      content: seo.value?.description
    }
  ]
}))
</script>
