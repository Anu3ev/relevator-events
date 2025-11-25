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
  const base = 'px-4 py-2 text-chip h-10 inline-flex items-center justify-center rounded-3xl whitespace-nowrap font-semibold'

  const variants = {
    default: 'bg-white/10',
    blue: 'bg-brand-accent text-black'
  }

  return [base, variants[props.variant]].join(' ')
})
</script>
