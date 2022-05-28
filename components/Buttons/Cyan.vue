<template>
  <button @click="$emit('clicked')" class="px-6 py-0.75 rounded-lg bg-bright-cyan text-black text-xl">{{ text }}</button>
</template>

<script lang="ts">
export default defineComponent({
  name: 'Cyan button',

  props: ['text']
})
</script>