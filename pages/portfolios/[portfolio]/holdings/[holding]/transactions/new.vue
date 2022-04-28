<template>
  <div class="flex flex-col grow">
    <div class="h-20 flex justify-between">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
    </div>
    <div class="flex flex-col grow px-5">
      <div class="flex flex-col grow justify-between gap-y-4 mt-3">
        <div class="h-0 flex flex-col grow overflow-scroll gap-y-4 text-sm">
          <div>
            <label for="type" class="flex items-end">Transaction type<span :class="[ invalidType ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
            <select v-model="transaction.type" id="type" :class="[ invalidType ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
              <option value="" disabled selected hidden></option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>
          <div>
            <label for="quantity" class="flex items-end">Shares<span :class="[ invalidShares ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
            <input v-model="transaction.quantity" id="quantity" type="number" :class="[ invalidShares ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">
          </div>
          <div>
            <label for="initialPrice" class="flex items-end">Price per share<span :class="[ invalidPrice ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
            <input v-model="transaction.initialPrice" id="initialPrice" type="number" :class="[ invalidPrice ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">
          </div>
          <div>
            <label for="exchangeRate" class="flex items-end">Exchange rate<span :class="[ invalidExchange ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
            <input v-model="transaction.exchangeRate" id="exchangeRate" type="number" :class="[ invalidExchange ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">
          </div>

          <ClientOnly><Datepicker v-model="transaction.date" class="bg-transparent" /></ClientOnly>
          <input type="date" />

        </div>
        <div class="text-right mb-7">
          <button @click="createTransaction()" class="w-28 h-10 rounded-lg bg-bright-green text-black text-xl">SAVE</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "New Transaction",

  mounted() {
    this.getTransaction()
  },

  data() {
    return {
      portfolioId: this.$route.params.portfolio,
      holdingId: this.$route.params.holding,
      pageDetails: {
        title: this.$route.params.assetSymbol,
        subtitle: this.$route.params.assetName,
        returnPath: `/portfolios/${this.$route.params.portfolio}/holdings/${this.$route.params.holding}`
      },
      invalidType: false,
      invalidShares: false,
      invalidPrice: false,
      invalidExchange: false,
      transaction: {
        type: '',
        quantity: null as (number | null),
        initialPrice: null as (number | null),
        exchangeRate: null as (number | null),
        date: null as (Date | null)
      }
    }
  },

  methods: {
    async getTransaction(): Promise<void> {
      const response = await fetch('/api/asset-read', {
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

    async createTransaction(): Promise<void> {
      await fetch('/api/transaction-create', {
        method: 'POST',
        body: JSON.stringify({
          holdingId: this.holdingId,
          type: this.transaction.type,
          quantity: this.transaction.quantity,
          initialPrice: this.transaction.initialPrice,
          exchangeRate: this.transaction.exchangeRate
        })
      })
        .then(this.$router.push({name: 'portfolios-portfolio-holdings-holding',
          params: {
            portfolio: this.portfolioId,
            holding: this.holdingId,
            assetSymbol: this.pageDetails.title,
            assetName: this.pageDetails.subtitle
          }
        }))
    }
  }
})
</script>

<style scoped>

</style>