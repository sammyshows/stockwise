<template>
  <NuxtLayout name="page-container" activeButton="overview">
    <div v-if="[`/portfolios/${portfolioId}/holdings`, `/portfolios/${portfolioId}/chart`].includes($route.path)" class="flex-1 flex flex-col">
      <div class="flex justify-between mb-5">
        <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
        <NuxtLink :to="{ path: `/portfolios/${portfolioId}/update` }">
          <PencilIcon @click="openUpdate = true" class="h-6 w-6 mr-3 my-auto" />
        </NuxtLink>
      </div>
      <NavigationTabs :tabConfig="tabConfig" />
      <NuxtPage :holdings="holdings" />
    </div>
    <NuxtPage v-else class="flex-1"/>
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PencilIcon } from "@heroicons/vue/outline";

export default defineComponent({
  name: "Portfolio Holdings",

  components: {
    PencilIcon
  },

  mounted() {
    this.getHoldings()
    this.getPortfolio()
  },

  data() {
    return {
      openUpdate: false,
      portfolioId: this.$route.params.portfolio,
      pageDetails: {
        title: this.$route.params.portfolioName,
        returnPath: '/overview'
      },
      tabConfig: {
        activeTab: this.$route.path.split('/')[3],
        tabs: [
          { name: 'HOLDINGS', path: `/portfolios/${this.$route.params.portfolio}/holdings` },
          { name: 'CHART', path: `/portfolios/${this.$route.params.portfolio}/chart` }
        ]
      },
      holdings: null as ([] | null)
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
      const response = await fetch('/api/holdings', {
        method: 'POST',
        body: JSON.stringify({
          portfolioId: this.portfolioId
        })
      })
        .then(response => response.json())
      this.holdings = response.data
      console.log(this.holdings)
      if (response.data.length > 0)
        this.pageDetails.title = response.data[0].portfolio
    },

    closeUpdate() {
      this.openUpdate = false
    }
  }
})
</script>