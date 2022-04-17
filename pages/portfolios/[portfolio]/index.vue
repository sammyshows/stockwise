<template>
  <div class="flex flex-col flex-1">
    <div class="flex justify-end mb-2 text-xs text-gray-400">
      <p class="grow">NAME</p>
      <p class="w-20 text-right ml-2">VALUE/COST</p>
      <p class="w-16 text-right ml-2">DAILY</p>
      <p class="w-16 text-right ml-2">ALL-TIME</p>
    </div>

<!--    <NuxtLink v-for="holding in holdings" :to="{ name: 'holdings-holding', params: { holding: holding.id } }" class="mb-5">-->
    <div v-for="holding in holdings"> <!--   temp div until nuxtlink has valid route   -->
      <div class="flex justify-end">
        <div class="grow">
          <h2 class="h-5 w-28 text-sm font-bold tracking-wider truncate">{{ holding.symbol.toUpperCase() }}</h2>
          <p class="font-light text-tiny my-0.5 text-gray-300">{{ holding.transaction_count }} TRANSACTIONS</p>
        </div>
        <div class="w-20 text-right mt-0.5 ml-2">
          <p class="h-5 text-xs font-light">A${{ holding.current_value }}</p>
          <p class="text-tiny text-gray-500">A${{ holding.initial_value }}</p>
        </div>
        <div class="w-16 text-right mt-0.5 ml-2">
          <p class="h-5 text-xs font-light text-bright-red">A${{ holding.daily_value }}</p>
          <p class="text-tiny text-bright-red">{{ holding.daily_percent }}%</p>
        </div>
        <!--    Currently shows all-time for ALL transactions, same as the other two lines as well. Ultimately, this
        should show active transactions but this requires the addition of an 'active' column in the database table    -->
        <div class="w-16 text-right mt-0.5 ml-2">
          <p class="h-5 text-xs font-light text-bright-green">A${{ (holding.current_value - holding.initial_value).toFixed(2) }}</p>
          <p class="text-tiny text-bright-green">{{ holding.total_percent }}%</p>
        </div>
      </div>
      <!--   These two lines should show the all-time & realised values. This will again require the 'active'
      column (same as abaove) to determine which transactions are complete   -->
      <p class="font-light text-tiny h-4">All-time: <span class="text-bright-green">A${{ (holding.current_value - holding.initial_value).toFixed(2) }}({{ holding.total_percent }}%)</span></p>
      <p class="font-light text-tiny mb-5">Realised: <span class="text-bright-green">A$322.91(43%)</span></p>
    </div>
    <p v-if="holdings != null && holdings.length === 0" class="grow flex items-center px-1 text-sm text-bright-cyan text-center">To start tracking an investment in this portfolio, use the "+" icon above to record a transaction</p>
<!--    </NuxtLink>-->
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Holdings",

  props: ['holdings']
})
</script>