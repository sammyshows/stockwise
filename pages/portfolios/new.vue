<template>
  <div class="h-full flex flex-col px-3">
    <div class="flex justify-between mb-10">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
    </div>

    <div class="flex flex-col grow justify-between px-6">
      <div class="flex flex-col grow text-xs">
        <TransitionGroup name="form">
          <div key="1">
            <label for="name" class="flex items-end">Portfolio name</label>
            <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.name ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a name for your portfolio</p>
            <input @keyup="invalid.name = false" v-model="portfolioDetails.portfolio_name" autocomplete="off" id="name" type="text" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
          </div>

          <div key="2" class="flex justify-between mt-4">
            <label for="included" class="flex items-center">Included in totals</label>
            <input v-model="portfolioDetails.included" id="included" type="checkbox" class="w-6 h-6 my-auto text-bright-cyan/40 bg-transparent rounded-sm duration-100 focus:ring-offset-0 focus:ring-0">
          </div>
        </TransitionGroup>
      </div>
      <div class="grow flex items-end justify-end my-7 text-right">
        <ButtonsCyan :disabled="disabledSave" :text="disabledSave ? 'SAVING' : 'SAVE'" @clicked="createPortfolio()" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { v4 as uuidv4 } from 'uuid';
import { usePortfolios } from "@/store/portfolios";

export default defineComponent({
  name: "New Portfolio",

  async setup() {
    const token = await useState('authToken').value
    const portfolioStore = usePortfolios()
    return { token, portfolioStore }
  },

  data() {
    return {
      disabledSave: false,
      pageDetails: {
        title: 'New Portfolio',
        returnPath: '/portfolios'
      },
      invalid: {
        name: false
      },
      portfolioDetails: { // Has extra info for adding to the current portfolios state
        userId: useState('uuid').value,
        portfolio_id: uuidv4(),
        portfolio_name: '',
        holding_count: 0,
        included: true
      }
    }
  },

  methods: {
    validateForm(): Boolean {
      if (this.portfolioDetails.portfolio_name === '')
        this.invalid.name = true

      return this.invalid.name === false
    },

    async createPortfolio(): Promise<void> {
      this.disabledSave = true
      if (this.validateForm()) {
        const response = await fetch('/api/portfolio-create', {
          headers: {
            authorization: 'Bearer ' + this.token
          },
          method: 'POST',
          body: JSON.stringify(this.portfolioDetails)
        })
        if (response.status === 200) {
          setTimeout(() => this.portfolioStoreCreate(), 600)
          await this.$router.push('/portfolios')
        }
      }
      this.disabledSave = false
    },

    portfolioStoreCreate() {
      this.portfolioStore.$patch((state) => {
        state.portfolios.push(this.portfolioDetails)
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