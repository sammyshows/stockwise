<template>
  <div class="w-full h-full flex flex-col">
    <div v-if="$route.path === `/portfolios/${$route.params.portfolio}/holdings/new`">
      <div class="flex justify-between h-14 mb-10 px-3">
        <PageTitle v-if="pageDetails.subtitle" :pageDetails="pageDetails" class="truncate mr-3" />
      </div>

      <div class="flex flex-col grow gap-y-10 px-12">
        <p class="text-sm text-center">What type of holding would you like to add?</p>
        <NuxtLink v-for="holdingType in holdingTypes" :to="{ name: `portfolios-portfolio-holdings-new-${holdingType}` }" class="w-full py-3 border-2 border-bright-cyan bg-opaque-cyan rounded-lg">
          <h2 class="text-center text-xl uppercase">{{ holdingType }}</h2>
        </NuxtLink>
      </div>
    </div>
    <NuxtPage v-else @updateHoldings="$emit('updateHoldings')"></NuxtPage>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useAuth } from "@/store/auth";
import { computed } from "@vue/reactivity";
import { usePortfolios } from "@/store/portfolios";

export default defineComponent({
  name: "New Holding",

  setup() {
    const route = useRoute()
    const authStore = useAuth()
    const portfolioStore = usePortfolios()
    const portfolio = computed(() => portfolioStore.getPortfolio(route.params.portfolio))

    return { authStore, portfolio }
  },

  async mounted() {
    await this.$login()
    this.token = this.authStore.accessToken
    this.getPortfolio()
  },

  data() {
    return {
      token: '',
      pageDetails: {
        title: 'Add Holding',
        subtitle: this.portfolio?.portfolio_name,
        returnPath: `/portfolios/${this.$route.params.portfolio}`
      },
      portfolioId: this.$route.params.portfolio,
      holdingTypes: ['stock', 'forex', 'cash']
    }
  },

  methods: {
    async getPortfolio(): Promise<void> {
      const response = await fetch('/api/portfolio-read', {
        headers: {
          authorization: this.token
        },
        method: 'POST',
        body: JSON.stringify({
          portfolioId: this.portfolioId
        })
      })
          .then(response => response.json())
      this.pageDetails.subtitle = response.data[0].portfolio_name
    }
  }
})
</script>