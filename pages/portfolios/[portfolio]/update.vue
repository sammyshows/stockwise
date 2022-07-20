<template>
  <div class="grow px-3">
    <div class="h-full flex flex-col">
      <div class="h-20 flex justify-between">
        <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
        <TrashIcon @click="this.openModal = true" class="h-6 w-6 mr-3" />
      </div>

      <div class="flex flex-col grow justify-between px-6">
        <div class="flex flex-col grow text-xs">
          <TransitionGroup tag="div" name="form">
            <div key="1">
              <label for="name" class="flex items-end">Portfolio name</label>
              <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.name ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a name for your portfolio</p>
              <input @click="invalid.name = false" v-model="portfolioDetails.portfolio_name" autocomplete="off" id="name" type="text" :class="[ invalidName ? 'border-red-600' : 'border-gray-600' ]" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
            </div>
            <div key="2" class="flex justify-between mt-4">
              <label for="included" class="flex items-center">Included in totals</label>
              <input v-model="portfolioDetails.included" id="included" type="checkbox" class="w-6 h-6 my-auto text-bright-cyan/50 bg-transparent rounded-sm duration-100 focus:ring-offset-0 focus:ring-0">
            </div>
          </TransitionGroup>
        </div>
        <div class="grow flex items-end justify-end my-7 text-right">
          <ButtonsCyan :disabled="disabledSave" :text="disabledSave ? 'SAVING' : 'SAVE'" @clicked="updatePortfolio()" />
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
import { usePortfolios } from "@/store/portfolios";

export default defineComponent({
  name: "Edit Portfolio",

  async setup() {
    const portfolioStore = usePortfolios()
    const token = await useState('authToken').value
    return { portfolioStore, token }
  },

  components: {
    ChevronLeftIcon, TrashIcon
  },

  props: ['holdings'],

  mounted() {
    this.getPortfolioDetails()
  },

  data() {
    return {
      disabledSave: false,
      openModal: false,
      portfolioId: this.$route.params.portfolio,
      pageDetails: {
        title: 'Edit Portfolio',
        returnPath: `/portfolios/${this.$route.params.portfolio}`
      },
      portfolioDetails: {},
      invalid: {
        name: false
      },
      invalidName: false
    }
  },

  methods: {
    validateForm(): Boolean {
      if (this.portfolioDetails.portfolio_name === '')
        this.invalid.name = true

      return this.invalid.name === false
    },

    async getPortfolioDetails(): Promise<void> {
      const response = await fetch('/api/portfolio-read', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          portfolioId: this.portfolioId
        })
      })
        .then(response => response.json())

      this.portfolioDetails = response.data[0]
    },

    async updatePortfolio(): Promise<void> {
      this.disabledSave = true
      if (this.validateForm()) {
        const response = await fetch('/api/portfolio-update', {
          headers: {
            authorization: 'Bearer ' + this.token
          },
          method: 'POST',
          body: JSON.stringify(this.portfolioDetails)
        })

        if (response.status === 200) {
          this.portfolioStoreUpdate()
          await this.$router.push(`/portfolios/${this.portfolioId}`)
        }
      }
      this.disabledSave = false
    },

    closeModal(): void {
      this.openModal = false
    },

    async deletePortfolio(): Promise<void> {
      const response = await fetch('/api/portfolio-delete', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          portfolioId: this.portfolioId
        })
      })
      if (response.status === 200) {
        setTimeout(() => this.portfolioStoreDelete(), 600)
        await this.$router.push('/portfolios')
      }
    },

    portfolioStoreUpdate() {
      const updatedPortfolios = this.portfolioStore.portfolios.map(p => {
        if (p.portfolio_id === this.portfolioId) {
          p.portfolio_name = this.portfolioDetails.portfolio_name
          p.portfolio_included = this.portfolioDetails.included
        }
        return p
      })
      this.portfolioStore.$patch({
        portfolios: updatedPortfolios
      })
    },

    portfolioStoreDelete() {
      this.portfolioStore.$patch({
        portfolios: this.portfolioStore.portfolios.filter(p => p.portfolio_id !== this.portfolioId)
      })
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