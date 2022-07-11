<template>
  <div v-if="show" class="overflow-hidden flex flex-col grow">
    <div class="flex justify-end px-3 mb-2 text-xs text-gray-400">
      <p class="grow">NAME</p>
      <p class="w-20 text-right ml-2">VALUE/COST</p>
      <p class="w-16 text-right ml-2">DAILY</p>
      <p class="w-16 text-right ml-2">TOTAL</p>
    </div>
    <div v-if="portfolios" class="overflow-scroll grow px-3">
      <TransitionGroup tag="div" name="form">
        <div v-for="portfolio in portfolios" :key="portfolio.portfolio_id">
          <NuxtLink :to="{ name: 'portfolios-portfolio', params: { portfolio: portfolio.portfolio_id, portfolioName: portfolio.portfolio_name } }">
            <div class="mb-3">
              <div class="flex justify-end">
                <div class="grow">
                  <h2 class="h-5 w-28 text-sm font-bold tracking-wider truncate">{{ portfolio.portfolio_name }}</h2>
                  <p class="font-light text-tiny my-0.5 text-gray-300">{{ portfolio.holding_count }} HOLDINGS</p>
                </div>
                <div class="w-20 text-right mt-0.5 ml-2 font-normal">
                  <p class="h-5 text-xs">{{ $formatNumber(portfolio.current_value, 2, true, false) || $formatNumber('0', 0, true, false) }}</p>
                  <p class="text-tiny text-gray-300">{{ $formatNumber(portfolio.initial_value, 2, true, false) || $formatNumber('0', 0, true, false) }}</p>
                </div>
                <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': portfolio.daily_change < 0, 'text-bright-green': portfolio.daily_change > 0 }">
                  <p class="h-5 text-xs">{{ $formatNumber(portfolio.daily_change, 2, false, true) || '-' }}</p>
                  <p class="text-tiny">{{ $formatNumber(BigNumber(portfolio.daily_change).div(BigNumber(portfolio.current_value).minus(portfolio.daily_change)).times(100), 2, false, true) || '-' }}<span v-if="$formatNumber(BigNumber(portfolio.current_value).minus(portfolio.initial_value).div(portfolio.initial_value).times(100), 2)">%</span></p>
                </div>
                <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': BigNumber(portfolio.current_value).minus(portfolio.initial_value) < 0, 'text-bright-green': BigNumber(portfolio.current_value).minus(portfolio.initial_value) > 0 }">
                  <p class="h-5 text-xs">{{$formatNumber(BigNumber(portfolio.current_value).minus(portfolio.initial_value), 2, false, true) || '-' }}</p>
                  <p class="text-tiny">{{ $formatNumber(BigNumber(portfolio.current_value).minus(portfolio.initial_value).div(portfolio.initial_value).times(100), 2, false, true) || '-' }}<span v-if="$formatNumber(BigNumber(portfolio.current_value).minus(portfolio.initial_value).div(portfolio.initial_value).times(100), 2)">%</span></p>
                </div>
              </div>
              <div v-if="portfolio.realized">
                <p class="text-tiny h-4">Realized: <span class="font-normal" :class="{ 'text-bright-red': portfolio.realized < 0, 'text-bright-green': portfolio.realized > 0 }">{{ $formatNumber(portfolio.realized, 2, false, true) }} ({{ $formatNumber(BigNumber(portfolio.realized).div(portfolio.realized_initial).times(100), 2, false, true) }}%)</span></p>
                <p class="text-tiny">All-time: <span class="font-normal" :class="{ 'text-bright-red': BigNumber(portfolio.realized).plus(portfolio.current_value).minus(portfolio.initial_value).isLessThan(0), 'text-bright-green': BigNumber(portfolio.realized).plus(portfolio.current_value).minus(portfolio.initial_value).isGreaterThan(0) }">{{ $formatNumber(BigNumber(portfolio.realized).plus(portfolio.current_value).minus(portfolio.initial_value), 2, false, true) }} ({{ $formatNumber(BigNumber(portfolio.realized).plus(portfolio.current_value).minus(portfolio.initial_value).div(portfolio.all_time_initial).times(100), 2, false, true) }}%)</span></p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </TransitionGroup>
    </div>
    <div v-if="total" class="py-2 px-3 border-t border-gray-300 bg-gray-900/30" style="box-shadow: 0 -5px 25px -20px rgb(75 85 99);">
      <div class="flex justify-end">
        <div class="grow">
          <h2 class="text-sm font-bold tracking-wider truncate">Summary</h2>
          <p class="font-light text-tiny my-0.5 text-gray-300">{{ portfolios.length }} PORTFOLIOS</p>
        </div>
          <div class="w-20 text-right mt-0.5 ml-2 font-normal">
          <p class="h-5 text-xs">{{ $formatNumber(total.current_value, 2, true, false) || $formatNumber('0', 0, true, false) }}</p>
          <p class="text-tiny text-gray-300">{{ $formatNumber(total.initial_value, 2, true, false) || $formatNumber('0', 0, true, false) }}</p>
        </div>
        <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': total.daily_change < 0, 'text-bright-green': total.daily_change > 0 }">
          <p class="h-5 text-xs">{{ $formatNumber(total.daily_change, 2, false, true) || '-' }}</p>
          <p class="text-tiny">{{ $formatNumber(total.daily_change.div(BigNumber(total.current_value).minus(total.daily_change)).times(100), 2, false, true) || '-' }}<span v-if="$formatNumber(total.daily_change.div(BigNumber(total.current_value).minus(total.daily_change)).times(100), 2, false, true)">%</span></p>
        </div>
        <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': total.current_value - total.initial_value < 0, 'text-bright-green': total.current_value - total.initial_value > 0 }">
          <p class="h-5 text-xs">{{ $formatNumber(total.current_value.minus(total.initial_value), 2, false, true) || '-' }}</p>
          <p class="text-tiny">{{ $formatNumber(total.current_value.minus(total.initial_value).div(total.initial_value).times(100), 2, false, true) || '-' }}<span v-if="$formatNumber(total.current_value.minus(total.initial_value).div(total.initial_value).times(100), 2, false, true)">%</span></p>
        </div>
      </div>
      <div v-if="total.realized.toNumber()">
        <p class="text-tiny my-0.5 text-gray-300">Realized: <span class="font-normal" :class="{ 'text-bright-red': total.realized < 0, 'text-bright-green': total.realized > 0 }">{{ $formatNumber(total.realized, 2, false, true) }} ({{ $formatNumber(total.realized.div(total.realized_initial).times(100), 2, false, true) }}%)</span></p>
        <p class="text-tiny my-0.5 text-gray-300">All-time: <span class="font-normal" :class="{ 'text-bright-red': total.realized.plus(total.current_value).minus(total.initial_value).isLessThan(0), 'text-bright-green': total.realized.plus(total.current_value).minus(total.initial_value).isGreaterThan(0) }">{{ $formatNumber(total.realized.plus(total.current_value).minus(total.initial_value), 2, false, true) }} ({{ $formatNumber(total.realized.plus(total.current_value).minus(total.initial_value).div(total.all_time_initial).times(100), 2, false, true) }}%)</span></p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BigNumber from "bignumber.js";
import { usePortfolios } from "@/store/portfolios";
import {storeToRefs} from "pinia";

export default defineComponent({
  name: "Portfolios",

  async setup() {
    const portfoliosStore = usePortfolios()
    const { portfolios } = storeToRefs(portfoliosStore)
    return { portfolios }
  },

  props: ['show', 'total'],

  methods: {
    BigNumber
  }
})
</script>
