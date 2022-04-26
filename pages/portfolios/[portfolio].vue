<template>
  <NuxtLayout name="page-container" activeButton="overview">
    <div v-if="[tabConfig.tabs[0].path, tabConfig.tabs[1].path].includes($route.path)" class="flex-1 flex flex-col">
      <div class="flex justify-between h-14">
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
      <NuxtPage :holdings="holdings" />
    </div>
    <NuxtPage v-else class="grow"/>
  </NuxtLayout>
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
        returnPath: '/overview'
      },
      tabConfig: {
        activeTab: this.$route.path !== `/portfolios/${this.$route.params.portfolio}/chart` ? 'HOLDINGS' : 'CHART',
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

    setActiveTab(newTab) {
      this.tabConfig.activeTab = newTab
    }
  }
})
</script>