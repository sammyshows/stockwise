<template>
  <div class="flex flex-col grow">
    <div class="h-full flex flex-col">
      <div class="flex justify-between mb-14">
        <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
        <TrashIcon @click="this.openModal = true" class="h-6 w-6 mr-3 my-auto" />
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
          <button @click="updateHolding" class="w-28 h-10 rounded-lg bg-bright-green text-black text-xl">SAVE</button>
        </div>
      </div>
    </div>
    <DeleteConfirmation :open="openModal"
                        title="Delete Holding"
                        message="Are you sure you want to delete this holding? This portfolio and all holdings within it will be deleted from our servers. This action cannot be undone."
                        @open="closeModal"
                        @delete="deleteHolding" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ChevronLeftIcon, TrashIcon } from "@heroicons/vue/outline";

export default defineComponent({
  name: "Holdings",

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
        title: this.$route.params.holdingName,
        returnPath: `/portfolios/${this.$route.params.portfolio}/holdings/${this.$route.params.holding}`
      },
      portfolios: [],
      selectedPortfolio: this.$route.params.portfolio
    }
  },

  methods: {
    async getHoldingDetails(): Promise<void> {
      const response = await fetch('/api/asset-read', {
        method: 'POST',
        body: JSON.stringify({
          holdingId: this.holdingId
        })
      })
        .then(response => response.json())
      this.pageDetails.title = response.asset[0].name
    },

    async getPortfolios(): Promise<void> {
      const response = await fetch('/api/portfolios-read')
        .then(response => response.json())
      this.portfolios = response.portfolios
    },

    async updateHolding(): Promise<void> {
      await fetch('/api/holding-update', {
        method: 'POST',
        body: JSON.stringify({
          holdingId: this.holdingId,
          portfolioId: this.portfolioId
        })
      })
        .then(this.$router.push(`/portfolios/${this.portfolioId}/holdings/${this.holdingId}`))
    },

    closeModal(): void {
      this.openModal = false
    },

    async deleteHolding(): Promise<void> {
      await fetch('/api/holding-delete', {
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