<template>
  <div class="flex flex-col grow overflow-hidden">
    <div v-if="viewTransactions" class="flex flex-col grow overflow-hidden">
      <div class="min-h-min flex justify-between px-3">
        <PageTitle :pageDetails="pageDetails" />
        <div class="flex mr-1 gap-x-3">
          <NuxtLink :to="{ name: `portfolios-portfolio-holdings-holding-transactions-new`, params: { portfolio: portfolioId, holding: holdingId } }">
            <PlusIcon class="h-8 w-8" />
          </NuxtLink>
          <NuxtLink :assetSymbol="pageDetails.title" :to="{ name: `portfolios-portfolio-holdings-holding-update`, params: { portfolio: $route.params.portfolio, holding: $route.params.holding } }">
            <PencilIcon class="h-7 w-7 mt-0.5" />
          </NuxtLink>
        </div>
      </div>
      <NavigationTabs :tabConfig="tabConfig" @setActiveTab="setActiveTab" />
      <div class="flex items-center h-20 mb-4 py-3 px-3 border-y border-gray-200 bg-gray-900/30" style="box-shadow: 0 -5px 25px -20px rgb(75 85 99);">
        <div v-if="assetData">
          <p class="mr-2 font-normal text-2xl tracking-wider truncate">{{ $formatNumber(assetData.current_price, 2, true, false, assetData.currency_symbol) }}</p>
          <p class="mt-1 font-normal text-sm" :class="{ 'text-bright-red': BigNumber(assetData.current_price).minus(assetData.prev_close).toNumber() < 0, 'text-bright-green': BigNumber(assetData.current_price).minus(assetData.prev_close).toNumber() > 0 }">
            {{ $formatNumber(BigNumber(assetData.current_price).minus(assetData.prev_close).toNumber(), 3, false, true) }} ({{ $formatNumber(BigNumber(assetData.current_price).minus(assetData.prev_close).div(assetData.prev_close).times(100).toNumber(), 2, false, true) }}%)
          </p>
        </div>
        <Spinner class="h-20" v-else />
      </div>
      <NuxtPage v-if="transactions"
                :show="viewTransactions"
                :total="total"
                :assetData="assetData"
                :overviewChart="overviewChart"
                :assetChartDay="assetChartDay"
                :assetChartMax="assetChartMax"
                :quote="quote"
                :stats="stats" />
      <Spinner class="h-full" v-else />
    </div>
    <NuxtPage v-if="!viewTransactions" class="flex flex-col grow"
              :assetData="assetData"
              @updateTransactions="getTransactions(); $emit('updateHoldings');"
              @updatePortfolios="$emit('updatePortfolios')" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PencilIcon } from "@heroicons/vue/outline";
import { PlusIcon } from "@heroicons/vue/solid";
import { BigNumber } from "bignumber.js"
import { useAuth } from "@/store/auth";
import { computed } from "@vue/reactivity";
import { useTransactions } from "@/store/transactions";
import { useHoldings } from "@/store/holdings";


interface StringObject {
  [index: string]: string;
}

