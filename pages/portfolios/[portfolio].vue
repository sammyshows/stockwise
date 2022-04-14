<template>
  <NuxtLayout name="page-container" activeButton="overview">
    <div class="flex justify-between mb-5">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
      <TrashIcon @click="this.openModal = true" class="h-6 w-6 mr-3 mx-auto" />
    </div>
    <NavigationTabs :tabConfig="tabConfig" />
    <NuxtPage :holdings="holdings" />
    <DeleteConfirmation v-if="mounted"
                        :open="openModal"
                        title="Delete Portfolio"
                        message="Are you sure you want to delete this portfolio? This portfolio and all holdings within it will be deleted from our servers. This action cannot be undone."
                        @open="closeModal"
                        @delete="deletePortfolio" />
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { TrashIcon } from "@heroicons/vue/solid";

export default defineComponent({
  name: "Portfolio Holdings",

  components: {
    TrashIcon
  },

  mounted() {
    this.fetchHoldings()
    this.mounted = true;
  },

  data() {
    return {
      mounted: false,
      openModal: false,
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
    },

    closeModal(): void {
      this.openModal = false
    },

    async deletePortfolio(): Promise<void> {
      await fetch('/api/portfolio-delete', {
        method: 'POST',
        body: JSON.stringify({
          portfolioId: this.portfolioId
        })
      })
        .then(this.$router.push('/overview'))
    }
  }
})
</script>