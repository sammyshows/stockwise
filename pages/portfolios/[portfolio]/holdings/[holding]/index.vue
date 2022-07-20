<template>
  <div v-if="show" class="overflow-hidden flex flex-col grow">
    <div class="flex justify-end mb-2 px-3 text-xs text-gray-400">
      <p class="grow">SHARES</p>
      <p class="w-20 text-right ml-2">VALUE/COST</p>
      <p class="w-16 text-right ml-2">DAILY</p>
      <p class="w-16 text-right ml-2">TOTAL</p>
    </div>

    <div v-if="transactions && transactions.length > 0" class="overflow-scroll grow px-3">
      <TransitionGroup tag="div" name="form">
        <div v-for="transaction in transactions" :key="transaction.transaction_id">
          <NuxtLink :to="{ name: 'portfolios-portfolio-holdings-holding-transactions-transaction', params: { portfolio: $route.params.portfolio, holding: $route.params.holding, transaction: transaction.transaction_id, assetSymbol: assetData?.symbol, assetName: assetData?.name, showLogo: assetData?.type === 0 ? true : false } }">
            <div class="mb-3">
              <div v-if="transaction.type === 0" class="flex">
                <div class="grow">
                  <h2 class="h-5 w-28 text-sm font-bold tracking-wider truncate">{{ $formatNumber(transaction.initial_quantity, 3) }}</h2>
                  <p class="font-light text-tiny my-0.5 text-gray-300">@ {{ $formatNumber(transaction.price, 3, true, false, transaction.currency_symbol) }} per share</p>
                </div>
                <div class="w-20 text-right mt-0.5 ml-2 font-normal">
                  <p class="h-5" :class="$fontSize($formatNumber(transaction.current_value, 2, true, false), 'text-xs', 12)">{{ $formatNumber(transaction.current_value, 2, true, false) }}</p>
                  <p class="text-gray-300" :class="$fontSize($formatNumber(transaction.initial_value, 2, true, false), 'text-tiny', 15)">{{ $formatNumber(transaction.initial_value, 2, true, false) }}</p>
                </div>
                <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': transaction.daily_change < 0, 'text-bright-green': transaction.daily_change > 0 }">
                  <p class="h-5" :class="$fontSize($formatNumber(transaction.daily_change, 2, false, true), 'text-xs')">{{ $formatNumber(transaction.daily_change, 2, false, true) }}</p>
                  <p :class="$fontSize(transaction.current_quantity > 0 ? $formatNumber(transaction.daily_percent, 2, false, true) + '%' : '0.00', 'text-tiny')">{{ transaction.current_quantity > 0 ? $formatNumber(transaction.daily_percent, 2, false, true) : '0.00' }}%</p>
                </div>
                <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': transaction.total_change < 0, 'text-bright-green': transaction.total_change > 0 }">
                  <p class="h-5" :class="$fontSize($formatNumber(transaction.total_change, 2, false, true), 'text-xs')">{{ $formatNumber(transaction.total_change, 2, false, true) }}</p>
                  <p :class="$fontSize(transaction.current_quantity > 0 ? $formatNumber(BigNumber(transaction.total_change).div(transaction.initial_value).times(100), 2, false, true) + '%' : '0.00', 'text-tiny')">{{ transaction.current_quantity > 0 ? $formatNumber(BigNumber(transaction.total_change).div(transaction.initial_value).times(100), 2, false, true) : '0.00' }}%</p>
                </div>
              </div>

              <div v-else class="grid grid-cols-12">
                <div class="col-span-4">
                  <h2 class="h-5 w-28 text-sm font-bold tracking-wider truncate">{{ $formatNumber(transaction.initial_quantity, 3) }}</h2>
                  <p class="font-light text-tiny my-0.5 text-gray-300">@ {{ $formatNumber(transaction.price, 3, true, false, transaction.currency_symbol) }} per share</p>
                </div>
                <div class="col-span-3 text-right mt-0.5 ml-2 font-normal">
                  <p class="h-5 text-bright-red" :class="$fontSize($formatNumber(transaction.initial_value, 2, false, true), 'text-xs', 9)">-{{ $formatNumber(BigNumber(transaction.initial_value), 2, true, false) }}</p>
                </div>
                <div class="col-span-5"></div>
              </div>

              <div v-if="transaction.realized">
                <p class="text-tiny text-gray-300">Remaining quantity: {{ $formatNumber(transaction.current_quantity, 2) }} shares</p>
                <p class="my-0.5 font-light text-tiny">Realized: <span :class="{ 'text-bright-red': BigNumber(transaction.realized).isLessThan(0), 'text-bright-green': BigNumber(transaction.realized).isGreaterThan(0) }">{{ $formatNumber(transaction.realized, 2, true, true) }} ({{ $formatNumber(BigNumber(transaction.realized).div(transaction.realized_initial).times(100), 2, false, true) }}%)</span></p>
                <p class="my-0.5 font-light text-tiny">All-time: <span :class="{ 'text-bright-red': parseFloat(transaction.realized) + parseFloat(transaction.total_change) < 0, 'text-bright-green': parseFloat(transaction.realized) + parseFloat(transaction.total_change) > 0 }">{{ $formatNumber(BigNumber(transaction.realized).plus(transaction.total_change), 2, true, true) }} ({{ $formatNumber(BigNumber(transaction.realized).plus(transaction.total_change).div(transaction.all_time_initial).times(100), 2, false, true) }}%)</span></p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </TransitionGroup>
      <p v-if="transactions.slice(-1)[0].type === 1" class="text-xs text-center text-gray-400"><ExclamationIcon class="inline h-4 text-bright-yellow" /> You have a sell transaction recorded before owning any shares. Please verify that your transaction dates are recorded correctly.</p>
    </div>

    <div v-if="transactions != null && transactions.length > 0" class="py-2 px-3 border-t border-gray-300 bg-gray-900/30" style="box-shadow: 0 -5px 25px -20px rgb(75 85 99);">
      <div class="flex justify-end">
        <div class="grow">
          <h2 class="text-sm font-bold tracking-wider truncate">Summary</h2>
          <p class="font-light text-tiny my-0.5 text-gray-300">{{ transactions.length }} TRANSACTIONS</p>
        </div>
        <div class="w-20 text-right mt-0.5 ml-2 font-normal">
          <p class="h-5" :class="$fontSize($formatNumber(total.current_value, 2, true, false), 'text-xs', 12)">{{ $formatNumber(total.current_value, 2, true, false) }}</p>
          <p class="text-gray-300" :class="$fontSize($formatNumber(total.initial_value, 2, true, false), 'text-tiny', 15)">{{ $formatNumber(total.initial_value, 2, true, false) }}</p>
        </div>
        <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': total.daily_change < 0, 'text-bright-green': total.daily_change > 0 }">
          <p class="h-5" :class="$fontSize($formatNumber(total.daily_change, 2, false, true), 'text-xs')">{{ $formatNumber(total.daily_change, 2, false, true) }}</p>
          <p :class="$fontSize($formatNumber(total.daily_change.div(BigNumber(total.current_value).minus(total.daily_change)).times(100), 2, false, true) + '%', 'text-tiny')">{{ $formatNumber(total.daily_change.div(BigNumber(total.current_value).minus(total.daily_change)).times(100), 2, false, true) }}%</p>
        </div>
        <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': total.current_value.minus(total.initial_value).isLessThan(0), 'text-bright-green': total.current_value.minus(total.initial_value).isGreaterThan(0) }">
          <p class="h-5" :class="$fontSize($formatNumber(total.current_value.minus(total.initial_value), 2, false, true), 'text-xs')">{{ $formatNumber(total.current_value.minus(total.initial_value), 2, false, true) }}</p>
          <p :class="$fontSize($formatNumber(total.current_value.minus(total.initial_value).div(total.initial_value).times(100), 2, false, true), 'text-tiny')">{{ $formatNumber(total.current_value.minus(total.initial_value).div(total.initial_value).times(100), 2, false, true) }}%</p>
        </div>
      </div>
      <p v-if="total.current_quantity.isGreaterThan(0)" class="font-light text-tiny my-0.5 text-gray-300">UNREALIZED: {{ $formatNumber(total.current_quantity, 2) }} SHARES @ {{ $formatNumber(total.initial_value_unexchanged.div(total.current_quantity), 3, true, false, transactions[0].currency_symbol) }} ({{ $formatNumber(total.initial_value.div(total.current_quantity), 3, true, false) }})</p>
      <div v-if="total.realized.toNumber()">
        <p class="text-tiny my-0.5 text-gray-300">Realized: <span class="font-normal" :class="{ 'text-bright-red': total.realized < 0, 'text-bright-green': total.realized > 0 }">{{ $formatNumber(total.realized, 2, true, true) }} ({{ $formatNumber(total.realized.div(total.realized_initial).times(100), 2, false, true) }}%)</span></p>
        <p class="text-tiny my-0.5 text-gray-300">All-time: <span class="font-normal" :class="{ 'text-bright-red': total.realized.plus(total.current_value).minus(total.initial_value) < 0, 'text-bright-green': total.realized.plus(total.current_value).minus(total.initial_value) > 0 }">{{ $formatNumber(total.realized.plus(total.current_value).minus(total.initial_value), 2, true, true) }} ({{ $formatNumber(total.realized.plus(total.current_value).minus(total.initial_value).div(total.all_time_initial).times(100), 2, false, true) }}%)</span></p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import BigNumber from 'bignumber.js';
import { defineComponent } from "vue";
import { ExclamationIcon } from "@heroicons/vue/outline";
import { computed } from "@vue/reactivity";
import { useTransactions } from "@/store/transactions";

export default defineComponent({
  name: "Transactions",

  async setup() {
    const route = useRoute()
    const transactions = computed(() => useTransactions().getTransactions(route.params.holding))
    return { transactions }
  },

  props: [
    'show', 'assetData', 'total'
  ],

  components: {
    ExclamationIcon
  },

  methods: {
    BigNumber
  }
})
</script>