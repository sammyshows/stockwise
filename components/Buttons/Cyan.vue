<template>
  <button @click="$emit('clicked')" class="px-6 py-1 rounded-lg bg-bright-cyan/30 text-lg font-normal drop-shadow-md">{{ text }}</button>
</template>

<script lang="ts">
export default defineComponent({
  name: 'Cyan button',

  props: ['text']
})
</script>