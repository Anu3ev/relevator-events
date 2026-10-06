<template>
  <div
    aria-hidden="true"
    class="event-artwork relative h-full w-full overflow-hidden"
    :style="palette"
  >
    <div class="artwork-grid absolute inset-0" />
    <div class="artwork-glow absolute inset-0" />
    <div class="artwork-orbit artwork-orbit-back" />
    <div class="artwork-orbit artwork-orbit-front" />
    <div class="artwork-star absolute" />
    <div class="absolute inset-x-6 bottom-5 flex items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">
      <span>Relevator</span>
      <span>Events</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ seed?: string }>(), { seed: '' })

const palette = computed(() => {
  const hash = Array.from(props.seed).reduce((value, character) => (value * 31 + character.charCodeAt(0)) >>> 0, 0)
  const palettes = [
    { '--artwork-base': '#141124', '--artwork-glow': '#5745db', '--artwork-accent': '#c1cfff' },
    { '--artwork-base': '#111726', '--artwork-glow': '#3b58a5', '--artwork-accent': '#a7baff' },
    { '--artwork-base': '#1d1025', '--artwork-glow': '#824eb4', '--artwork-accent': '#d9bbff' }
  ]
  return palettes[hash % palettes.length]
})
</script>

<style scoped>
.event-artwork {
  background: var(--artwork-base);
}
.artwork-grid {
  background-image: linear-gradient(#ffffff08 1px, transparent 1px), linear-gradient(90deg, #ffffff08 1px, transparent 1px);
  background-size: 42px 42px;
}
.artwork-glow {
  background: radial-gradient(ellipse at 55% 45%, var(--artwork-glow), transparent 70%);
  opacity: 0.65;
}
.artwork-orbit {
  position: absolute;
  left: 50%;
  top: 46%;
  width: 58%;
  height: 69%;
  border: 1px solid var(--artwork-accent);
  border-radius: 50%;
  box-shadow: inset 0 0 24px #ffffff08, 0 0 24px #ffffff08;
}
.artwork-orbit-back {
  transform: translate(-68%, -50%) rotate(-35deg);
  opacity: 0.5;
}
.artwork-orbit-front {
  transform: translate(-30%, -50%) rotate(35deg);
  background: linear-gradient(135deg, #ffffff10, transparent 70%);
  opacity: 0.85;
}
.artwork-star {
  left: 50%;
  top: 46%;
  width: 10px;
  height: 10px;
  transform: translate(-50%, -50%) rotate(45deg);
  background: var(--artwork-accent);
  box-shadow: 0 0 24px var(--artwork-accent);
}
</style>
