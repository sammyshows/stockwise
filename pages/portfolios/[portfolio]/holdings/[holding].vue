<template>
  <div class="flex flex-col grow overflow-hidden">
    <div v-if="[tabConfig.tabs[0].path, tabConfig.tabs[1].path].includes($route.path)" class="flex flex-col grow overflow-hidden">
      <div class="min-h-min flex justify-between px-3">
        <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
        <div class="flex mr-1 gap-x-3">
          <NuxtLink :to="{ name: `portfolios-portfolio-holdings-holding-transactions-new`, params: { portfolio: portfolioId, holding: holdingId, assetSymbol: pageDetails.title, assetName: pageDetails.subtitle } }">
            <PlusIcon class="h-8 w-8" />
          </NuxtLink>
          <NuxtLink :to="{ name: `portfolios-portfolio-holdings-holding-update`, params: { portfolio: $route.params.portfolio, holding: $route.params.holding, assetSymbol: pageDetails.title, assetName: pageDetails.subtitle } }">
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
    this.updateAssets()
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
        activeTab: this.$route.name === `portfolios-portfolio-holdings-holding-chart` ? 'CHART' : 'TRANSACTIONS',
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

    // This is NOT a permanent solution, but at the time it was either update every asset price like this
    // or pay for a CRON job with heroku, and although this is repeated every 30 seconds, it will certainly
    // be a while before the app goes live and this overloads the system.
    async updateAssets(): Promise<void> {
      await fetch('/api/assets-update')
        .then(this.getTransactions)
      setTimeout(this.updateAssets, 5000)
    },

    setActiveTab(newTab) {
      this.tabConfig.activeTab = newTab
    }
  }
})
</script>