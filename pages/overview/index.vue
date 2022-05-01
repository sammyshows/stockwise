<template>
  <div class="overflow-hidden flex flex-col grow">
    <div class="flex justify-end mb-2 text-xs text-gray-400">
      <p class="grow">NAME</p>
      <p class="w-20 text-right ml-2">VALUE/COST</p>
      <p class="w-16 text-right ml-2">DAILY</p>
      <p class="w-16 text-right ml-2">TOTAL</p>
    </div>
    <div class="overflow-scroll grow">
      <NuxtLink v-for="portfolio in portfolios" :to="{ name: 'portfolios-portfolio', params: { portfolio: portfolio.id, portfolioName: portfolio.name } }">
        <div class="mb-5">
          <div class="flex justify-end">
            <div class="grow">
              <h2 class="h-5 w-28 text-sm font-bold tracking-wider truncate">{{ portfolio.name }}</h2>
              <p class="font-light text-tiny my-0.5 text-gray-300">{{ portfolio.holding_count }} HOLDINGS</p>
            </div>
            <div class="w-20 text-right mt-0.5 ml-2">
              <p class="h-5 text-xs font-light">A${{ $formatNumber(portfolio.current_value, 2) }}</p>
              <p class="text-tiny text-gray-300">A${{ $formatNumber(portfolio.initial_value, 2) }}</p>
            </div>
            <div class="w-16 text-right mt-0.5 ml-2" :class="{ 'text-bright-red': portfolio.daily_change < 0, 'text-bright-green': portfolio.daily_change > 0 }">
              <p class="h-5 text-xs font-light">{{ $addSign($formatNumber(portfolio.daily_change, 2)) || '---' }}</p>
              <p class="text-tiny">{{ $addSign($formatNumber(portfolio.daily_percent, 2)) }}%</p>
            </div>
            <!--    Currently shows all-time for ALL transactions, same as the other two lines as well. Ultimately, this
            should show active transactions but this requires the addition of an 'active' column in the database table    -->
            <div class="w-16 text-right mt-0.5 ml-2" :class="{ 'text-bright-red': portfolio.total_change < 0, 'text-bright-green': portfolio.total_change > 0 }">
              <p class="h-5 text-xs font-light">{{ $addSign($formatNumber(portfolio.total_change, 2)) || '---' }}</p>
              <p class="text-tiny">{{ $addSign($formatNumber(portfolio.total_change / portfolio.initial_value * 100, 2)) }}%</p>
            </div>
          </div>
          <!--   These two lines should show the all-time & realised values. This will again require the 'active'
          column (same as abaove) to determine which transactions are complete   -->
          <div v-if="portfolio.holding_count > 0">
            <p class="font-light text-tiny h-4">All-time: <span :class="{ 'text-bright-red': portfolio.total_change < 0, 'text-bright-green': portfolio.total_change > 0 }">{{ $addSign($formatNumber(portfolio.total_change, 2)) }}({{ $addSign($formatNumber(portfolio.total_change / portfolio.initial_value * 100, 2)) }}%)</span></p>
            <p class="font-light text-tiny">Realised: <span class="text-bright-green">+322.91(43%)</span></p>
          </div>
        </div>
      </NuxtLink>
    </div>
    <div class="flex justify-end py-2 border-y border-gray-600" style="box-shadow: 0 -5px 25px -20px rgb(75 85 99);">
      <div class="grow">
        <h2 class="h-5 w-28 text-sm font-bold tracking-wider truncate">Total</h2>
        <p class="font-light text-tiny my-0.5 text-gray-300 whitespace-nowrap">All-time: <span :class="{ 'text-bright-red': total.current_value - total.initial_value < 0, 'text-bright-green': total.current_value - total.initial_value > 0 }">{{ $addSign($formatNumber(total.current_value - total.initial_value, 2)) }}({{ $addSign($formatNumber((total.current_value - total.initial_value) / total.initial_value * 100, 2)) }}%)</span></p>
      </div>
      <div class="w-20 text-right mt-0.5 ml-2">
        <p class="h-5 text-xs font-light">A${{ $formatNumber(total.current_value, 2) }}</p>
        <p class="text-tiny text-gray-300">A${{ $formatNumber(total.initial_value, 2) }}</p>
      </div>
      <div class="w-16 text-right mt-0.5 ml-2" :class="{ 'text-bright-red': total.daily_change < 0, 'text-bright-green': total.daily_change > 0 }">
        <p class="h-5 text-xs font-light">{{ $addSign($formatNumber(total.daily_change, 2)) }}</p>
        <p class="text-tiny">{{ $addSign($formatNumber(total.daily_change / (total.current_value - total.daily_change) * 100, 2)) }}%</p>
      </div>
      <!--    Currently shows all-time for ALL transactions, same as the other two lines as well. Ultimately, this
      should show active transactions but this requires the addition of an 'active' column in the database table    -->
      <div class="w-16 text-right mt-0.5 ml-2" :class="{ 'text-bright-red': total.current_value - total.initial_value < 0, 'text-bright-green': total.current_value - total.initial_value > 0 }">
        <p class="h-5 text-xs font-light">{{ $addSign($formatNumber(total.current_value - total.initial_value, 2)) }}</p>
        <p class="text-tiny">{{ $addSign($formatNumber((total.current_value - total.initial_value) / total.initial_value * 100, 2)) }}%</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Portfolios",

  computed: {
    total: function() {
      return this.portfolios.reduce((total, { current_value, initial_value, daily_change, holding_count }) => {
        if (holding_count > 0) {
          total.current_value += parseFloat(current_value)
          total.initial_value += parseFloat(initial_value)
          total.daily_change += parseFloat(daily_change)
        }
        return total
      },
      // This is the initial value, `total`, passed to reduce:
      {
        current_value: 0,
        initial_value: 0,
        daily_change: 0
      })
    }
  },

  props: ['portfolios']
})
</script>
