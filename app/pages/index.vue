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
    <section class="flex flex-col mx-auto w-full pt-20 gap-8">
      <h2 class="text-5xl font-semibold">Grid Title</h2>

      <!-- Error State -->
      <div v-if="error" class="text-center text-red-400">
        <p class="text-2xl">
          Error loading events. Please try again later.
        </p>
      </div>

      <!-- Events Grid -->
      <template v-else>
        {{ events }}

        <!-- Load More Button -->
        <div v-if="hasMore" class="mt-8 flex justify-center">
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="loadingMore"
            @click="loadMore"
          >
            {{ loadingMore ? 'Loading...' : 'Load More' }}
          </BaseButton>
        </div>

        <!-- No More Events Message -->
        <div v-else-if="events.length > 0" class="text-center text-gray-400">
          <p class="text-body">No more events to load</p>
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
