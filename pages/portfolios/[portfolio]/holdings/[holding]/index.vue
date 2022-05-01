<template>
  <div class="overflow-hidden flex flex-col grow">
    <div class="flex justify-end mb-2 text-xs text-gray-400">
      <p class="grow">SHARES</p>
      <p class="w-20 text-right ml-2">VALUE/COST</p>
      <p class="w-16 text-right ml-2">DAILY</p>
      <p class="w-16 text-right ml-2">TOTAL</p>
    </div>

    <div class="overflow-scroll grow">
      <NuxtLink v-for="transaction in transactions" :to="{ name: 'portfolios-portfolio-holdings-holding-transactions-transaction', params: { portfolio: $route.params.portfolio, holding: $route.params.holding, transaction: transaction.id, assetName: transaction.name, assetSymbol: transaction.symbol + ' : ' + transaction.exchange, assetName: transaction.name } }">
        <div class="flex justify-end">
          <div class="grow">
            <h2 class="h-5 w-28 text-sm font-bold tracking-wider truncate">{{ $formatNumber(transaction.shares, 3) }}</h2>
            <p class="font-light text-tiny my-0.5 text-gray-300">@ {{ $formatNumber(transaction.price, 3) }}</p>
          </div>
          <div class="w-20 text-right mt-0.5 ml-2 font-normal">
            <p class="h-5 text-xs">A${{ $formatNumber(transaction.current_value, 2) }}</p>
            <p class="text-tiny text-gray-300">A${{ $formatNumber(transaction.initial_value, 2) }}</p>
          </div>
          <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': transaction.daily_change < 0, 'text-bright-green': transaction.daily_change > 0 }">
            <p class="h-5 text-xs">{{ $addSign($formatNumber(transaction.daily_change, 2)) }}</p>
            <p class="text-tiny">{{ $addSign($formatNumber(transaction.daily_percent, 2)) }}%</p>
          </div>
          <!--    Currently shows all-time for ALL transactions, same as the other two lines as well. Ultimately, this
          should show active transactions but this requires the addition of an 'active' column in the database table    -->
          <div class="w-16 text-right mt-0.5 ml-2 font-normal" :class="{ 'text-bright-red': transaction.total_change < 0, 'text-bright-green': transaction.total_change > 0 }">
            <p class="h-5 text-xs">{{ $addSign($formatNumber(transaction.total_change, 2)) }}</p>
            <p class="text-tiny">{{ $addSign($formatNumber(transaction.total_change / transaction.initial_value * 100, 2)) }}%</p>
          </div>
        </div>
        <!--   These two lines should show the all-time & realised values. This will again require the 'active'
        column (same as above) to determine which transactions are complete   -->
        <p class="font-light text-tiny h-4">All-time: <span class="font-normal" :class="{ 'text-bright-red': transaction.total_change < 0, 'text-bright-green': transaction.total_change > 0 }">{{ $addSign($formatNumber(transaction.total_change, 2)) }}({{ $addSign($formatNumber(transaction.total_change / transaction.initial_value * 100, 2)) }}%)</span></p>
        <p class="font-light text-tiny mb-5">Realised: <span class="font-normal text-bright-green">+322.91(43%)</span></p>
      </NuxtLink>
    </div>

    <div v-if="transactions != null && transactions.length > 0" class="py-2 border-t border-gray-300" style="box-shadow: 0 -5px 25px -20px rgb(75 85 99);">
      <div class="flex justify-end">
        <div class="grow">
          <h2 class="text-sm font-bold tracking-wider truncate">Summary</h2>
          <p class="font-light text-tiny my-0.5 text-gray-300">{{ transactions.length }} HOLDINGS</p>
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
      <p class="text-tiny my-0.5 text-gray-300">All-time: <span class="font-normal" :class="{ 'text-bright-red': total.current_value - total.initial_value < 0, 'text-bright-green': total.current_value - total.initial_value > 0 }">{{ $addSign($formatNumber(total.current_value - total.initial_value, 2)) }}({{ $addSign($formatNumber((total.current_value - total.initial_value) / total.initial_value * 100, 2)) }}%)</span></p>
      <p class="text-tiny my-0.5 text-gray-300">Realised: <span class="font-normal" :class="{ 'text-bright-red': total.current_value - total.initial_value < 0, 'text-bright-green': total.current_value - total.initial_value > 0 }">+182.82(+47.98%)</span></p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Transactions",

  props: [
    'transactions'
  ],

  computed: {
    total: function() {
      return this.transactions.reduce((total, { current_value, initial_value, daily_change }) => {
            total.current_value += parseFloat(current_value)
            total.initial_value += parseFloat(initial_value)
            total.daily_change += parseFloat(daily_change)
            return total
          },
          // This is the initial value, `total`, passed to reduce:
          {
            current_value: 0,
            initial_value: 0,
            daily_change: 0
          })
    }
  }
})
</script>