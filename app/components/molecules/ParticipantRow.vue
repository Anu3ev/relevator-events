<template>
  <article class="flex items-center gap-4 rounded-2xl bg-white/10 px-4 py-[19.5px]">
    <div class="h-14 w-14  overflow-hidden rounded-full bg-white/10">
      <NuxtImg
        v-if="participant.avatar?.url"
        :src="participant.avatar.url"
        :alt="participant.name"
        class="h-full w-full object-cover"
        loading="lazy"
      />
    </div>

    <div class="flex flex-col gap-1">
      <span class="truncate text-xl leading-6 font-semibold">
        {{ participant.name }}
      </span>
      <span v-if="participant.role" class="truncate text-base leading-[130%] text-[#BFBFBF]">
        {{ participant.role }}
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { EventParticipant } from '~~/types/event'

defineProps<{
  participant: EventParticipant
}>()
</script>
