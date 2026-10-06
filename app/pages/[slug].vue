<template>
  <div class="pt-10 sm:pt-16">
    <NuxtLink to="/#events" aria-label="Back to events" class="mb-8 inline-flex rounded text-sm text-brand-accent underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">← Back to events</NuxtLink>
    <p v-if="pending" role="status" class="py-16 text-center">Loading event...</p>
    <section v-else-if="error" role="alert" class="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center">
      <h1 class="text-3xl font-semibold sm:text-5xl">Could not load this event</h1>
      <p class="text-white/75">Please try again in a moment.</p>
      <BaseButton variant="secondary" @click="refresh()">Try again</BaseButton>
    </section>
    <div v-else-if="event" class="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16">
      <section class="flex min-w-0 flex-col gap-10">
        <div class="flex min-w-0 flex-col items-start gap-6">
          <div v-if="tags.length" class="flex max-w-full flex-wrap gap-3">
            <BaseChip v-for="tag in tags" :key="tag" variant="blue">{{ tag }}</BaseChip>
          </div>
          <h1 class="max-w-full break-words text-4xl font-semibold leading-tight sm:text-6xl lg:text-7xl">{{ event.title }}</h1>
          <p v-if="event.description" class="max-w-full whitespace-pre-line break-words text-lg leading-relaxed sm:text-xl">{{ event.description }}</p>
          <div v-if="dateParts" class="flex max-w-full flex-wrap items-center gap-3 text-sm">
            <BaseChip><span class="inline-flex items-center gap-3"><IconCalendar /><span>{{ dateParts.date }}</span></span></BaseChip>
            <BaseChip><span class="inline-flex items-center gap-3"><IconClock /><span>{{ dateParts.time }}</span></span></BaseChip>
          </div>
        </div>
        <figure class="rounded-3xl border border-white/10 bg-white/5 p-2">
          <div class="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-800">
            <NuxtImg v-if="event.image?.url && !imageFailed" :src="event.image.url" :alt="event.title" class="h-full w-full object-cover" @error="imageFailed = true" />
            <EventArtwork v-else :seed="event.slug" />
          </div>
        </figure>
      </section>
      <aside v-if="event.participants?.length" class="flex min-w-0 flex-col gap-6" aria-labelledby="participants-heading">
        <h2 id="participants-heading" class="break-words text-3xl font-semibold">{{ event.participantsTitle || 'Participants' }}</h2>
        <div class="flex flex-col gap-3">
          <ParticipantRow v-for="(participant, index) in event.participants" :key="`${participant.name}-${index}`" :participant="participant" />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatEventDate } from '~/utils/eventDate'

definePageMeta({ key: route => route.fullPath })
const route = useRoute()
const { event, pending, error, status, refresh } = await useEventDetail({ slug: String(route.params.slug) })
const imageFailed = ref(false)
watch(() => event.value?.image?.url, () => { imageFailed.value = false })
const tags = computed(() => event.value?.tags?.split(',').map(tag => tag.trim()).filter(Boolean) ?? [])
const dateParts = computed(() => formatEventDate(event.value?.dateAndTime))

watch([status, event], () => {
  if (status.value === 'success' && !event.value) {
    showError({ statusCode: 404, statusMessage: 'Event not found' })
  }
}, { immediate: true })

useHead(() => ({
  title: event.value?.seo?.title || event.value?.title || 'Event | Relevator',
  meta: [{ name: 'description', content: event.value?.seo?.description || event.value?.description || 'Explore events with Relevator.' }]
}))
</script>
