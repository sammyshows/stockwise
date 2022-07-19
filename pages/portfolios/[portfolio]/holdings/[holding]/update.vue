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
        <div class="text-right mb-7">
          <ButtonsCyan text="SAVE" @clicked="updateHolding()" />
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
import { useHoldings } from "~/store/holdings";


export default defineComponent({
  name: "Holdings",

  async setup() {
    const token = await useState('authToken').value
    const uuid = useState('uuid').value
    const holdingStore = useHoldings()
    return { token, uuid, holdingStore }
  },

  components: {
    ChevronLeftIcon, TrashIcon
  },

  props: ['holdings'],

  mounted() {
    this.getHoldingDetails()
    this.getPortfolios()
  },

  data() {
    return {
      openModal: false,
      portfolioId: this.$route.params.portfolio,
      holdingId: this.$route.params.holding,
      pageDetails: {
        symbol: this.$route.params.assetSymbol,
        showLogo: this.$route.params.showLogo,
        title: this.$route.params.assetSymbol,
        subtitle: this.$route.params.assetName,
        returnPath: `/portfolios/${this.$route.params.portfolio}/holdings/${this.$route.params.holding}`
      },
      portfolios: [],
      selectedPortfolio: this.$route.params.portfolio
    }
  },

  methods: {
    async getHoldingDetails(): Promise<void> {
      const response = await fetch('/api/asset-read', {
        headers: {
          authorization: 'Bearer ' + this.token
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

    async updateHolding(): Promise<void> {
      const response = await fetch('/api/holding-update', {
        headers: {
          authorization: 'Bearer ' + this.token
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
    },

    closeModal(): void {
      this.openModal = false
    },

    async deleteHolding(): Promise<void> {
      const response = await fetch('/api/holding-delete', {
        headers: {
          authorization: 'Bearer ' + this.token
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