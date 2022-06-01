<template>
  <div class="flex flex-col grow px-3">
    <div class="h-full flex flex-col">
      <div class="flex justify-between mb-14">
        <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
        <TrashIcon @click="this.openModal = true" class="h-6 w-6 mr-3" />
      </div>

      <div class="flex flex-col grow justify-between px-6">
        <div class="flex flex-col grow gap-y-4 text-sm">
          <div>
            <label for="type" class="flex items-end">Portfolio<span></span></label>
            <select v-model="selectedPortfolio" id="type" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
              <option v-for="portfolio in portfolios" :value="portfolio.id" :selected="portfolio.id === selectedPortfolio">{{ portfolio.name }}</option>
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

export default defineComponent({
  name: "Holdings",

  async setup() {
    const token = await useState('authToken').value
    const uuid = useState('uuid').value
    return { token, uuid }
  },

  components: {
    ChevronLeftIcon, TrashIcon
  },

  props: ['holdings'],

  mounted() {
    this.getHoldingDetails()
    this.getPortfolios()
    console.log(this.$route.params)
  },

  data() {
    return {
      openModal: false,
      portfolioId: this.$route.params.portfolio,
      holdingId: this.$route.params.holding,
      pageDetails: {
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
          .then(data => data.asset[0])
      this.pageDetails.title = response.symbol + " : " + response.exchange
      this.pageDetails.subtitle = response.name
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
      await fetch('/api/holding-update', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          holdingId: this.holdingId,
          portfolioId: this.selectedPortfolio
        })
      })
        .then(this.$router.push(`/portfolios/${this.portfolioId}`))
    },

    closeModal(): void {
      this.openModal = false
    },

    async deleteHolding(): Promise<void> {
      await fetch('/api/holding-delete', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          holdingId: this.holdingId
        })
      })
        .then(this.$router.push(`/portfolios/${this.portfolioId}`))
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