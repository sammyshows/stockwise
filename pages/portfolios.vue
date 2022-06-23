<template>
  <NuxtLayout name="page-container" activeButton="overview">
    <div v-if="viewPortfolios" class="flex flex-col grow overflow-hidden">
      <div class="flex justify-between min-h-min px-3">
        <PageTitle :pageDetails="pageDetails" class="truncate" />
        <NuxtLink :to="{ path: '/portfolios/new' }">
          <PlusIcon class="h-8 w-8" />
        </NuxtLink>
      </div>
      <NavigationTabs :tabConfig="tabConfig" @setActiveTab="setActiveTab" />
      <p v-if="portfolios != null && portfolios.length === 0" class="grow flex items-center px-2 text-sm text-bright-cyan text-center">To start tracking an investment in this portfolio, use the "+" icon above to record a transaction</p>
      <NuxtChild v-else-if="portfolios" :portfolios="portfolios" />
    </div>
    <NuxtChild v-else/>
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PlusIcon } from "@heroicons/vue/solid";

export default defineComponent({
  name: "Portfolio Overview",

  async setup() {
    const token = await useState('authToken').value
    const uuid = useState('uuid').value
    return { token, uuid }
  },

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
        title: 'Portfolios Overview'
      },
      tabConfig: {
        activeTab: this.$route.name === 'portfolios-chart' ? 'CHART' : 'PORTFOLIOS',
        tabs: [
          { name: 'PORTFOLIOS', path: `/portfolios` },
          { name: 'CHART', path: `/portfolios/chart` }
        ]
      },
      portfolios: []
    }
  },

  computed: {
    viewPortfolios() {
      return [this.tabConfig.tabs[0].path, this.tabConfig.tabs[1].path].includes(this.$route.path)
    }
  },

  methods: {
    async getPortfolios(): Promise<void> {
      const response = await fetch('/api/portfolios-read', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          uuid: this.uuid
        })
      })
        .then(response => response.json())
      this.portfolios = response.portfolios
    },

    // This is NOT a permanent solution, but at the time it was either update every asset price like this
    // or pay for a CRON job with heroku, and although this is repeated every 10 seconds, it will certainly
    // be a while before the app goes live and this overloads the system.
    async updateAssets(): Promise<void> {
      // await fetch('/api/assets-update', {
      //   headers: {
      //     authorization: 'Bearer ' + this.token
      //   }
      // })
      //   .then(this.getPortfolios())
      this.getPortfolios()
      setTimeout(this.updateAssets, 10000)
    },

    setActiveTab(newTab) {
      this.tabConfig.activeTab = newTab
    }
  }
})
</script>