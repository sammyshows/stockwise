<template>
  <div class="flex flex-col grow overflow-hidden">
    <div class="flex justify-end mb-2 px-3 text-xs text-gray-400">
      <p class="grow">NAME</p>
      <p class="w-20 text-right ml-2">VALUE/COST</p>
      <p class="w-16 text-right ml-2">DAILY</p>
      <p class="w-16 text-right ml-2">TOTAL</p>
    </div>
    <div v-if="holdings != null && holdings.length > 0" class="grow overflow-scroll px-3">
      <NuxtLink v-for="holding in holdings" :to="{ name: 'portfolios-portfolio-holdings-holding', params: { portfolio: $route.params.portfolio, holding: holding.id, assetSymbol: holding.symbol, assetName: holding.name } }">
        <div class="mb-3">
          <div class="flex justify-end">
            <div class="grow">
              <h2 class="h-5 w-28 text-sm font-bold tracking-wider truncate">{{ holding.symbol.toUpperCase() }}</h2>
              <p class="text-tiny my-0.5 text-gray-300">{{holding.current_price}} x {{ $formatNumber(holding.share_count, 2) }}</p>
            </div>
            <div class="w-20 text-right mt-0.5 ml-2 font-normal">
              <p class="h-5 text-xs">A${{ $formatNumber(holding.current_value, 2) }}</p>
              <p class="text-tiny text-gray-300">A${{ $formatNumber(holding.initial_value, 2) }}</p>
            </div>
            <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': holding.daily_change < 0, 'text-bright-green': holding.daily_change > 0 }">
              <p class="h-5 text-xs">{{ $addSign($formatNumber(holding.daily_change, 2)) }}</p>
              <p class="text-tiny">{{ $addSign($formatNumber(holding.daily_percent, 2)) }}%</p>
            </div>
            <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': holding.total_change < 0, 'text-bright-green': holding.total_change > 0 }">
              <p class="h-5 text-xs">{{ $addSign($formatNumber(holding.total_change, 2)) }}</p>
              <p class="text-tiny">{{ $addSign($formatNumber(BigNumber(holding.total_change).div(holding.initial_value).times(100), 2)) }}%</p>
            </div>
          </div>

          <div v-if="holding.realized">
            <p class="font-light text-tiny">Realized: <span class="font-normal" :class="{ 'text-bright-red': holding.realized < 0, 'text-bright-green': holding.realized > 0 }">{{ $addSign($formatNumber(holding.realized, 2)) }} ({{ $addSign($formatNumber(BigNumber(holding.realized).div(holding.realized_initial).times(100), 2)) }}%)</span></p>
            <p class="font-light text-tiny h-4">All-time: <span class="font-normal" :class="{ 'text-bright-red': BigNumber(holding.realized).plus(holding.total_change).isLessThan(0), 'text-bright-green': BigNumber(holding.realized).plus(holding.total_change).isGreaterThan(0) }">{{ $addSign($formatNumber(BigNumber(holding.realized).plus(holding.total_change), 2)) }} ({{ $addSign($formatNumber(BigNumber(holding.realized).plus(holding.total_change).div(holding.all_time_initial).times(100), 2)) }}%)</span></p>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div v-if="holdings != null && holdings.length > 0" class="py-2 px-3 border-y border-gray-300 bg-gray-900/30" style="box-shadow: 0 -5px 25px -20px rgb(75 85 99);">
      <div class="flex justify-end">
        <div class="grow">
          <h2 class="text-sm font-bold tracking-wider truncate">Summary</h2>
          <p class="font-light text-tiny my-0.5 text-gray-300">{{ holdings.length }} HOLDINGS</p>
        </div>
        <div class="w-20 text-right mt-0.5 ml-2 font-normal">
          <p class="h-5 text-xs">A${{ $formatNumber(total.current_value, 2) }}</p>
          <p class="text-tiny text-gray-300">A${{ $formatNumber(total.initial_value, 2) }}</p>
        </div>
        <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': total.daily_change < 0, 'text-bright-green': total.daily_change > 0 }">
          <p class="h-5 text-xs">{{ $addSign($formatNumber(total.daily_change, 2)) }}</p>
          <p class="text-tiny">{{ $addSign($formatNumber(total.daily_change.div(BigNumber(total.current_value).minus(total.daily_change)).times(100), 2)) }}%</p>
        </div>
        <!--    Currently shows all-time for ALL transactions, same as the other two lines as well. Ultimately, this
        should show active transactions but this requires the addition of an 'active' column in the database table    -->
        <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': total.current_value - total.initial_value < 0, 'text-bright-green': total.current_value - total.initial_value > 0 }">
          <p class="h-5 text-xs">{{ $addSign($formatNumber(total.current_value.minus(total.initial_value), 2)) }}</p>
          <p class="text-tiny">{{ $addSign($formatNumber(total.current_value.minus(total.initial_value).div(total.initial_value).times(100), 2)) }}%</p>
        </div>
      </div>
      <div v-if="total.realized">
        <p class="text-tiny my-0.5 text-gray-300">Realized: <span class="font-normal" :class="{ 'text-bright-red': total.realized < 0, 'text-bright-green': total.realized > 0 }">{{ $addSign($formatNumber(total.realized, 2)) }} ({{ $addSign($formatNumber(total.realized.div(total.realized_initial).times(100), 2)) }}%)</span></p>
        <p class="text-tiny my-0.5 text-gray-300">All-time: <span class="font-normal" :class="{ 'text-bright-red': total.realized.plus(total.current_value).minus(total.initial_value).isLessThan(0), 'text-bright-green': total.realized.plus(total.current_value).minus(total.initial_value).isGreaterThan(0) }">{{ $addSign($formatNumber(total.realized.plus(total.current_value).minus(total.initial_value), 2)) }} ({{ $addSign($formatNumber(total.realized.plus(total.current_value).minus(total.initial_value).div(total.all_time_initial).times(100), 2)) }}%)</span></p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BigNumber from "bignumber.js";

export default defineComponent({
  name: "Holdings",

  props: ['holdings'],

  computed: {
    total: function() {
      return this.holdings.reduce((total, { current_value, initial_value, daily_change, all_time_initial, realized, realized_initial }) => {
            total.current_value = total.current_value.plus(current_value)
            total.initial_value = total.initial_value.plus(initial_value)
            total.daily_change = total.daily_change.plus(daily_change)
            total.all_time_initial = total.all_time_initial.plus(all_time_initial || initial_value)

            if (realized) {
              total.realized = total.realized.plus(realized)
              total.realized_initial = total.realized_initial.plus(realized_initial)
            }

            return total
          },
          // This is the initial value, `total`, passed to reduce:
          {
            current_value: new BigNumber(0),
            initial_value: new BigNumber(0),
            daily_change: new BigNumber(0),
            all_time_initial: new BigNumber(0),
            realized: new BigNumber(0),
            realized_initial: new BigNumber(0)
          })
    }
  },

  methods: {
    BigNumber
  }
})
</script>