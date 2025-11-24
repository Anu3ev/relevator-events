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
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-full'

  // Variants tuned for both dark and light backgrounds
  const variants = {
    primary: 'bg-[#433AF8] text-white hover:bg-[#433AF8]/85',
    secondary: 'bg-white/10 text-white hover:bg-white/15',
    outline: 'border-2 border-black text-black hover:bg-black hover:text-white',
    ghost: 'bg-white text-black hover:bg-gray-100'
  }

  const sizes = {
    sm: 'px-6 text-[15px] leading-10',
    lg: 'px-6 text-lg leading-12'
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
