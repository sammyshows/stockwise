<template>
  <div class="flex flex-col grow px-3">
    <div class="h-20 flex justify-between">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
    </div>
    <div v-if="assetType !== null" class="flex flex-col grow px-5">
      <div class="flex flex-col grow justify-between gap-y-4 mt-3">
        <div class="h-0 grow overflow-scroll text-sm">
          <TransitionGroup tag="div" name="form">
            <div :key="1" class="mb-4">
              <label for="type" class="flex items-end">Transaction type</label>
              <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.type ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please select a transaction type</p>
              <select @change="invalid.type = false" v-model="transaction.type" id="type" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
                <option value="" disabled selected hidden></option>
                <option :value="0">BUY</option>
                <option :value="1">SELL</option>
              </select>
            </div>
            <div :key="2" class="mb-4">
              <label for="quantity">Quantity</label>
              <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.quantity ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;{{ this.transaction.quantity <= 0 ? 'Please add a positive quantity' : 'You cannot sell a quantity larger than you currently have available. Max. for this transaction: ' + this.holdingQuantity }}</p>
              <input @keyup="invalid.quantity = false" v-model="transaction.quantity" id="quantity" type="number" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
            </div>
            <div :key="3" class="mb-4">
              <label for="initialPrice">Price</label>
              <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.initialPrice ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a positive price</p>
              <input @keyup="invalid.initialPrice = false" v-model="transaction.initialPrice" id="initialPrice" type="number" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
            </div>
            <div :key="4" v-if="assetType === 0" class="mb-4">
              <label for="exchangeRate">Exchange rate (optional)</label>
              <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.exchangeRate ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a positive exchange rate or leave the field empty</p>
              <input @keyup="invalid.exchangeRate = false" v-model="transaction.exchangeRate" id="exchangeRate" type="number" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
            </div>
            <div v-if="transaction.type === 1" :key="5" class="mb-4">
              <label for="method" class="flex items-end">Method</label>
              <select v-model="transaction.sellMethod" id="method" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
                <option :value="0">FIFO</option>
                <option :value="1">Custom Selection</option>
              </select>
            </div>
            <div :key="6" class="w-full flex justify-between gap-x-4">
              <div>
                <label for="date">Date</label>
                <input v-model="transaction.date" id="date" type="date" class="bg-transparent text-sm border border-0 border-b focus:ring-0 focus:border-gray-300" />
              </div>
              <div>
                <label for="time">Time</label>
                <input v-model="transaction.time" id="time" type="time" class="w-full bg-transparent text-sm border border-0 border-b focus:ring-0 focus:border-gray-300" />
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
    this.getHolding()
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
      assetType: null as (null | number),
      holdingQuantity: null as (null | number),
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
        sellMethod: 0, // 0 == FIFO, 1 == Custom Selection
        date: null as (string | null),
        time: null as (string | null)
      }
    }
  },

  methods: {
    validateForm(): Boolean {
      if (this.transaction.type === null)
        this.invalid.type = true
      if (this.transaction.quantity <= 0 || (this.holdingQuantity < this.transaction.quantity && this.transaction.type === 1))
        this.invalid.quantity = true
      if (!this.transaction.initialPrice || this.transaction.initialPrice < 0)
        this.invalid.initialPrice = true
      if (this.transaction.exchangeRate && this.transaction.exchangeRate <= 0)
        this.invalid.exchangeRate = true

      return this.invalid.type === false && this.invalid.quantity === false && this.invalid.initialPrice === false && this.invalid.exchangeRate === false
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

    async getHolding(): Promise<void> {
      const response = await fetch('/api/holding-read', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          holdingId: this.holdingId
        })
      })
        .then(response => response.json())
        .then(response => response.data)
      this.assetType = response.type
      this.holdingQuantity = response.current_quantity
    },

    async createTransaction(): Promise<void> {
      if (this.validateForm()) {
        await fetch('/api/transaction-create', {
          headers: {
            authorization: 'Bearer ' + this.token
          },
          method: 'POST',
          body: JSON.stringify({
            token: this.token,
            holdingId: this.holdingId,
            type: this.transaction.type,
            sellMethod: this.transaction.sellMethod,
            quantity: this.transaction.quantity,
            initialPrice: this.transaction.initialPrice,
            exchangeRate: this.transaction.exchangeRate,
            timestamp: this.parseDate()
          })
        })
        await this.$router.push({
            name: 'portfolios-portfolio-holdings-holding',
            params: {
              portfolio: this.portfolioId,
              holding: this.holdingId,
              assetSymbol: this.pageDetails.title,
              assetName: this.pageDetails.subtitle
            }
          })
      }
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
