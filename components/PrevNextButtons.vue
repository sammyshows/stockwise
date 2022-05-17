<template>
  <div class="mb-7 flex justify-between">
    <button @click="$emit('prevPage')" class="w-28 h-8 rounded-lg border border-gray-400 bg-white/10 text-xl">PREV</button>
    <button @click="$emit('nextPage')" class="w-28 h-8 rounded-lg border border-gray-400 border bg-white/10 text-xl">NEXT</button>
  </div>
</template>