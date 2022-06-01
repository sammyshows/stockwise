<template>
  <div v-if="viewHoldings" class="flex flex-col grow overflow-hidden">
    <div class="flex justify-between min-h-min px-3">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
      <div class="flex mr-1 gap-x-3">
        <NuxtLink :to="{ path: `/portfolios/${portfolioId}/holdings/new` }">
          <PlusIcon class="h-8 w-8" />
        </NuxtLink>
        <NuxtLink :to="{ path: `/portfolios/${portfolioId}/update` }">
          <PencilIcon class="h-7 w-7 mt-0.5" />
        </NuxtLink>
      </div>
    </div>
    <NavigationTabs :tabConfig="tabConfig" @setActiveTab="setActiveTab" />
    <p v-if="holdings != null && holdings.length === 0" class="grow flex items-center px-2 text-sm text-bright-cyan text-center">To start tracking an investment in this portfolio, use the "+" icon above to record a transaction</p>
    <NuxtChild v-else-if="holdings" :holdings="holdings" />
  </div>
  <NuxtChild v-if="!viewHoldings" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PencilIcon } from "@heroicons/vue/outline";
import { PlusIcon } from "@heroicons/vue/solid";

export default defineComponent({
  name: "Portfolio Holdings",

  components: {
    PencilIcon, PlusIcon
  },

  mounted() {
    this.getPortfolio()
    this.getHoldings()
    this.updateAssets()
  },

  watch: {
    $route (to, from) {
      if (from.name === 'portfolios-portfolio-update')
        this.tabConfig.activeTab = 'HOLDINGS'
    }
  },

  data() {
    return {
      portfolioId: this.$route.params.portfolio,
      pageDetails: {
        title: this.$route.params.portfolioName,
        subtitle: 'PORTFOLIOS',
        returnPath: '/portfolios'
      },
      tabConfig: {
        activeTab: this.$route.path == `/portfolios/${this.$route.params.portfolio}/chart` ? 'CHART' : 'HOLDINGS',
        tabs: [
          { name: 'HOLDINGS', path: `/portfolios/${this.$route.params.portfolio}` },
          { name: 'CHART', path: `/portfolios/${this.$route.params.portfolio}/chart` }
        ]
      },
      holdings: null as ([] | null)
    }
  },

  computed: {
    viewHoldings() {
      return [this.tabConfig.tabs[0].path, this.tabConfig.tabs[1].path].includes(this.$route.path)
    }
  },

  methods: {
    async getPortfolio(): Promise<void> {
      const response = await fetch('/api/portfolio-read', {
        method: 'POST',
        body: JSON.stringify({
          portfolioId: this.portfolioId
        })
      })
        .then(response => response.json())
      this.pageDetails.title = response.data[0].name
    },

    async getHoldings(): Promise<void> {
      const response = await fetch('/api/holdings-read', {
        method: 'POST',
        body: JSON.stringify({
          portfolioId: this.portfolioId
        })
      })
        .then(response => response.json())
      this.holdings = response.data
    },

    // This is NOT a permanent solution, but at the time it was either update every asset price like this
    // or pay for a CRON job with heroku, and although this is repeated every 30 seconds, it will certainly
    // be a while before the app goes live and this overloads the system.
    async updateAssets(): Promise<void> {
      await fetch('/api/assets-update')
        .then(this.getHoldings)
      setTimeout(this.updateAssets, 5000)
    },

    setActiveTab(newTab) {
      this.tabConfig.activeTab = newTab
    }
  }
})
</script>