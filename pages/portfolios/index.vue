<template>
  <div>
    <div class="flex justify-end mb-2 text-xs text-gray-400">
      <p class="grow">NAME</p>
      <p class="w-20 text-right ml-2">VALUE/COST</p>
      <p class="w-16 text-right ml-2">DAILY</p>
      <p class="w-16 text-right ml-2">ALL-TIME</p>
    </div>

    <div v-for="portfolio in portfolios" class="mb-5">
      <div class="flex justify-end">
        <div class="grow">
          <h2 class="h-5 w-28 text-sm font-bold tracking-wider truncate">{{ portfolio.name }}</h2>
          <p class="font-light text-tiny my-0.5 text-gray-300">23 TRANSACTIONS</p>
        </div>
        <div class="w-20 text-right mt-0.5 ml-2">
          <p class="h-5 text-xs font-light">A$6129.87</p>
          <p class="text-tiny text-gray-500">A$2876.48</p>
        </div>
        <div class="w-16 text-right mt-0.5 ml-2">
          <p class="h-5 text-xs font-light text-bright-red">-A$129.84</p>
          <p class="text-tiny text-bright-red">-2.07%</p>
        </div>
        <div class="w-16 text-right mt-0.5 ml-2">
          <p class="h-5 text-xs font-light text-bright-green">A$2932.51</p>
          <p class="text-tiny text-bright-green">80.07%</p>
        </div>
      </div>
      <p class="font-light text-tiny h-4">All-time: <span class="text-bright-green">A$3378.39(87%)</span></p>
      <p class="font-light text-tiny">Realised: <span class="text-bright-green">A$1722.91(43%)</span></p>
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