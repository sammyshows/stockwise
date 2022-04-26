<template>
  <div class="overflow-hidden flex flex-col">
    <div class="flex justify-end mb-2 text-xs text-gray-400">
      <p class="grow">NAME</p>
      <p class="w-20 text-right ml-2">VALUE/COST</p>
      <p class="w-16 text-right ml-2">DAILY</p>
      <p class="w-16 text-right ml-2">TOTAL</p>
    </div>
    <div class="overflow-scroll flex-1">
      <NuxtLink v-for="portfolio in portfolios" :to="{ name: 'portfolios-portfolio', params: { portfolio: portfolio.id, portfolioName: portfolio.name } }">
        <div class="flex justify-end">
          <div class="grow">
            <h2 class="h-5 w-28 text-sm font-bold tracking-wider truncate">{{ portfolio.name }}</h2>
            <p class="font-light text-tiny my-0.5 text-gray-300">{{ portfolio.transaction_count }} TRANSACTIONS</p>
          </div>
          <div class="w-20 text-right mt-0.5 ml-2">
            <p class="h-5 text-xs font-light">A${{ portfolio.current_value }}</p>
            <p class="text-tiny text-gray-300">A${{ portfolio.initial_value }}</p>
          </div>
          <div class="w-16 text-right mt-0.5 ml-2" :class="{ 'text-bright-red': portfolio.daily_change < 0, 'text-bright-green': portfolio.daily_change > 0 }">
            <p class="h-5 text-xs font-light">{{ $addSign(portfolio.daily_change) }}</p>
            <p class="text-tiny">{{ $addSign(portfolio.daily_percent) }}%</p>
          </div>
          <!--    Currently shows all-time for ALL transactions, same as the other two lines as well. Ultimately, this
          should show active transactions but this requires the addition of an 'active' column in the database table    -->
          <div class="w-16 text-right mt-0.5 ml-2" :class="{ 'text-bright-red': portfolio.total_change < 0, 'text-bright-green': portfolio.total_change > 0 }">
            <p class="h-5 text-xs font-light">{{ $addSign($round(portfolio.total_change, 2)) }}</p>
            <p class="text-tiny">{{ $addSign($round(portfolio.total_change / portfolio.initial_value * 100, 2)) }}%</p>
          </div>
        </div>
        <!--   These two lines should show the all-time & realised values. This will again require the 'active'
        column (same as abaove) to determine which transactions are complete   -->
        <p class="font-light text-tiny h-4">All-time: <span class="text-bright-green">{{ $addSign((portfolio.current_value - portfolio.initial_value).toFixed(2)) }}({{ $addSign($round(portfolio.total_change / portfolio.initial_value * 100, 2)) }}%)</span></p>
        <p class="font-light text-tiny mb-5">Realised: <span class="text-bright-green">+322.91(43%)</span></p>
      </NuxtLink>
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