export default defineComponent({
  name: "Portfolio Holdings",

  async setup() {
    const route = useRoute()
    const authStore = useAuth()
    const holdingStore = useHoldings()
    const holding = computed(() => holdingStore.getHolding(route.params?.holding))
    const transactionStore = useTransactions()
    const transactions = computed(() => transactionStore.getTransactions(route.params.holding))
    return { authStore, holding, transactionStore, transactions }
  },

  components: {
    PencilIcon, PlusIcon
  },

  async mounted() {
    await this.$login()
    this.token = this.authStore.accessToken
    await this.getTransactions()
    this.getOverviewChart()
    if (this.assetData.type === 0) {
      this.getAssetChart()
      this.fetchQuote()
      this.fetchStats()
    }
    this.intervalLoop = setInterval(() => this.getTransactions(), 60000)
  },

  beforeUnmount() {
    clearInterval(this.intervalLoop)
  },

  watch: {
    $route (to, from) {
      if (from.name === 'portfolios-portfolio-holdings-holding-update')
        this.tabConfig.activeTab = 'TRANSACTIONS'
    }
  },

  data() {
    return {
      token: '',
      intervalLoop: null as (NodeJS.Timeout | null),
      portfolioId: this.$route.params.portfolio,
      holdingId: this.$route.params.holding,
      assetId: null as (string | null),
      symbol: '',
      pageDetails: {
        symbol: this.holding?.symbol,
        showLogo: this.holding?.asset_type === 0,
        title: this.holding?.symbol,
        subtitle: this.holding?.asset_name,
        returnPath: `/portfolios/${this.$route.params.portfolio}`
      },
      tabConfig: {
        activeTab: this.getActiveTab(),
        tabs: [
          { name: 'TRANSACTIONS', path: `/portfolios/${this.$route.params.portfolio}/holdings/${this.$route.params.holding}` },
          { name: 'INSIGHTS', path: `/portfolios/${this.$route.params.portfolio}/holdings/${this.$route.params.holding}/insights` },
          { name: 'OVERVIEW', path: `/portfolios/${this.$route.params.portfolio}/holdings/${this.$route.params.holding}/overview` }
        ]
      },
      transactions: null as ([] | null),
      overviewChart: null as ([] | null),
      assetData: null as ({} | null),
      assetChartDay: null as ([] | null),
      assetChartMax: null as ([] | null),
      quote: {} as StringObject,
      stats: null as ({} | null)
    }
  },

  computed: {
    total: function() {
      if (this.transactions) {
        return this.transactions.reduce((total, { type, current_quantity, price, current_value, initial_value, daily_change, all_time_initial, realized, realized_initial }) => {
              if (type === 0) {
                total.current_quantity = total.current_quantity.plus(current_quantity)
                total.initial_value_unexchanged = total.initial_value_unexchanged.plus(new BigNumber(current_quantity).times(price).toNumber())
                total.current_value = total.current_value.plus(current_value)
                total.initial_value = total.initial_value.plus(initial_value)
                total.daily_change = total.daily_change.plus(daily_change)
                total.all_time_initial = total.all_time_initial.plus(all_time_initial)
              }

              if (realized) {
                total.realized = total.realized.plus(realized)
                total.realized_initial = total.realized_initial.plus(realized_initial)
              }

              return total
            },
            // This is the initial value, `total`, passed to reduce:
            {
              current_quantity: new BigNumber(0),
              initial_value_unexchanged: new BigNumber(0),
              current_value: new BigNumber(0),
              initial_value: new BigNumber(0),
              daily_change: new BigNumber(0),
              all_time_initial: new BigNumber(0),
              realized: new BigNumber(0),
              realized_initial: new BigNumber(0)
            })
      }
    },

    viewTransactions() {
      return [this.tabConfig.tabs[0].path, this.tabConfig.tabs[1].path, this.tabConfig.tabs[2].path].includes(this.$route.path)
    }
  },

  methods: {
    async getTransactions(): Promise<void> {
      const response = await fetch('/api/transactions-read', {
        headers: {
          authorization: this.token
        },
        method: 'POST',
        body: JSON.stringify({
          holdingId: this.holdingId
        })
      })
        .then(response => response.json())

      this.transactionStore.replaceTransactions(this.holdingId, response.transactions)
      this.assetData = response.assetData
      this.assetId = response.assetData.id
      this.symbol = response.assetData.symbol
      this.pageDetails.symbol = response.assetData.symbol
      this.pageDetails.title = response.assetData.symbol
      this.pageDetails.subtitle = response.assetData.name
      if (response.assetData.type === 0) {
        this.pageDetails.showLogo = true
      }
    },

    async getOverviewChart() {
      let chartData = await fetch('/api/holding-data-read', {
        headers: {
          authorization: this.token
        },
        method: 'POST',
        body: JSON.stringify({
          holdingId: this.holdingId,
          date: this.currentDate()
        })
      })
        .then(response => response.json())
        .then(response => response.chartData)

      if (chartData.length === 0) {
        this.overviewChart = chartData
        return
      }

      const lastDate = chartData[chartData.length - 1].date.slice(0, 10)
      if (lastDate === this.currentDate()) {
        this.chartData.pop()
      }
      chartData.push({
        current_value: this.total.current_value.toNumber(),
        initial_value: this.total.initial_value.toNumber(),
        all_time_change: this.total.current_value.plus(this.total.realized).minus(this.total.initial_value).toNumber(),
        all_time_percent: this.total.current_value.plus(this.total.realized).minus(this.total.initial_value).div(this.total.all_time_initial).times(100).toNumber(),
        date: this.currentDate()
      })

      this.overviewChart = chartData
    },

    async getAssetChart() {
      const chartData = await fetch('/api/asset-data-read', {
        headers: {
          authorization: this.token
        },
        method: 'POST',
        body: JSON.stringify({
          assetId: this.assetId,
          symbol: this.symbol
        })
      })
        .then(response => response.json())

      this.assetChartMax = chartData.max
      this.assetChartDay = chartData.day
    },

    async fetchQuote(): Promise<void> {
      this.quote = await fetch('/api/stock-quote', {
        headers: {
          authorization: this.token
        },
        method: 'POST',
        body: JSON.stringify({
          symbol: this.symbol
        })
      })
        .then(response => response.json())
        .then(response => response.data)
    },

    async fetchStats(): Promise<void> {
      this.stats = await fetch('/api/stock-stats', {
        headers: {
          authorization: this.token
        },
        method: 'POST',
        body: JSON.stringify({
          symbol: this.symbol
        })
      })
        .then(response => response.json())
        .then(response => response.data)
    },

    currentDate() {
      // Get today's date in the local timezone
      let currentDate = new Date()
      const offset = currentDate.getTimezoneOffset()
      currentDate = new Date(currentDate.getTime() - (offset*60*1000))
      return currentDate.toISOString().split('T')[0]
    },

    getActiveTab(): string {
      if (this.$route.name === 'portfolios-portfolio-holdings-holding-insights')
        return 'INSIGHTS'
      else if (this.$route.name === 'portfolios-portfolio-holdings-holding-overview')
        return 'OVERVIEW'
      else
        return 'TRANSACTIONS'
    },

    setActiveTab(newTab) {
      this.tabConfig.activeTab = newTab
    },

    BigNumber
  }
})
</script>