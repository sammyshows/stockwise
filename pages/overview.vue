<template>
  <NuxtLayout name="page-container" activeButton="overview">
    <div class="flex justify-between mb-5">
      <PageTitle :pageDetails="pageDetails" class="truncate" />
      <NuxtLink :to="{ path: '/portfolios/new' }">
        <PlusIcon class="h-8 w-8 mr-3" />
      </NuxtLink>
    </div>
    <NavigationTabs :tabConfig="tabConfig" />
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