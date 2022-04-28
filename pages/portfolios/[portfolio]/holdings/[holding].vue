<template>
  <div class="flex flex-col grow">
    <div v-if="[tabConfig.tabs[0].path, tabConfig.tabs[1].path].includes($route.path)" class="flex-1 flex flex-col">
      <div class="h-14 flex justify-between">
        <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
        <div class="flex mr-1 gap-x-3">
          <NuxtLink :to="{ name: `portfolios-portfolio-holdings-holding-transactions-new`, params: { portfolio: portfolioId, holding: holdingId, assetSymbol: pageDetails.title, assetName: pageDetails.subtitle } }">
            <PlusIcon class="h-8 w-8" />
          </NuxtLink>
          <NuxtLink :to="{ name: `portfolios-portfolio-holdings-holding-update`, params: { portfolio: $route.params.portfolio, holding: $route.params.holding, holdingName: pageDetails.title } }">
            <PencilIcon class="h-7 w-7 mt-0.5" />
          </NuxtLink>
        </div>
      </div>
      <NavigationTabs :tabConfig="tabConfig" @setActiveTab="setActiveTab" />
      <NuxtPage :transactions="transactions" />
    </div>
    <NuxtPage v-else class="flex flex-col grow"/>
  </div>
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
    this.getTransactions()
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
      pageDetails: {
        title: this.$route.params.assetSymbol,
        subtitle: this.$route.params.assetName,
        returnPath: `/portfolios/${this.$route.params.portfolio}`
      },
      tabConfig: {
        activeTab: this.$route.name !== `portfolios-portfolio-holdings-holding-chart` ? 'TRANSACTIONS' : 'CHART',
        tabs: [
          { name: 'TRANSACTIONS', path: `/portfolios/${this.$route.params.portfolio}/holdings/${this.$route.params.holding}` },
          { name: 'CHART', path: `/portfolios/${this.$route.params.portfolio}/holdings/${this.$route.params.holding}/chart` }
        ]
      },
      transactions: null as ([] | null)
    }
  },

  methods: {
    async getTransactions(): Promise<void> {
      const response = await fetch('/api/transactions-read', {
        method: 'POST',
        body: JSON.stringify({
          holdingId: this.holdingId
        })
      })
        .then(response => response.json())
      this.transactions = response.data
      this.pageDetails.title = response.data[0].symbol + " : " + response.data[0].exchange
      this.pageDetails.subtitle = response.data[0].name
    },

    setActiveTab(newTab) {
      this.tabConfig.activeTab = newTab
    }
  }
})
</script>