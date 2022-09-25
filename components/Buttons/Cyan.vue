<template>
  <button @click="$emit('clicked')" class="flex px-6 py-1 rounded-lg bg-normal-cyan text-lg font-normal drop-shadow-md">
    <p>{{ text }}</p>
    <Spinner v-if="disabled" class="h-5 w-5 my-auto ml-2"></Spinner>
  </button>
</template>

<script lang="ts">
import Spinner from "~/components/Spinner.vue";
export default defineComponent({
  name: 'Cyan button',
  components: { Spinner },
  props: [ 'text', 'disabled' ]
})
</script>