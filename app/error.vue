<template>
  <NuxtLayout>
    <section class="mx-auto flex max-w-3xl flex-col items-center gap-6 px-2 py-20 text-center sm:py-28">
      <p class="text-sm font-semibold uppercase tracking-widest text-brand-accent">Relevator events · {{ error?.statusCode || 500 }}</p>
      <h1 class="text-4xl font-semibold leading-tight sm:text-6xl">{{ isMissing ? 'Event not found' : 'Something went wrong' }}</h1>
      <p class="max-w-lg text-lg leading-relaxed text-white/75">{{ isMissing ? 'This event may have moved or is no longer available. Explore the directory to find another event.' : 'We could not open this page. Please return to the event directory and try again.' }}</p>
      <BaseButton to="/#events" @click.prevent="clearError({ redirect: '/#events' })">Browse events</BaseButton>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'
const props = defineProps<{ error: NuxtError }>()
const isMissing = computed(() => props.error?.statusCode === 404)
useHead({ title: isMissing.value ? 'Event not found | Relevator' : 'Something went wrong | Relevator' })
</script>
