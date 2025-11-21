<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-semibold mb-6">Events from DatoCMS</h1>

    <div v-if="data" class="space-y-4">
      {{ data }}
      <div v-if="data?.allEvents?.length === 0" class="text-gray-500">
        No events found. Please create some events in DatoCMS.
      </div>

      <div
        v-for="event in data.allEvents"
        :key="event.id"
        class="border p-4 rounded-lg"
      >
        <h2 class="text-xl font-medium">{{ event.title }}</h2>
        <p class="mt-2">{{ event.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const data = await useDatoCms({
  query: `
    query {
      allEvents {
        title
        slug
        dateAndTime
        image {
          url
        }
        description
        tags {
          value
        }
      }
    }
  `
})
</script>
