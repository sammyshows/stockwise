<template>
  <NuxtLayout name="page-container">
    <div class="flex justify-between">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
    </div>
    <NavigationTabs :tabConfig="tabConfig" />
    <NuxtPage :portfolios="portfolios" />
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
          { name: 'PORTFOLIOS', path: `/portfolios` },
          { name: 'CHART', path: `/portfolios/chart` }
        ]
      },
      portfolios: []
    }
  },

  methods: {
    async fetchPortfolios() {
      const response = await fetch('/api/portfolios', {
        method: 'GET'
      })
      console.log(response)
    }
  }
})
</script>