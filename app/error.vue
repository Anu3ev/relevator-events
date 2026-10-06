<template>
  <NuxtLayout>
    <section class="mx-auto flex max-w-3xl flex-col items-center gap-6 px-2 py-20 text-center sm:py-28">
      <p class="text-sm font-semibold uppercase tracking-widest text-brand-accent">
        Relevator events · {{ error.statusCode || 500 }}
      </p>
      <h1 class="text-4xl font-semibold leading-tight sm:text-6xl">{{ errorContent.title }}</h1>
      <p class="max-w-lg text-lg leading-relaxed text-white/75">{{ errorContent.description }}</p>
      <BaseButton to="/#events" @click.prevent="clearError({ redirect: '/#events' })">
        Browse events
      </BaseButton>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const errorContent = computed(() => {
  if (props.error.statusCode === 404) {
    return {
      title: 'Event not found',
      description: 'This event may have moved or is no longer available. Explore the directory to find another event.'
    }
  }

  return {
    title: 'Something went wrong',
    description: 'We could not open this page. Please return to the event directory and try again.'
  }
})

useHead(() => ({ title: `${errorContent.value.title} | Relevator` }))
</script>
