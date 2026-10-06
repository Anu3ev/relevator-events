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
  const base = 'inline-flex min-h-10 max-w-full items-center justify-center rounded-3xl px-4 py-2 text-chip font-semibold whitespace-normal [overflow-wrap:anywhere]'

  const variants = {
    default: 'bg-white/10',
    blue: 'bg-brand-accent text-black'
  }

  return [base, variants[props.variant]].join(' ')
})
</script>
