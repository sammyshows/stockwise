<template>
  <div class="flex flex-col grow">
    <div class="h-20 flex justify-between">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
      <TrashIcon @click="this.openModal = true" class="h-6 w-6 mt-1 mr-3" />
    </div>
    <div class="flex flex-col grow px-5">
      <div class="flex flex-col grow justify-between gap-y-4 mt-3">
        <div class="h-0 flex flex-col grow overflow-scroll gap-y-4 text-sm">
          <div>
            <label for="type">Transaction type<span :class="[ invalidType ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
            <select v-model="transaction.type" id="type" :class="[ invalidType ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
              <option value="" :selected="!transaction.type" disabled hidden></option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>
          <div>
            <label for="quantity">Shares<span :class="[ invalidShares ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
            <input v-model="transaction.quantity" id="quantity" type="number" :class="[ invalidShares ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">
          </div>
          <div>
            <label for="initialPrice">Price per share<span :class="[ invalidPrice ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
            <input v-model="transaction.initialPrice" id="initialPrice" type="number" :class="[ invalidPrice ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">
          </div>
          <div>
            <label for="exchangeRate">Exchange rate<span :class="[ invalidExchange ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
            <input v-model="transaction.exchangeRate" id="exchangeRate" type="number" :class="[ invalidExchange ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">
          </div>
          <div class="w-full flex justify-between gap-x-4">
            <div>
              <label for="date">Date</label>
              <input v-model="transaction.date" id="date" type="date" class="bg-transparent text-sm border border-0 border-b border-gray-400 focus:ring-0 focus:border-white" />
            </div>
            <div>
              <label for="time">Time</label>
              <input v-model="transaction.time" id="time" type="time" class="bg-transparent text-sm border border-0 border-b border-gray-400 focus:ring-0 focus:border-white" />
            </div>
          </div>
        </div>
        <div class="text-right mb-7">
          <button @click="updateTransaction()" class="w-28 h-10 rounded-lg bg-bright-green text-black text-xl">SAVE</button>
        </div>
      </div>
    </div>
    <DeleteConfirmation :open="openModal"
                        title="Delete Transaction"
                        message="Are you sure you want to delete this holding? This transaction within it will be deleted from our servers. This action cannot be undone."
                        @close="closeModal"
                        @delete="deleteTransaction" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { TrashIcon } from "@heroicons/vue/outline";

export default defineComponent({
  name: "Portfolio Holdings",

  components: {
    TrashIcon
  },

  mounted() {
    this.getTransaction()
  },

  watch: {
    $route (to, from){
      if (from.name === 'portfolios-portfolio-holdings-holding-update')
        this.tabConfig.activeTab = 'TRANSACTIONS'
    }
  },

  data() {
    return {
      holdingId: this.$route.params.holding,
      portfolioId: this.$route.params.portfolio,
      openModal: false,
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
        id: this.$route.params.transaction,
        type: '',
        quantity: null as (number | null),
        initialPrice: null as (number | null),
        exchangeRate: null as (number | null),
        date: null as (string | null),
        time: null as (string | null)
      }
    }
  },

  methods: {
    async getTransaction(): Promise<void> {
      const response = await fetch('/api/transaction-read', {
        method: 'POST',
        body: JSON.stringify({
          transactionId: this.transaction.id
        })
      })
        .then(response => response.json())
        .then(data => data.transaction[0])
      this.pageDetails.title = response.symbol + " : " + response.exchange
      this.pageDetails.subtitle = response.name
      this.setDateTime(response.timestamp)
      this.transaction.type = response.type
      this.transaction.quantity = response.quantity
      this.transaction.initialPrice = response.initial_price
      this.transaction.exchangeRate = response.exchange_rate
    },

    async updateTransaction() {
      await fetch('/api/transaction-update', {
        method: 'POST',
        body: JSON.stringify({
          transactionId: this.transaction.id,
          holdingId: this.holdingId,
          type: this.transaction.type,
          quantity: this.transaction.quantity,
          initialPrice: this.transaction.initialPrice,
          exchangeRate: this.transaction.exchangeRate,
          timestamp: this.parseDate()
        })
      })
        .then(this.$router.push(`/portfolios/${this.portfolioId}/holdings/${this.holdingId}`))
    },

    setDateTime(dateString): void {
      const date = new Date(dateString)

      // Create the date format
      const dd = String(date.getDate()).padStart(2, '0')
      const MM = String(date.getMonth() + 1).padStart(2, '0')
      const yyyy = date.getFullYear()

      // Create the time format
      const mm = String(date.getMinutes()).padStart(2, '0')
      const hh = String(date.getHours()).padStart(2, '0')

      this.transaction.date = yyyy + '-' + MM + '-' + dd
      this.transaction.time = hh + ':' + mm
    },

    parseDate() {
      const date = new Date(this.transaction.date + 'T' + this.transaction.time)
      return date.toISOString()
    },

    closeModal(): void {
      this.openModal = false
    },

    async deleteTransaction(): Promise<void> {
      await fetch('/api/transaction-delete', {
        method: 'POST',
        body: JSON.stringify({
          transactionId: this.transaction.id,
          holdingId: this.holdingId
        })
      })
        .then(this.$router.push(`/portfolios/${this.portfolioId}/holdings/${this.holdingId}`))
    }
  }
})
</script>