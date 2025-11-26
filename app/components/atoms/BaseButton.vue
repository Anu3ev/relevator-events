<template>
  <component
    :is="isLink ? 'NuxtLink' : 'button'"
    v-bind="isLink ? linkAttrs : buttonAttrs"
    :class="buttonClasses"
    @click="handleClick"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

interface Props {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'lg'
  disabled?: boolean
  to?: RouteLocationRaw | null
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'sm',
  disabled: false,
  to: null,
  type: 'button'
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const isLink = computed(() => !!props.to)

const linkAttrs = computed(() => ({
  to: props.to,
  'aria-disabled': props.disabled ? 'true' : undefined,
  tabindex: props.disabled ? -1 : undefined
}))

const buttonAttrs = computed(() => ({
  type: props.type,
  disabled: props.disabled
}))

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-full px-6 text-btn'

  const variants = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary/85',
    secondary: 'bg-white/10 text-white hover:bg-white/15'
  }

  const disabledClasses = props.disabled
    ? 'opacity-60 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer'

  return [
    base,
    variants[props.variant],
    disabledClasses
  ]
    .filter(Boolean)
    .join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  emit('click', event)
}
</script>
