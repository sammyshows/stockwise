<template>
  <div v-if="[tabConfig.tabs[0].path, tabConfig.tabs[1].path].includes($route.path)" class="flex flex-col grow overflow-hidden">
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
    <NuxtChild :holdings="holdings" />
  </div>
  <NuxtChild v-else/>
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

  methods: {
    async getHoldings(): Promise<void> {
      const response = await fetch('/api/holdings-read', {
        method: 'POST',
        body: JSON.stringify({
          portfolioId: this.portfolioId
        })
      })
        .then(response => response.json())
      this.holdings = response.data
      if (response.data.length > 0)
        this.pageDetails.title = response.data[0].portfolio
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