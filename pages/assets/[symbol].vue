<template>
  <NuxtLayout name="page-container" activeButton="search">
    <div class="px-3">
      <div class="flex justify-between min-h-min">
        <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
        <div>
          <h2 class="text-lg">${{ quote["latestPrice"] }}</h2> <!-- Will probably need to use regex to round to 2 or 3 decimals -->
          <p class="text-xs text-bright-green font-medium whitespace-nowrap">{{ quote["change"] }} ({{ (quote["changePercent"] * 100).toFixed(2) }}%)</p>
        </div>
      </div>
      <NavigationTabs :tabConfig="tabConfig" @setActiveTab="setActiveTab" />
      <NuxtPage :stats="stats" :quote="quote" />
    </div>
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

interface StringObject {
  [index: string]: string;
}

export default defineComponent({
  name: "Asset Detail",

  setup() {
    const token = useState('authToken').value
    return { token }
  },

  mounted() {
    this.fetchQuote()
    this.fetchStats()
  },

  data() {
    return {
      pageDetails: {
        title: this.$route.params.assetSymbol,
        subtitle: this.$route.params.assetName,
        returnPath: "/search",
      },
      symbol: this.$route.params.symbol,
      tabConfig: {
        activeTab: this.$route.name === 'assets-symbol-chart' ? 'CHART' : 'SUMMARY',
        tabs: [
          {name: 'SUMMARY', path: `/assets/${this.$route.params.symbol}/summary`},
          {name: 'CHART', path: `/assets/${this.$route.params.symbol}/chart`}
        ]
      },
      stats: {},
      quote: {} as StringObject
    }
  },

  methods: {
    async fetchQuote(): Promise<void> {
      const response = await fetch('/api/stock-quote', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          symbol: this.symbol
        })
      })
        .then(response => response.json())

      this.quote = response["data"]
      this.pageDetails.title = response.data.symbol + " : " + response.data.primaryExchange
      this.pageDetails.subtitle = response.data.companyName
    },

    async fetchStats(): Promise<void> {
      const response = await fetch('/api/stock-stats', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          symbol: this.symbol
        })
      })
        .then(response => response.json())

      this.stats = response["data"]
    },

    setActiveTab(newTab) {
      this.tabConfig.activeTab = newTab
    }
  }
})
</script>