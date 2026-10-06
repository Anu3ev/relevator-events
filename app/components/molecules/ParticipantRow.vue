<template>
  <article class="flex min-w-0 items-center gap-4 rounded-2xl bg-white/10 px-4 py-5">
    <div aria-hidden="true" class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-base font-semibold text-brand-accent">
      <NuxtImg
        v-if="participant.avatar?.url && !imageFailed"
        :src="participant.avatar.url"
        alt=""
        class="h-full w-full object-cover"
        loading="lazy"
        @error="imageFailed = true"
      />
      <span v-else>{{ initials }}</span>
    </div>

    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <span class="text-xl font-semibold leading-6 [overflow-wrap:anywhere]">
        {{ participant.name }}
      </span>
      <span v-if="participant.role" class="text-base leading-[130%] text-[#BFBFBF] [overflow-wrap:anywhere]">
        {{ participant.role }}
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { EventParticipant } from '~~/types/event'

const props = defineProps<{
  participant: EventParticipant
}>()

const imageFailed = ref(false)
watch(() => props.participant.avatar?.url, () => { imageFailed.value = false })
const initials = computed(() => props.participant.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase())
</script>
