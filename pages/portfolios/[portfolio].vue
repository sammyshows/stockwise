<template>
  <NuxtLayout name="page-container" activeButton="overview">
    <div class="flex justify-between mb-5">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
    </div>
    <NavigationTabs :tabConfig="tabConfig" />
    <NuxtPage :holdings="holdings" />
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Portfolio Holdings",

  mounted() {
    this.fetchHoldings()
  },

  data() {
    return {
      portfolioId: this.$route.params.portfolio,
      pageDetails: {
        title: this.$route.params.portfolioName,
        returnPath: '/overview'
      },
      tabConfig: {
        activeTab: 'HOLDINGS',
        tabs: [
          { name: 'HOLDINGS', path: `/portfolios/${this.$route.params.portfolio}` },
          { name: 'CHART', path: `/portfolios/${this.$route.params.portfolio}/chart` }
        ]
      },
      holdings: []
    }
  },

  methods: {
    async fetchHoldings(): Promise<void> {
      const response = await fetch('/api/holdings', {
        method: 'POST',
        body: JSON.stringify({
          portfolioId: this.portfolioId
        })
      })
          .then(response => response.json())
      this.holdings = response.data
      this.pageDetails.title = response.data[0].portfolio
    }
  }
})
</script>