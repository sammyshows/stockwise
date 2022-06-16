<template>
  <div class="flex flex-col grow">
    <div class="h-20 px-3 flex justify-between">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
      <TrashIcon @click="this.openModal = true" class="h-6 w-6 mt-1 mr-3" />
    </div>
    <div v-if="loaded" class="flex flex-col grow px-5">
      <div class="flex flex-col grow justify-between gap-y-4 mt-3">
        <div class="h-0 flex flex-col grow overflow-scroll gap-y-4 text-sm">
          <TransitionGroup tag="div" name="form">
            <div :key="1" class="mb-4">
              <label for="type">Transaction type</label>
              <select v-model="transaction.type" id="type" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
                <option value="" :selected="!transaction.type" disabled hidden></option>
                <option :value="0">BUY</option>
                <option :value="1">SELL</option>
              </select>
            </div>
            <div :key="2" class="mb-4">
              <label for="quantity">Quantity</label>
              <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.quantity ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;{{ this.transaction.quantity <= 0 ? 'Please add a positive quantity' : 'You cannot sell a quantity larger than you currently have available. Max. for this transaction: ' + BigNumber(this.holdingQuantity).plus(this.storedTxQuantity).toNumber() }}</p>
              <input @click="invalid.quantity = false" v-model="transaction.quantity" id="quantity" type="number" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
            </div>
            <div :key="3" class="mb-4">
              <label for="initialPrice">Price</label>
              <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.initialPrice ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a positive price</p>
              <input @click="invalid.initialPrice = false" v-model="transaction.initialPrice" id="initialPrice" type="number" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
            </div>
            <div :key="4" v-if="assetType === 0" class="mb-4">
              <label for="exchangeRate">Exchange rate (optional)</label>
              <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.exchangeRate ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a positive exchange rate or leave the field empty</p>
              <input @click="invalid.exchangeRate = false" v-model="transaction.exchangeRate" id="exchangeRate" type="number" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
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
                <input v-model="transaction.date" id="date" type="date" class="bg-transparent text-sm border border-0 border-b border-gray-400 focus:ring-0 focus:border-gray-300" />
              </div>
              <div>
                <label for="time">Time</label>
                <input v-model="transaction.time" id="time" type="time" class="w-full bg-transparent text-sm border border-0 border-b border-gray-400 focus:ring-0 focus:border-gray-300" />
              </div>
            </div>
          </TransitionGroup>
        </div>
        <!-- This button should only be visible if fields are different. When validation is added, it should set a
        property in data that this buttons display property is bound to -->
        <div class="text-right mb-7">
          <ButtonsCyan text="SAVE" @clicked="updateTransaction()" />
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
import { BigNumber } from "bignumber.js";

export default defineComponent({
  name: "Portfolio Holdings",

  async setup() {
    const token = await useState('authToken').value
    return { token }
  },

  components: {
    TrashIcon
  },

  mounted() {
    this.getTransaction()
    this.getHolding()
  },

  watch: {
    $route (to, from){
      if (from.name === 'portfolios-portfolio-holdings-holding-update')
        this.tabConfig.activeTab = 'TRANSACTIONS'
    }
  },

  data() {
    return {
      loaded: false,
      holdingId: this.$route.params.holding,
      portfolioId: this.$route.params.portfolio,
      openModal: false,
      pageDetails: {
        title: this.$route.params.assetSymbol,
        subtitle: this.$route.params.assetName,
        returnPath: `/portfolios/${this.$route.params.portfolio}/holdings/${this.$route.params.holding}`
      },
      assetType: null as (number | null),
      holdingQuantity: null as (null | number),
      storedTxQuantity: null as (null | number), // This is used when checking if the quantity entered by user is valid
      invalid: {
        quantity: false,
        initialPrice: false,
        exchangeRate: false,
        date: false
      },
      transaction: {
        id: this.$route.params.transaction,
        type: null as (number | null),
        sellMethod: null as (number | null),
        quantity: null as (number | null),
        initialPrice: null as (number | null),
        exchangeRate: null as (number | null),
        date: null as (string | null),
        time: null as (string | null)
      }
    }
  },

  methods: {
    validateForm(): Boolean {
      if (this.transaction.quantity <= 0 || (new BigNumber(this.holdingQuantity).plus(this.storedTxQuantity).isLessThan(this.transaction.quantity) && this.transaction.type === 1))
        this.invalid.quantity = true
      if (this.transaction.initialPrice < 0)
        this.invalid.initialPrice = true
      if (this.transaction.exchangeRate && this.transaction.exchangeRate <= 0)
        this.invalid.exchangeRate = true

      return this.invalid.quantity === false && this.invalid.initialPrice === false && this.invalid.exchangeRate === false
    },

    async getTransaction(): Promise<void> {
      const response = await fetch('/api/transaction-read', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          transactionId: this.transaction.id
        })
      })
        .then(response => response.json())
        .then(response => response.data[0])
      this.loaded = true
      this.pageDetails.title = response.symbol
      this.pageDetails.subtitle = response.name
      this.setDateTime(response.timestamp)
      this.assetType = response.asset_type
      this.transaction.type = response.type
      this.transaction.sellMethod = response.sell_method
      this.storedTxQuantity = Math.abs(response.quantity)
      this.transaction.quantity = Math.abs(response.quantity)
      this.transaction.initialPrice = response.initial_price
      this.transaction.exchangeRate = response.exchange_rate
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
      this.holdingQuantity = response.current_quantity
    },

    async updateTransaction() {
      if (this.validateForm()) {
        await fetch('/api/transaction-update', {
          headers: {
            authorization: 'Bearer ' + this.token
          },
          method: 'POST',
          body: JSON.stringify({
            token: this.token,
            transactionId: this.transaction.id,
            holdingId: this.holdingId,
            type: this.transaction.type,
            quantity: this.getQuantity(),
            initialPrice: this.transaction.initialPrice,
            exchangeRate: this.transaction.exchangeRate,
            timestamp: this.parseDate()
          })
        })
          .then(this.$router.push(`/portfolios/${this.portfolioId}/holdings/${this.holdingId}`))
      }
    },

    async deleteTransaction(): Promise<void> {
      await fetch('/api/transaction-delete', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          token: this.token,
          transactionId: this.transaction.id,
          holdingId: this.holdingId
        })
      })
        .then(this.$router.push(`/portfolios/${this.portfolioId}/holdings/${this.holdingId}`))
    },

    getQuantity(): number {
      if (this.transaction.type === 0)
        return this.transaction.quantity
      else if (this.transaction.type === 1)
        return this.transaction.quantity * -1
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

    BigNumber
  }
})
</script>