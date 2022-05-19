<template>
  <div class="grow px-3">
    <div class="h-full pb-12 flex flex-col">
      <div class="h-20 flex justify-between">
        <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
        <TrashIcon @click="this.openModal = true" class="h-6 w-6 mr-3" />
      </div>

      <div class="flex flex-col grow justify-between px-6">
        <div class="flex flex-col grow gap-y-6">
          <div>
            <label for="name" class="flex items-end">Portfolio name<span :class="[ invalidName ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
            <input @click="invalidName = false" v-model="portfolioDetails.name" autocomplete="off" id="name" type="text" :class="[ invalidName ? 'border-red-600' : 'border-gray-600' ]" class="w-full py-5 h-8 bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300">
          </div>
          <div class="flex justify-between">
            <label for="included" class="flex items-center">Included in totals</label>
            <input v-model="portfolioDetails.included" id="included" type="checkbox" class="w-6 h-6 my-auto text-bright-green bg-transparent rounded-sm duration-100 focus:ring-offset-0 focus:ring-0">
          </div>
        </div>
        <div class="text-right">
          <button @click="updatePortfolio()" class="w-28 h-10 rounded-lg bg-bright-green text-black text-xl">SAVE</button>
        </div>
      </div>
    </div>
    <DeleteConfirmation :open="openModal"
                        title="Delete Portfolio"
                        message="Are you sure you want to delete this portfolio? This portfolio and all holdings within it will be deleted from our servers. This action cannot be undone."
                        @close="closeModal"
                        @delete="deletePortfolio" />
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
    this.getPortfolioDetails()
  },

  data() {
    return {
      openModal: false,
      portfolioId: this.$route.params.portfolio,
      pageDetails: {
        title: 'Edit Portfolio',
        returnPath: `/portfolios/${this.$route.params.portfolio}`
      },
      portfolioDetails: {},
      invalidName: false
    }
  },

  methods: {
    validateForm(): Boolean {
      if (this.portfolioDetails.name !== '')
        return true
      else
        this.invalidName = true
    },

    async getPortfolioDetails(): Promise<void> {
      const response = await fetch('/api/portfolio-read', {
        method: 'POST',
        body: JSON.stringify({
          portfolioId: this.portfolioId
        })
      })
        .then(response => response.json())
      this.portfolioDetails = response.data[0]
    },

    async updatePortfolio(): Promise<void> {
      await fetch('/api/portfolio-update', {
        method: 'POST',
        body: JSON.stringify(this.portfolioDetails)
      })
        .then(this.$router.push(`/portfolios/${this.portfolioId}`))
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

<style scoped>
input:-webkit-autofill,
input:-webkit-autofill:focus {
  transition: background-color 600000s 0s, color 600000s 0s;
}
input[data-autocompleted] {
  background-color: transparent !important;
}
</style>