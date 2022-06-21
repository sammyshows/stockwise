<template>
  <div class="flex flex-col grow overflow-hidden">
    <div v-if="[tabConfig.tabs[0].path, tabConfig.tabs[1].path, tabConfig.tabs[2].path].includes($route.path)" class="flex flex-col grow overflow-hidden">
      <div class="min-h-min flex justify-between px-3">
        <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
        <div class="flex mr-1 gap-x-3">
          <NuxtLink :to="{ name: `portfolios-portfolio-holdings-holding-transactions-new`, params: { portfolio: portfolioId, holding: holdingId, assetSymbol: pageDetails.title, assetName: pageDetails.subtitle } }">
            <PlusIcon class="h-8 w-8" />
          </NuxtLink>
          <NuxtLink :to="{ name: `portfolios-portfolio-holdings-holding-update`, params: { portfolio: $route.params.portfolio, holding: $route.params.holding, assetSymbol: pageDetails.title, assetName: pageDetails.subtitle } }">
            <PencilIcon class="h-7 w-7 mt-0.5" />
          </NuxtLink>
        </div>
      </div>
      <NavigationTabs :tabConfig="tabConfig" @setActiveTab="setActiveTab" />
      <div class="flex items-center h-20 mb-4 py-3 px-3 border-y border-gray-500 bg-gray-900/30" style="box-shadow: 0 -5px 25px -20px rgb(75 85 99);">
        <div v-if="assetData">
          <p class="mr-2 font-normal text-2xl tracking-wider truncate">${{ $formatNumber(assetData.current_price, 2) }}</p>
          <p class="mt-1 font-normal text-sm" :class="{ 'text-bright-red': BigNumber(assetData.current_price).minus(assetData.prev_close).toNumber() < 0, 'text-bright-green': BigNumber(assetData.current_price).minus(assetData.prev_close).toNumber() > 0 }">
            {{ $addSign($formatNumber(BigNumber(assetData.current_price).minus(assetData.prev_close).toNumber(), 3)) }} ({{ $addSign($formatNumber(BigNumber(assetData.current_price).minus(assetData.prev_close).div(assetData.prev_close).times(100).toNumber(), 2)) }}%)
          </p>
        </div>
        <Spinner class="h-20" v-else />
      </div>
      <NuxtPage :transactions="transactions" :assetData="assetData" :chartDataDay="chartDataDay" :chartDataMax="chartDataMax" :quote="quote" :stats="stats" />
    </div>
    <NuxtPage v-else class="flex flex-col grow"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PencilIcon } from "@heroicons/vue/outline";
import { PlusIcon } from "@heroicons/vue/solid";
import { BigNumber } from "bignumber.js"

interface StringObject {
  [index: string]: string;
}

export default defineComponent({
  name: "Portfolio Holdings",

  async setup() {
    const token = await useState('authToken').value
    return { token }
  },

  components: {
    PencilIcon, PlusIcon
  },

  async mounted() {
    this.updateAssets()
    await this.getTransactions()
    this.getChartData()
    this.fetchQuote()
    this.fetchStats()
  },

  watch: {
    $route (to, from){
      if (from.name === 'portfolios-portfolio-holdings-holding-update')
        this.tabConfig.activeTab = 'TRANSACTIONS'
    }
  },

  data() {
    return {
      portfolioId: this.$route.params.portfolio,
      holdingId: this.$route.params.holding,
      symbol: '',
      pageDetails: {
        symbol: this.$route.params.assetSymbol,
        title: this.$route.params.assetSymbol,
        subtitle: this.$route.params.assetName,
        returnPath: `/portfolios/${this.$route.params.portfolio}`
      },
      tabConfig: {
        activeTab: this.getActiveTab(),
        tabs: [
          { name: 'TRANSACTIONS', path: `/portfolios/${this.$route.params.portfolio}/holdings/${this.$route.params.holding}` },
          { name: 'SUMMARY', path: `/portfolios/${this.$route.params.portfolio}/holdings/${this.$route.params.holding}/summary` },
          { name: 'OVERVIEW', path: `/portfolios/${this.$route.params.portfolio}/holdings/${this.$route.params.holding}/overview` }
        ]
      },
      transactions: null as ([] | null),
      assetData: null as ({} | null),
      chartDataDay: null as ([] | null),
      chartDataMax: null as ([] | null),
      quote: {} as StringObject,
      stats: null as ({} | null)
    }
  },

  methods: {
    async getTransactions(): Promise<void> {
      const response = await fetch('/api/transactions-read', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          holdingId: this.holdingId
        })
      })
        .then(response => response.json())
      this.transactions = response.transactions
      this.assetData = response.assetData
      this.symbol = response.assetData.symbol
      this.pageDetails.symbol = response.assetData.symbol
      this.pageDetails.title = response.assetData.symbol
      this.pageDetails.subtitle = response.assetData.name
    },

    // This is NOT a permanent solution, but at the time it was either update every asset price like this
    // or pay for a CRON job with heroku, and although this is repeated every 30 seconds, it will certainly
    // be a while before the app goes live and this overloads the system.
    async updateAssets(): Promise<void> {
      await fetch('/api/assets-update', {
        headers: {
          authorization: 'Bearer ' + this.token
        }
      })
        .then(this.getTransactions)
      setTimeout(this.updateAssets, 10000)
    },

    async getChartData() {
      const chartData = await fetch('/api/iex-chart', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          symbol: this.symbol
        })
      })
          .then(response => response.json())

      this.chartDataMax = chartData.max
      this.chartDataDay = chartData.day
    },

    async fetchQuote(): Promise<void> {
      this.quote = await fetch('/api/stock-quote', {
        headers: {
          authorization: 'Bearer ' + this.token
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
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          symbol: this.symbol
        })
      })
        .then(response => response.json())
        .then(response => response.data)
    },

    getActiveTab(): string {
      if (this.$route.name === 'portfolios-portfolio-holdings-holding-summary')
        return 'SUMMARY'
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