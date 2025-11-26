<template>
  <div>
    <!-- Event Grid -->
    <div
      v-if="events.length"
      class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
    >
      <EventCard
        v-for="event in events"
        :key="event.id"
        :event="event"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="text-center text-gray-400"
    >
      <p class="text-2xl">No events found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Event } from '~~/types/event'

withDefaults(defineProps<{
  events: Event[]
}>(), {})
</script>
