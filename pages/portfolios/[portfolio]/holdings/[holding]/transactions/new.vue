<template>
  <div class="flex flex-col grow px-3">
    <div class="h-20 flex justify-between">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
    </div>
    <div class="flex flex-col grow px-5">
      <div class="flex flex-col grow justify-between gap-y-4 mt-3">
        <div class="h-0 flex flex-col grow overflow-scroll gap-y-4 text-sm">
          <TransitionGroup tag="div" name="form">
            <div :key="1" class="mb-4">
              <label for="type" class="flex items-end">Transaction type<span :class="[ invalid.type ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
              <select v-model="transaction.type" id="type" :class="[ invalid.type ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
                <option value="" disabled selected hidden></option>
                <option :value="0">BUY</option>
                <option :value="1">SELL</option>
              </select>
            </div>
            <div :key="2" class="mb-4">
              <label for="quantity">Shares<span :class="[ invalid.quantity ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
              <input v-model="transaction.quantity" id="quantity" type="number" :class="[ invalid.quantity ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">
            </div>
            <div :key="3" class="mb-4">
              <label for="initialPrice">Price per share<span :class="[ invalid.initialPrice ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
              <input v-model="transaction.initialPrice" id="initialPrice" type="number" :class="[ invalid.initialPrice ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">
            </div>
            <div :key="4" class="mb-4">
              <label for="exchangeRate">Exchange rate<span :class="[ invalid.exchangeRate ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
              <input v-model="transaction.exchangeRate" id="exchangeRate" type="number" :class="[ invalid.exchangeRate ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">
            </div>
            <div v-if="transaction.type === 1" :key="5" class="mb-4">
              <label for="method" class="flex items-end">Method</label>
              <select v-model="transaction.method" id="method" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
                <option :value="0">FIFO</option>
                <option :value="1">Custom Selection</option>
              </select>
            </div>
            <div :key="6" class="w-full flex justify-between gap-x-4">
              <div>
                <label for="date">Date</label>
                <input v-model="transaction.date" id="date" type="date" class="bg-transparent text-sm border border-0 border-b border-gray-400 focus:ring-0 focus:border-white" />
              </div>
              <div>
                <label for="time">Time</label>
                <input v-model="transaction.time" id="time" type="time" class="bg-transparent text-sm border border-0 border-b border-gray-400 focus:ring-0 focus:border-white" />
              </div>
            </div>
          </TransitionGroup>
        </div>

        <div class="text-right mb-7">
          <ButtonsCyan text="SAVE" @clicked="createTransaction()" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "New Transaction",

  async setup() {
    const token = await useState('authToken').value
    return { token }
  },

  mounted() {
    this.getTransaction()
    this.setDateTime()
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
      invalid: {
        type: false,
        quantity: false,
        initialPrice: false,
        exchangeRate: false,
        date: false
      },
      transaction: {
        type: null as (number | null),
        quantity: null as (number | null),
        initialPrice: null as (number | null),
        exchangeRate: null as (number | null),
        method: 0, // 0 == FIFO, 1 == Custom Selection
        date: null as (string | null),
        time: null as (string | null)
      }
    }
  },

  methods: {
    validateForm(): Boolean {
      if (!this.transaction.type)
        this.invalid.type = true
      if (this.transaction.quantity <= 0)
        this.invalid.quantity = true
      if (this.transaction.initialPrice < 0)
        this.invalid.initialPrice = true
      if (this.transaction.exchangeRate <= 0)
        this.invalid.exchangeRate = true

      return this.invalid.type === true && this.invalid.quantity === true && this.invalid.initialPrice === true && this.invalid.exchangeRate === true
    },

    async getTransaction(): Promise<void> {
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
      this.pageDetails.title = response.symbol
      this.pageDetails.subtitle = response.name
    },

    async createTransaction(): Promise<void> {
      await fetch('/api/transaction-create', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          token: this.token,
          holdingId: this.holdingId,
          type: this.transaction.type,
          sellMethod: this.transaction.method,
          quantity: this.transaction.quantity,
          initialPrice: this.transaction.initialPrice,
          exchangeRate: this.transaction.exchangeRate,
          timestamp: this.parseDate()
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
    },

    setDateTime(): void {
      const date = new Date()

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
    }
  }
})
</script>
