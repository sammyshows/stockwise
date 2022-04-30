<template>
  <NuxtLayout name="page-container" activeButton="overview">
    <div class="flex justify-between min-h-min">
      <PageTitle :pageDetails="pageDetails" class="truncate" />
      <NuxtLink :to="{ path: '/portfolios/new' }">
        <PlusIcon class="h-8 w-8" />
      </NuxtLink>
    </div>
    <NavigationTabs :tabConfig="tabConfig" @setActiveTab="setActiveTab" />
    <NuxtChild :portfolios="portfolios" />
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PlusIcon } from "@heroicons/vue/solid";

export default defineComponent({
  name: "Portfolio Overview",

  components: {
    PlusIcon
  },

  mounted() {
    this.getPortfolios()
    this.updateAssets()
  },

  data() {
    return {
      pageDetails: {
        title: 'Portfolio Overview'
      },
      tabConfig: {
        activeTab: this.$route.path === '/overview' ? 'PORTFOLIOS' : 'CHART',
        tabs: [
          { name: 'PORTFOLIOS', path: `/overview` },
          { name: 'CHART', path: `/overview/chart` }
        ]
      },
      portfolios: []
    }
  },

  methods: {
    async getPortfolios(): Promise<void> {
      const response = await fetch('/api/portfolios-read', {
        method: 'GET'
      })
        .then(response => response.json())
      this.portfolios = response.portfolios
    },

    // This is NOT a permanent solution, but at the time it was either update every asset price like this
    // or pay for a CRON job with heroku, and although this is repeated every 30 seconds, it will certainly
    // be a while before the app goes live and this overloads the system.
    async updateAssets(): Promise<void> {
      await fetch('/api/assets-update')
        .then(this.getPortfolios)
      setTimeout(this.updateAssets, 5000)
    },

    setActiveTab(newTab) {
      this.tabConfig.activeTab = newTab
    }
  }
})
</script>