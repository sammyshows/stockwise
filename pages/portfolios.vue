<template>
  <NuxtLayout name="page-container" activeButton="overview">
    <div v-if="['/portfolios', '/portfolios/chart'].includes($route.path)" class="flex flex-col grow overflow-hidden">
      <div class="flex justify-between min-h-min px-3">
        <PageTitle :pageDetails="pageDetails" class="truncate" />
        <NuxtLink :to="{ path: '/portfolios/new' }">
          <PlusIcon class="h-8 w-8" />
        </NuxtLink>
      </div>
      <NavigationTabs :tabConfig="tabConfig" @setActiveTab="setActiveTab" />
      <NuxtChild :portfolios="portfolios" />
    </div>
    <NuxtChild v-else/>
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PlusIcon } from "@heroicons/vue/solid";
import createAuth0Client from '@auth0/auth0-spa-js';



export default defineComponent({
  name: "Portfolio Overview",

  components: {
    PlusIcon
  },

  async mounted() {
    this.getPortfolios()
    this.updateAssets()

    const auth = await createAuth0Client({
      domain: "stockwise.us.auth0.com",
      client_id: "fkOrDjhrepusnXmq9eWbGFxGl5W4Rm8u",
      redirect_uri: "http://localhost:8888/portfolios",
      audience: "https://stockwise.app/api"
    });

    const token = await auth.getTokenSilently()
    setTimeout(() => console.log(token), 3000)
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

  methods: {
    async getPortfolios(): Promise<void> {
      const response = await fetch('/api/portfolios-read', {
        headers: {
          authorization: 'Bearer ' + "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkRKZkJSRUNqNG9TUEZsYXlpWGFldSJ9.eyJpc3MiOiJodHRwczovL3N0b2Nrd2lzZS51cy5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDcyMTU3MjQ5Nzg5MDM1ODcyMDYiLCJhdWQiOlsiaHR0cHM6Ly9zdG9ja3dpc2UuYXBwL2FwaSIsImh0dHBzOi8vc3RvY2t3aXNlLnVzLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE2NTM1ODkwODMsImV4cCI6MTY1MzY3NTQ4MywiYXpwIjoiZmtPckRqaHJlcHVzblhtcTllV2JHRnhHbDVXNFJtOHUiLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIn0.cxMugkb6We0I7NVNo73S8r7jdqVpQJ_TlBE3tN-TZ02f4uomr51GHDU_q_yR-fQdVrceSoJ_uQqzCNYG7EYLjCY22E-keaY_HJFDgN8ct5P98iJahzLkQdicvw_LoL7eIy971WwQjK_Eg3ODJcJE6ghU7nar4qXkpCtx9Tp027nj1IDcYCoGFFGBEeu_hW0LxLQdq2dfR7NUjs-xMpxntE6SbYx3KnBC2Bxxcmq-IWqNVtzW7s8FXwvSPljzGs47N_Q6ZBqh197Q-MIC4ib1nK91_2b1dLcA6tDfReYwk_TWsKJCxupzPCqf8BM9Ia8xXYwVfjzux1c8X9G1uUm6sg"
        },
        method: 'GET'
      })
        .then(response => response.json())
      this.portfolios = response.portfolios
    },

    // This is NOT a permanent solution, but at the time it was either update every asset price like this
    // or pay for a CRON job with heroku, and although this is repeated every 30 seconds, it will certainly
    // be a while before the app goes live and this overloads the system.
    async updateAssets(): Promise<void> {
      await fetch('/api/assets-update')
        .then(this.getPortfolios)
      setTimeout(this.updateAssets, 5000)
    },

    setActiveTab(newTab) {
      this.tabConfig.activeTab = newTab
    }
  }
})
</script>