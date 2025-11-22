<template>
  <header
    class="sticky top-0 z-50 transition-all duration-300"
    :class="isScrolled ? 'pt-1' : 'pt-6'"
  >
    <div class="mx-auto flex w-full max-w-6xl items-center justify-between px-6">
      <Logo />

      <BaseButton variant="primary" size="sm">
        CTA Button
      </BaseButton>
    </div>
  </header>
</template>

<script setup lang="ts">
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
