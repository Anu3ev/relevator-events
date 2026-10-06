<template>
  <component
    :is="buttonComponent"
    v-bind="isLink ? linkAttrs : buttonAttrs"
    :class="buttonClasses"
    @click="handleClick"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NuxtLink } from '#components'
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

const isLink = computed(() => Boolean(props.to))
// Disabled links have no navigation target, including through keyboard activation.
const buttonComponent = computed(() => {
  if (!isLink.value) return 'button'
  if (props.disabled) return 'span'

  return NuxtLink
})
const linkAttrs = computed(() => {
  if (props.disabled) return { role: 'link', 'aria-disabled': 'true' as const }

  return { to: props.to }
})

const buttonAttrs = computed(() => ({
  type: props.type,
  disabled: props.disabled
}))

const buttonClasses = computed(() => {
  const base = 'inline-flex max-w-full items-center justify-center rounded-full text-center font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'

  const variants = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary/85',
    secondary: 'bg-white/10 text-white hover:bg-white/15'
  }

  const sizes = {
    sm: 'min-h-11 px-6 py-2.5 text-[15px] leading-5',
    lg: 'min-h-14 px-8 py-3.5 text-base leading-6'
  }

  return [
    base,
    variants[props.variant],
    sizes[props.size],
    props.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
  ].join(' ')
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
