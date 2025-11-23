<template>
  <div class="min-h-screen bg-black text-white flex flex-col">
    <div class="max-w-7xl mx-auto w-full">
      <Header />

      <main>
        <slot />
      </main>
    </div>
  </div>
</template>
