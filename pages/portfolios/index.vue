<template>
  <div class="overflow-hidden flex flex-col grow">
    <div class="flex justify-end px-3 mb-2 text-xs text-gray-400">
      <p class="grow">NAME</p>
      <p class="w-20 text-right ml-2">VALUE/COST</p>
      <p class="w-16 text-right ml-2">DAILY</p>
      <p class="w-16 text-right ml-2">TOTAL</p>
    </div>
    <div class="overflow-scroll grow px-3">
      <NuxtLink v-for="portfolio in portfolios" :to="{ name: 'portfolios-portfolio', params: { portfolio: portfolio.id, portfolioName: portfolio.name } }">
        <div class="mb-3">
          <div class="flex justify-end">
            <div class="grow">
              <h2 class="h-5 w-28 text-sm font-bold tracking-wider truncate">{{ portfolio.name }}</h2>
              <p class="font-light text-tiny my-0.5 text-gray-300">{{ portfolio.holding_count }} HOLDINGS</p>
            </div>
            <div class="w-20 text-right mt-0.5 ml-2 font-normal">
              <p class="h-5 text-xs">A${{ $formatNumber(portfolio.current_value, 2) }}</p>
              <p class="text-tiny text-gray-300">A${{ $formatNumber(portfolio.initial_value, 2) }}</p>
            </div>
            <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': portfolio.daily_change < 0, 'text-bright-green': portfolio.daily_change > 0 }">
              <p class="h-5 text-xs">{{ $addSign($formatNumber(portfolio.daily_change, 2)) || '---' }}</p>
              <p class="text-tiny">{{ $addSign($formatNumber(portfolio.daily_change / (portfolio.current_value - portfolio.daily_change) *100, 2)) }}%</p>
            </div>
            <!--    Currently shows all-time for ALL transactions, same as the other two lines as well. Ultimately, this
            should show active transactions but this requires the addition of an 'active' column in the database table    -->
            <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': portfolio.total_change < 0, 'text-bright-green': portfolio.total_change > 0 }">
              <p class="h-5 text-xs">{{ $addSign($formatNumber(portfolio.total_change, 2)) || '---' }}</p>
              <p class="text-tiny">{{ $addSign($formatNumber(portfolio.total_change / portfolio.initial_value * 100, 2)) }}%</p>
            </div>
          </div>
          <!--   These two lines should show the all-time & realised values. This will again require the 'active'
          column (same as abaove) to determine which transactions are complete   -->
          <div v-if="portfolio.realized">
            <p class="text-tiny h-4">Realized: <span class="font-normal" :class="{ 'text-bright-red': portfolio.realized < 0, 'text-bright-green': portfolio.realized > 0 }">{{ $addSign($formatNumber(portfolio.realized, 2)) }} ({{ $addSign($formatNumber(portfolio.realized / portfolio.realized_initial * 100, 2)) }}%)</span></p>
            <p class="text-tiny">All-time: <span class="font-normal" :class="{ 'text-bright-red': parseFloat(portfolio.realized) + parseFloat(portfolio.total_change) < 0, 'text-bright-green': parseFloat(portfolio.realized) + parseFloat(portfolio.total_change) > 0 }">{{ $addSign($formatNumber(parseFloat(portfolio.realized) + parseFloat(portfolio.total_change), 2)) }} ({{ $addSign($formatNumber((parseFloat(portfolio.realized) + parseFloat(portfolio.total_change)) / portfolio.all_time_initial * 100, 2)) }}%)</span></p>
          </div>
        </div>
      </NuxtLink>
    </div>
    <div v-if="portfolios != null && portfolios.length > 0" class="py-2 px-3 border-y border-gray-300 bg-gray-900/30" style="box-shadow: 0 -5px 25px -20px rgb(75 85 99);">
      <div class="flex justify-end">
        <div class="grow">
          <h2 class="text-sm font-bold tracking-wider truncate">Summary</h2>
          <p class="font-light text-tiny my-0.5 text-gray-300">{{ portfolios.length }} PORTFOLIOS</p>
        </div>
          <div class="w-20 text-right mt-0.5 ml-2 font-normal">
          <p class="h-5 text-xs">A${{ $formatNumber(total.current_value, 2) }}</p>
          <p class="text-tiny text-gray-300">A${{ $formatNumber(total.initial_value, 2) }}</p>
        </div>
        <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': total.daily_change < 0, 'text-bright-green': total.daily_change > 0 }">
          <p class="h-5 text-xs">{{ $addSign($formatNumber(total.daily_change, 2)) }}</p>
          <p class="text-tiny">{{ $addSign($formatNumber(total.daily_change / (total.current_value - total.daily_change) * 100, 2)) }}%</p>
        </div>
        <!--    Currently shows all-time for ALL transactions, same as the other two lines as well. Ultimately, this
        should show active transactions but this requires the addition of an 'active' column in the database table    -->
        <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': total.current_value - total.initial_value < 0, 'text-bright-green': total.current_value - total.initial_value > 0 }">
          <p class="h-5 text-xs">{{ $addSign($formatNumber(total.current_value - total.initial_value, 2)) }}</p>
          <p class="text-tiny">{{ $addSign($formatNumber((total.current_value - total.initial_value) / total.initial_value * 100, 2)) }}%</p>
        </div>
      </div>
      <div v-if="total.realized">
        <p class="text-tiny my-0.5 text-gray-300">Realized: <span class="font-normal" :class="{ 'text-bright-red': total.realized < 0, 'text-bright-green': total.realized > 0 }">{{ $addSign($formatNumber(total.realized, 2)) }} ({{ $addSign($formatNumber(total.realized / total.realized_initial * 100, 2)) }}%)</span></p>
        <p class="text-tiny my-0.5 text-gray-300">All-time: <span class="font-normal" :class="{ 'text-bright-red': total.realized + (total.current_value - total.initial_value) < 0, 'text-bright-green': total.realized + (total.current_value - total.initial_value) > 0 }">{{ $addSign($formatNumber(total.realized + (total.current_value - total.initial_value), 2)) }} ({{ $addSign($formatNumber((total.realized + (total.current_value - total.initial_value)) / total.all_time_initial * 100, 2)) }}%)</span></p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Portfolios",

  props: ['portfolios'],

  computed: {
    total: function() {
      return this.portfolios.reduce((total, { current_value, initial_value, daily_change, holding_count, all_time_initial, realized, realized_initial }) => {
            if (holding_count > 0) {
              total.current_value += parseFloat(current_value)
              total.initial_value += parseFloat(initial_value)
              total.daily_change += parseFloat(daily_change)
              total.all_time_initial += parseFloat(all_time_initial || initial_value)
            }

            if (realized) {
              total.realized += parseFloat(realized)
              total.realized_initial += parseFloat(realized_initial)
            }

            return total
          },
          // This is the initial value, `total`, passed to reduce:
          {
            current_value: 0,
            initial_value: 0,
            daily_change: 0,
            all_time_initial: 0,
            realized: 0,
            realized_initial: 0
          })
    }
  }
})
</script>
