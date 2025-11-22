<template>
  <section class="bg-black text-white">
    <div class="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-20 gap-8 text-center">
      <h1 class="text-h1 leading-tight tracking-tight">
        <slot name="title">Hero Title</slot>
      </h1>
      <p class="text-body text-gray-300">
        <slot name="subtitle">
          Dive into the Rhythm Report for deep insights, emerging trends, and exclusive interviews
          shaping the future of music and rights management.
        </slot>
      </p>
    </div>
  </section>
</template>
