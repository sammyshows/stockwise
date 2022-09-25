<template>
  <div v-if="show" class="flex flex-col grow overflow-hidden">
    <div class="flex justify-end mb-2 px-3 text-xs text-gray-400">
      <p class="grow">NAME</p>
      <p class="w-20 text-right ml-2">VALUE/COST</p>
      <p class="w-16 text-right ml-2">DAILY</p>
      <p class="w-16 text-right ml-2">TOTAL</p>
    </div>
    <div v-if="holdings" class="grow overflow-scroll px-3">
      <TransitionGroup tag="div" name="form">
        <div v-for="holding in filteredHoldings" :key="holding.holding_id">
          <NuxtLink :to="{ name: 'portfolios-portfolio-holdings-holding', params: { portfolio: $route.params.portfolio, holding: holding.holding_id } }">
            <div class="mb-3">
              <div class="flex justify-end">
                <div class="grow">
                  <h2 class="h-5 w-28 text-sm font-bold tracking-wider truncate">{{ holding.symbol.toUpperCase() }}</h2>
                  <p class="text-tiny my-0.5 text-gray-200">Price: {{ $formatNumber(holding.current_price, 2, true, false, holding.currency_symbol) }}</p>
                </div>
                <div class="w-20 text-right mt-0.5 ml-2 font-normal">
                  <p class="h-5" :class="$fontSize($formatNumber(holding.current_value, 2, true, false), 'text-xs', 12)">{{ $formatNumber(holding.current_value, 2, true, false) }}</p>
                  <p class="text-tiny text-gray-200" :class="$fontSize($formatNumber(holding.current_value, 2, true, false), 'text-tiny', 15)">{{ $formatNumber(holding.initial_value, 2, true, false) }}</p>
                </div>
                <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': holding.daily_change < 0, 'text-bright-green': holding.daily_change > 0 }">
                  <p class="h-5" :class="$fontSize($formatNumber(holding.daily_change, 2, false, true), 'text-xs')">{{ $formatNumber(holding.daily_change, 2, false, true) }}</p>
                  <p :class="$fontSize($formatNumber(BigNumber(holding.daily_change).div(BigNumber(holding.current_value).minus(holding.daily_change)).times(100), 2, false, true) + '%', 'text-tiny')">{{ $formatNumber(BigNumber(holding.daily_change).div(BigNumber(holding.current_value).minus(holding.daily_change)).times(100), 2, false, true) || '0.00' }}%</p>
                </div>
                <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': BigNumber(holding.current_value).minus(holding.initial_value).isLessThan(-0.0000000001), 'text-bright-green': BigNumber(holding.current_value).minus(holding.initial_value).isGreaterThan(0.0000000001) }">
                  <p class="h-5" :class="$fontSize($formatNumber(BigNumber(holding.current_value).minus(holding.initial_value), 2, false, true), 'text-xs')">{{ $formatNumber(BigNumber(holding.current_value).minus(holding.initial_value), 2, false, true) }}</p>
                  <p :class="$fontSize($formatNumber(BigNumber(holding.current_value).minus(holding.initial_value).div(holding.initial_value).times(100), 2, false, true) + '%', 'text-tiny')">{{ $formatNumber(BigNumber(holding.current_value).minus(holding.initial_value).div(holding.initial_value).times(100), 2, false, true) || '0.00' }}%</p>
                </div>
              </div>

              <p v-if="holding.current_quantity > 0" class="text-tiny text-gray-200">Cost: {{ $formatNumber(holding.avg_initial_price, 2, true, false, holding.currency_symbol) }} ({{ $formatNumber(holding.initial_value / holding.current_quantity, 2, true, false) }}) x {{ $formatNumber(holding.current_quantity, 2) }} shares</p>

              <div v-if="holding.realized">
                <p class="my-0.5 text-tiny text-gray-200">Realized: <span class="font-normal" :class="{ 'text-bright-red': holding.realized < 0, 'text-bright-green': holding.realized > 0 }">{{ $formatNumber(holding.realized, 2, true, true) }} ({{ $formatNumber(BigNumber(holding.realized).div(holding.realized_initial).times(100), 2, false, true) }}%)</span></p>
                <p class="my-0.5 text-tiny h-4 text-gray-200">All-time: <span class="font-normal" :class="{ 'text-bright-red': BigNumber(holding.realized).plus(holding.current_value).minus(holding.initial_value).isLessThan(0), 'text-bright-green': BigNumber(holding.realized).plus(holding.current_value).minus(holding.initial_value).isGreaterThan(0) }">{{ $formatNumber(BigNumber(holding.realized).plus(holding.current_value).minus(holding.initial_value), 2, true, true) }} ({{ $formatNumber(BigNumber(holding.realized).plus(holding.current_value).minus(holding.initial_value).div(holding.all_time_initial).times(100), 2, false, true) }}%)</span></p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </TransitionGroup>
    </div>

    <div v-if="holdings != null && holdings.length > 0" class="py-2 px-3 border-t border-gray-100 bg-gray-900/30" style="box-shadow: 0 -5px 25px -20px rgb(75 85 99);">
      <div class="flex justify-end">
        <div class="grow">
          <h2 class="text-sm font-bold tracking-wider truncate">Summary</h2>
          <p class="font-light text-tiny my-0.5 text-gray-200">{{ holdings.filter((holding) => holding.current_quantity > 0).length }} HOLDINGS</p>
        </div>
        <div class="w-20 text-right mt-0.5 ml-2 font-normal">
          <p class="h-5" :class="$fontSize($formatNumber(total.current_value, 2, true, false), 'text-xs', 12)">{{ $formatNumber(total.current_value, 2, true, false) }}</p>
          <p class="text-gray-200" :class="$fontSize($formatNumber(total.initial_value, 2, true, false), 'text-tiny', 15)">{{ $formatNumber(total.initial_value, 2, true, false) }}</p>
        </div>
        <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': total.daily_change < 0, 'text-bright-green': total.daily_change > 0 }">
          <p class="h-5" :class="$fontSize($formatNumber(total.daily_change, 2, false, true), 'text-xs')">{{ $formatNumber(total.daily_change, 2, false, true) }}</p>
          <p :class="$fontSize($formatNumber(total.daily_change.div(BigNumber(total.current_value).minus(total.daily_change)).times(100), 2, false, true), 'text-tiny')">{{ $formatNumber(total.daily_change.div(BigNumber(total.current_value).minus(total.daily_change)).times(100), 2, false, true) || '0.00' }}%</p>
        </div>
        <!--         The 'isGreaterThan(0.00000000001)' is because of a bug where cash holdings come up as a very small negative number       -->
        <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': BigNumber(total.current_value).minus(total.initial_value).isLessThan(-0.0000000001), 'text-bright-green': BigNumber(total.current_value).minus(total.initial_value).isGreaterThan(0.0000000001) }">
          <p class="h-5" :class="$fontSize($formatNumber(total.current_value.minus(total.initial_value), 2, false, true), 'text-xs')">{{ $formatNumber(total.current_value.minus(total.initial_value), 2, false, true) }}</p>
          <p :class="$fontSize($formatNumber(total.current_value.minus(total.initial_value).div(total.initial_value).times(100), 2, false, true), 'text-tiny')">{{ $formatNumber(total.current_value.minus(total.initial_value).div(total.initial_value).times(100), 2, false, true) || '0.00' }}%</p>
        </div>
      </div>
      <div v-if="total.realized.toNumber()">
        <p class="text-tiny my-0.5 text-gray-200">Realized: <span class="font-normal" :class="{ 'text-bright-red': total.realized < 0, 'text-bright-green': total.realized > 0 }">{{ $formatNumber(total.realized, 2, true, true) }} ({{ $formatNumber(total.realized.div(total.realized_initial).times(100), 2, false, true) }}%)</span></p>
        <p class="text-tiny my-0.5 text-gray-200">All-time: <span class="font-normal" :class="{ 'text-bright-red': total.realized.plus(total.current_value).minus(total.initial_value).isLessThan(0), 'text-bright-green': total.realized.plus(total.current_value).minus(total.initial_value).isGreaterThan(0) }">{{ $formatNumber(total.realized.plus(total.current_value).minus(total.initial_value), 2, true, true) }} ({{ $formatNumber(total.realized.plus(total.current_value).minus(total.initial_value).div(total.all_time_initial).times(100), 2, false, true) }}%)</span></p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BigNumber from "bignumber.js";
import { computed } from "@vue/reactivity";
import { useHoldings } from "@/store/holdings";

export default defineComponent({
  name: "Holdings",

  async setup() {
    const route = useRoute()
    const holdings = computed(() => useHoldings().getHoldings(route.params.portfolio))
    return { holdings }
  },

  props: [
    'show', 'total', 'portfolio'
  ],

  computed: {
    filteredHoldings() {
      return this.holdings.filter((holding) => holding.current_quantity > 0 || !this.portfolio.hide_closed_positions)
    }
  },

  methods: {
    BigNumber
  }
})
</script>