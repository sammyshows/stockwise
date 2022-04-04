<template>
  <div>
    <div class="flex justify-end gap-3 mb-2 text-xs text-gray-400">
      <p class="grow">NAME</p>
      <p class="w-20 text-right">VALUE/COST</p>
      <p class="w-16 text-right">DAILY</p>
      <p class="w-16 text-right">ALL-TIME</p>
    </div>

    <div v-for="portfolio in portfolios" class="flex justify-end gap-3 h-20">
      <div class="grow truncate">
        <h2 class="font-bold h-7 tracking-wider truncate">{{ portfolio.name }}</h2>
        <p class="font-light text-tiny h-4">All-time: <span class="text-bright-green">A$3378.39(87%)</span></p>
        <p class="font-light text-tiny">All-time: <span class="text-bright-green">A$1722.91(43%)</span></p>
      </div>
      <div class="w-20 text-right mt-1">
        <p class="h-6 text-xs font-light">A$6129.87</p>
        <p class="text-tiny text-gray-500">A$2876.48</p>
      </div>
      <div class="w-16 text-right mt-1">
        <p class="h-6 text-xs font-light text-bright-red">-A$129.84</p>
        <p class="text-tiny text-bright-red">-2.07%</p>
      </div>
      <div class="w-16 text-right mt-1">
        <p class="h-6 text-xs font-light text-bright-green">A$2932.51</p>
        <p class="text-tiny text-bright-green">80.07%</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Portfolios",

  props: ['portfolios']
})
</script>