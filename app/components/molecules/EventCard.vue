<template>
  <NuxtLink
    data-testid="event-card"
    :to="`/${props.event.slug}`"
    class="group flex h-full min-w-0 flex-col overflow-hidden rounded-3xl bg-white/10 p-2 transition-colors duration-200 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
  >
    <div class="h-[228px] w-full shrink-0 overflow-hidden rounded-2xl bg-surface-card">
      <NuxtImg
        v-if="props.event.image?.url && !imageFailed"
        :src="props.event.image.url"
        alt=""
        class="h-full w-full object-cover"
        loading="lazy"
        @error="imageFailed = true"
      />
      <EventArtwork v-else :seed="props.event.slug" />
    </div>

    <div class="flex min-w-0 flex-1 flex-col gap-3 px-2 py-4">
      <h3 class="text-xl font-semibold leading-[26px] [overflow-wrap:anywhere]">
        {{ props.event.title }}
      </h3>

      <time
        v-if="dateParts"
        :datetime="props.event.dateAndTime"
        class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm leading-5 text-white/80"
      >
        <span class="inline-flex items-center gap-2">
          <IconCalendar aria-hidden="true" class="shrink-0" />
          <span>{{ dateParts.date }}</span>
        </span>

        <span class="inline-flex items-center gap-2">
          <IconClock aria-hidden="true" class="shrink-0" />
          <span>{{ dateParts.time }}</span>
        </span>
      </time>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Event } from '~~/types/event'
import { formatEventDate } from '~/utils/eventDate'

const props = defineProps<{
  event: Event
}>()

const imageFailed = ref(false)
watch(() => props.event.image?.url, () => { imageFailed.value = false })
const dateParts = computed(() => formatEventDate(props.event.dateAndTime))
</script>
