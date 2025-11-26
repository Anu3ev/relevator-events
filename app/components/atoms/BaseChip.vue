<template>
  <span :class="chipClasses">
    <slot />
  </span>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'blue'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const chipClasses = computed(() => {
  const base = 'pl-3 pr-4 py-2 h-10 text-chip inline-flex items-center justify-center rounded-3xl whitespace-nowrap font-semibold'

  const variants = {
    default: 'bg-white/10',
    blue: 'pl-4 bg-brand-accent text-black'
  }

  return [base, variants[props.variant]].join(' ')
})
</script>
