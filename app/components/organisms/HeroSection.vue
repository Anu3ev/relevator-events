<template>
  <section>
    <div class="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 py-16 text-center sm:gap-8 sm:py-20 lg:py-24">
      <h1 class="max-w-full text-5xl font-semibold leading-[1.05] tracking-tight [overflow-wrap:anywhere] sm:text-6xl md:text-7xl lg:text-8xl">
        <slot name="title" />
      </h1>
      <p class="max-w-2xl text-lg leading-relaxed text-white/75 [overflow-wrap:anywhere] sm:text-xl lg:text-2xl">
        <slot name="subtitle" />
      </p>
    </div>
  </section>
</template>
