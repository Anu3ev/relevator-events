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
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  to?: RouteLocationRaw | null
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
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
  const base = 'inline-flex items-center justify-center font-semibold tracking-tight transition-colors duration-200 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

  // Variants tuned for both dark and light backgrounds
  const variants = {
    primary: 'bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:ring-indigo-200 focus-visible:ring-offset-black',
    secondary: 'bg-white/10 text-white border border-white/10 hover:bg-white/20 focus-visible:ring-white/30 focus-visible:ring-offset-black',
    outline: 'border-2 border-black text-black hover:bg-black hover:text-white focus-visible:ring-black focus-visible:ring-offset-white',
    ghost: 'bg-white text-black hover:bg-gray-100 focus-visible:ring-gray-300 focus-visible:ring-offset-white'
  }

  const sizes = {
    sm: 'px-3.5 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  const disabledClasses = props.disabled
    ? 'opacity-60 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer'

  return [
    base,
    variants[props.variant],
    sizes[props.size],
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
