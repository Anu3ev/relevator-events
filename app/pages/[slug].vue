<template>
  <div class="pt-[88px]">
    <section
      v-if="error || !eventData"
      class="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-8 rounded-3xl border border-white/10 bg-white/5 px-10 py-16 text-center shadow-[0_0_20px_rgba(0,0,0,0.15)]"
    >
      <div class="space-y-4">
        <h1 class="text-event-title font-semibold">
          Event Not Found
        </h1>
        <p class="text-lg text-white/70">
          Sorry, we couldn't find the event you're looking for right now.
        </p>
      </div>
      <BaseButton variant="secondary" size="sm" to="/">
        Back to Events
      </BaseButton>
    </section>

    <div v-else class="grid lg:grid-cols-[minmax(0,720px)_minmax(280px,1fr)] gap-20">
      <section class="flex flex-col gap-12 shadow-[0_0_20px_rgba(0,0,0,0.15)] rounded-xl">
        <div class="flex flex-col items-start gap-8">
          <div v-if="tags.length" class="flex gap-3">
            <BaseChip v-for="tag in tags" :key="tag" variant="blue">
              {{ tag }}
            </BaseChip>
          </div>


          <h1 class="text-event-title font-semibold">
            {{ eventData.title }}
          </h1>

          <p v-if="eventData.description" class="text-xl leading-[170%]">
            {{ eventData.description }}
          </p>

          <div
            v-if="formattedDate"
            class="flex items-center gap-4 text-sm leading-none"
          >
            <BaseChip v-if="formattedDate">
              <span class="inline-flex items-center gap-4">
                <IconCalendar />
                <span>{{ formattedDate }}</span>
              </span>
            </BaseChip>

            <BaseChip v-if="formattedTime">
              <span class="inline-flex items-center gap-4">
                <IconClock />
                <span>{{ formattedTime }}</span>
              </span>
            </BaseChip>
          </div>
        </div>

        <figure class="rounded-3xl bg-white/5 border-[0.54px] border-white/10 p-[8.67px]">
          <div class="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-800">
            <NuxtImg
              v-if="heroImage"
              :src="heroImage"
              :alt="eventData.title"
              class="h-full w-full object-cover"
            />
          </div>
        </figure>
      </section>

      <aside class="flex flex-col gap-8">
        <div class="flex items-center justify-between">
          <h2 class="text-participants-header font-semibold">
            {{ eventData.participantsTitle }}
          </h2>
        </div>

        <div v-if="participantsLength" class="flex flex-col gap-2">
          <ParticipantRow
            v-for="participant in eventData.participants"
            :key="participant.name"
            :participant="participant"
          />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const { event, pending, error } = await useEventDetail({
  slug: route.params.slug as string
})

const eventData = computed(() => event.value ?? null)
const heroImage = computed(() => {
  const { value: currentEvent } = eventData
  return currentEvent?.image?.url ?? ''
})

const tags = computed(() => {
  return eventData.value?.tags?.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) ?? []
})

const seo = computed(() => {
  return eventData.value?.seo ?? null
})

const participantsLength = computed(() => {
  return eventData.value?.participants?.length ?? 0
})

const formattedDate = computed(() => {
  const { value: currentEvent } = eventData
  if (!currentEvent?.dateAndTime) return ''
  const date = new Date(currentEvent.dateAndTime)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
})
const formattedTime = computed(() => {
  const { value: currentEvent } = eventData
  if (!currentEvent?.dateAndTime) return ''
  const date = new Date(currentEvent.dateAndTime)
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    timeZoneName: 'short'
  }).format(date)
})

watchEffect(() => {
  const { value: isPending } = pending
  const { value: hasError } = error
  const { value: currentEvent } = event

  if (isPending || hasError || currentEvent) return

  throw createError({
    statusCode: 404,
    statusMessage: 'Event Not Found',
    fatal: true
  })
})

useHead(() => {
  const { value: currentEvent } = event

  return {
    title: seo.value?.title || currentEvent?.title,
    meta: [
      {
        name: 'description',
        content: seo.value?.description || currentEvent?.description
      }
    ]
  }
})
</script>
