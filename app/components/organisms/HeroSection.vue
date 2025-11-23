<template>
  <section>
    <div class="mx-auto flex w-full flex-col items-center py-20 gap-8 text-center">
      <h1 class="text-8xl font-semibold">
        <slot name="title" />
      </h1>
      <p class="text-2xl text-opacity-75 leading-9 text-gray-300">
        <slot name="subtitle" />
      </p>
    </div>
  </section>
</template>
