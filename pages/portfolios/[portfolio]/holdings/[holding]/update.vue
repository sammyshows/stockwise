<template>
  <div class="flex flex-col grow px-3">
    <div class="h-full flex flex-col">
      <div class="flex justify-between h-20">
        <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
        <TrashIcon @click="this.openModal = true" class="h-6 w-6 mr-3" />
      </div>

      <div class="flex flex-col grow justify-between px-6">
        <div class="flex flex-col grow gap-y-4 text-xs">
          <div>
            <label for="type" class="flex items-end">Portfolio<span></span></label>
            <select v-model="selectedPortfolio" id="type" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
              <option v-for="portfolio in portfolios" :value="portfolio.portfolio_id" :selected="portfolio.portfolio_id === selectedPortfolio">{{ portfolio.portfolio_name }}</option>
            </select>
          </div>
        </div>
        <div key="8" class="grow flex items-end justify-end my-7 text-right">
          <ButtonsCyan :disabled="disabledSave" :text="disabledSave ? 'SAVING' : 'SAVE'" @clicked="updateHolding()" />
        </div>
      </div>
    </div>
    <DeleteConfirmation :open="openModal"
                        title="Delete Holding"
                        message="Are you sure you want to delete this holding? This portfolio and all holdings within it will be deleted from our servers. This action cannot be undone."
                        @close="closeModal"
                        @delete="deleteHolding" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ChevronLeftIcon, TrashIcon } from "@heroicons/vue/outline";
import { useAuth } from "@/store/auth";
import { useUser } from "@/store/user";
import { useHoldings } from "@/store/holdings";
import { computed } from "@vue/reactivity";


export default defineComponent({
  name: "Holdings",

  async setup() {
    const route = useRoute()
    const authStore = useAuth()
    const userStore = useUser()
    const holdingStore = useHoldings()
    const holding = computed(() => holdingStore.getHolding(route.params?.holding))

    return { authStore, userStore, holdingStore, holding }
  },

  components: {
    ChevronLeftIcon, TrashIcon
  },

  props: ['holdings', 'assetSymbol'],

  async mounted() {
    await this.$login()
    this.token = this.authStore.accessToken
    this.uuid = this.userStore.userId
    this.getHoldingDetails()
    this.getPortfolios()
  },

  data() {
    return {
      domain: useRuntimeConfig().DOMAIN,
      token: '',
      uuid: '',
      disabledSave: '',
      openModal: false,
      portfolioId: this.$route.params.portfolio,
      holdingId: this.$route.params.holding,
      pageDetails: {
        symbol: this.holding?.symbol,
        showLogo: this.holding?.asset_type === 0,
        title: this.holding?.symbol,
        subtitle: this.holding?.asset_name,
        returnPath: `/portfolios/${this.$route.params.portfolio}/holdings/${this.$route.params.holding}`
      },
      portfolios: [],
      selectedPortfolio: this.$route.params.portfolio
    }
  },

  methods: {
    async getHoldingDetails(): Promise<void> {
      const response = await fetch(this.domain + '/api/asset-read', {
        headers: {
          authorization: this.token
        },
        method: 'POST',
        body: JSON.stringify({
          holdingId: this.holdingId
        })
      })
        .then(response => response.json())

      this.pageDetails.symbol = response.asset.symbol
      this.pageDetails.title = response.asset.symbol
      this.pageDetails.subtitle = response.asset.name
      if (response.asset.type === 0) {
        this.pageDetails.showLogo = true
      }
    },

    async getPortfolios(): Promise<void> {
      const response = await fetch(this.domain + '/api/portfolios-read', {
        headers: {
          authorization: this.token
        },
        method: 'POST',
        body: JSON.stringify({
          uuid: this.uuid
        })
      })
        .then(response => response.json())
      this.portfolios = response.portfolios
    },

    async updateHolding(): Promise<void> {
      this.disabledSave = true
      const response = await fetch(this.domain + '/api/holding-update', {
        headers: {
          authorization: this.token
        },
        method: 'POST',
        body: JSON.stringify({
          holdingId: this.holdingId,
          portfolioId: this.selectedPortfolio
        })
      })

      if (response.status === 200) {
        this.$emit('updatePortfolios')
        setTimeout(() => this.holdingStoreUpdate(), 600)
        this.$router.push(`/portfolios/${this.portfolioId}`)
      }

      this.disabledSave = false
    },

    closeModal(): void {
      this.openModal = false
    },

    async deleteHolding(): Promise<void> {
      const response = await fetch(this.domain + '/api/holding-delete', {
        headers: {
          authorization: this.token
        },
        method: 'POST',
        body: JSON.stringify({
          holdingId: this.holdingId
        })
      })

      if (response.status === 200) {
        this.$emit('updatePortfolios')
        setTimeout(() => this.holdingStoreDelete(), 600)
        this.$router.push(`/portfolios/${this.portfolioId}`)
      }
    },

    holdingStoreUpdate(): void {
      this.holdingStore.updateHolding(this.holdingId, this.selectedPortfolio)
    },

    holdingStoreDelete(): void {
      this.holdingStore.deleteHolding(this.holdingId)
    }
  }
})
</script>

<style scoped>
input:-webkit-autofill,
input:-webkit-autofill:focus {
  transition: background-color 600000s 0s, color 600000s 0s;
}
input[data-autocompleted] {
  background-color: transparent !important;
}
</style>