<template>
  <NuxtLayout name="page-container" activeButton="overview">
    <div class="flex justify-between">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
    </div>
    <NavigationTabs :tabConfig="tabConfig" />
    <NuxtChild :portfolios="portfolios" />
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Portfolio Overview",

  mounted() {
    this.fetchPortfolios()
  },

  data() {
    return {
      pageDetails: {
        title: 'Portfolio Overview'
      },
      tabConfig: {
        activeTab: 'PORTFOLIOS',
        tabs: [
          { name: 'PORTFOLIOS', path: `/overview` },
          { name: 'CHART', path: `/overview/chart` }
        ]
      },
      portfolios: []
    }
  },

  methods: {
    async fetchPortfolios(): Promise<void> {
      const response = await fetch('/api/portfolios-read', {
        method: 'GET'
      })
          .then(response => response.json())
      this.portfolios = response.data
    }
  }
})
</script>