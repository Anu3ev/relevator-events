<template>
  <NuxtLink
    :to="`/event/${props.event.slug}`"
    class="block overflow-hidden rounded-3xl p-2 bg-white/10 hover:bg-white/15 transition-colors duration-300"
  >
    <!-- Event Image / Placeholder -->
    <div class="rounded-t-2xl h-[228px] w-full overflow-hidden bg-[#333333]">

      <NuxtImg
        v-if="props.event.image?.url"
        :src="props.event.image.url"
        :alt="props.event.title"
        class="h-full w-full object-cover"
        loading="lazy"
      />
    </div>

    <!-- Event Content -->
    <div class="flex flex-col gap-2 px-2 py-4">
      <h3 class="text-xl leading-[26px] font-semibold">
        {{ props.event.title }}
      </h3>

      <div
        v-if="dateParts"
        class="flex items-center gap-4 text-sm leading-none"
      >
        <span class="inline-flex items-center gap-2">
          <IconCalendar />
          <span>{{ dateParts.date }}</span>
        </span>

        <span class="inline-flex items-center gap-2">
          <IconClock />
          <span>{{ dateParts.time }}</span>
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Event } from '~~/types/event'

interface Props {
  event: Event
}

const props = defineProps<Props>()

const dateParts = computed(() => {
  if (!props.event.dateAndTime) return null
  const date = new Date(props.event.dateAndTime)

  return {
    date: new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date),
    time: new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(date)
  }
})
</script>
