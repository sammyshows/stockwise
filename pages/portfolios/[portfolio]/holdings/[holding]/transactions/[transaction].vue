<template>
  <div class="flex flex-col grow">
    <div class="h-20 px-3 flex justify-between">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
      <div>
        <TrashIcon @click="this.openModal = true" class="h-6 w-6 mt-1 mr-3" />
      </div>
    </div>
    <div v-if="assetData" class="flex flex-col grow px-8">
      <div class="flex flex-col grow justify-between gap-y-4 mt-3">
        <div class="h-0 flex flex-col grow overflow-scroll gap-y-4 text-xs">
          <TransitionGroup tag="div" name="form">
            <div :key="1" class="mb-2">
              <label>Transaction type</label>
              <select v-model="transaction.type" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
                <option value="" :selected="!transaction.type" disabled hidden></option>
                <option :value="0">BUY</option>
                <option :value="1">SELL</option>
                <option :value="2">DIVIDEND</option>
                <option :value="3">DIVIDEND & REINVESTMENT (DRIP)</option>
                <option :value="4">SHARE SPLIT</option>
                <option disabled :value="5">SELL SHORT (Coming soon)</option>
              </select>
            </div>

            <div :key="2" v-if="transaction.type !== 4" class="mb-2">
              <label for="quantity" class="text-xs">{{ !priceRequired ? 'Amount' : 'Quantity' }}</label>
              <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.quantity ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;{{ this.transaction.quantity <= 0 ? 'Please add a positive quantity' : 'You cannot sell a quantity larger than you currently have available. Max. for this transaction: ' + availableShares.toNumber() }}</p>
              <input @keyup="invalid.quantity = false" v-model="transaction.quantity" id="quantity" type="number" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
            </div>

            <div :key="3" v-if="priceRequired" class="mb-2">
              <label for="initialPrice">Price</label>
              <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.initialPrice ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a positive price</p>
              <input @keyup="invalid.initialPrice = false" v-model="transaction.initialPrice" id="initialPrice" type="number" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
            </div>

            <div :key="4" v-if="assetData.type === 0 && transaction.type !== 4" class="mb-2">
              <label for="exchangeRate">Exchange rate (optional)</label>
              <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.exchangeRate ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a positive exchange rate or leave the field empty</p>
              <input @keyup="invalid.exchangeRate = false" v-model="transaction.exchangeRate" id="exchangeRate" type="number" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
            </div>

            <div :key="5" v-if="transaction.type === 1" class="mb-2">
              <label for="method" class="flex items-end">Method</label>
              <select v-model="transaction.sellMethod" id="method" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
                <option :value="0">FIFO</option>
                <option disabled :value="1">Custom Selection (Coming soon)</option>
              </select>
            </div>

            <div :key="6" v-if="transaction.type === 4" class="w-full my-4">
              <h2 class="text-center text-gray-300">SPLIT RATIO</h2>
              <p class="mb-2 text-center text-gray-300 text-tiny leading-3">EXAMPLE: A '4 for 1' split means that every one share you owned previously, now becomes 4 shares, and the cost per share is divided by 4.</p>
              <p class="mb-1 text-center text-tiny leading-normal" :class="[ invalid.splitRatio ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add the split ratio</p>
              <div class="w-full flex justify-between gap-x-4">
                <input @keyup="invalid.splitRatio = false" v-model="transaction.split_one" type="number" class="w-24 mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" />
                <p class="my-auto text-gray-300 text-xs">FOR</p>
                <input @keyup="invalid.splitRatio = false" v-model="transaction.split_two" type="number" class="w-24 mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" />
              </div>
            </div>

            <div :key="6" class="w-full flex justify-between gap-x-4">
              <div class="flex flex-col w-full">
                <label for="date">Date</label>
                <input v-model="transaction.date" id="date" type="date" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" />
              </div>
              <div class="flex flex-col w-full">
                <label for="time">Time</label>
                <input v-model="transaction.time" id="time" type="time" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" />
              </div>
            </div>

            <div key="7" class="w-full flex justify-end my-7">
              <ButtonsCyan :disabled="disabledSave" :text="disabledSave ? 'SAVING' : 'SAVE'" @clicked="updateTransaction()" />
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
    <Spinner class="h-full" v-else />

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
import { useAuth } from "@/store/auth";
import { computed } from "@vue/reactivity";
import { useHoldings } from "@/store/holdings";
import { useTransactions } from "@/store/transactions";


export default defineComponent({
  name: "Portfolio Holdings",

  async setup() {
    const route = useRoute()
    const authStore = useAuth()
    const holdingStore = useHoldings()
    const holding = computed(() => holdingStore.getHolding(route.params?.holding))
    const transactionStore = useTransactions()
    const storeTransaction = transactionStore.getTransaction(route.params.transaction)

    return { holding, transactionStore, storeTransaction, authStore }
  },

  props: [
      'assetData'
  ],

  components: {
    TrashIcon
  },

  computed: {
    priceRequired() {
      return this.assetType !== 2 && this.transaction.type !== 2 && this.transaction.type !== 4
    },

    availableShares() {
      if (this.storedTxType === 1)
        return new BigNumber(this.holdingQuantity).plus(this.storedTxQuantity)
      else if (this.storedTxType === 2 || this.storedTxType === 4)
        return new BigNumber(this.holdingQuantity)
      else
        return new BigNumber(this.holdingQuantity).minus(this.storedTxQuantity)
    },

    splitRatio() {
      return this.transaction.split_one / this.transaction.split_two
    }
  },

  async mounted() {
    if (this.storeTransaction?.type === 4) {
      this.setSplitRatio(this.storeTransaction?.quantity)
    }

    await this.$login()
    this.token = this.authStore.accessToken
    this.getTransaction()
    this.getHolding()
    this.setDateTime(this.storeTransaction?.datetime)
  },

  watch: {
    $route (to, from){
      if (from.name === 'portfolios-portfolio-holdings-holding-update')
        this.tabConfig.activeTab = 'TRANSACTIONS'
    }
  },

  data() {
    return {
      domain: useRuntimeConfig().DOMAIN,
      token: '',
      holdingId: this.$route.params.holding,
      portfolioId: this.$route.params.portfolio,
      disabledSave: false,
      openModal: false,
      pageDetails: {
        symbol: this.holding?.symbol,
        showLogo: this.holding?.asset_type === 0,
        title: this.holding?.symbol,
        subtitle: this.holding?.asset_name,
        returnPath: `/portfolios/${this.$route.params.portfolio}/holdings/${this.$route.params.holding}`
      },
      assetType: null as (null | number),
      holdingQuantity: null as (null | number),
      storedTxType: null as (null | number),
      storedTxQuantity: null as (null | number), // This is used when checking if the quantity entered by user is valid
      invalid: {
        quantity: false,
        initialPrice: false,
        exchangeRate: false,
        splitRatio: false,
        date: false
      },
      transaction: {
        id: this.$route.params.transaction,
        type: this.storeTransaction?.type,
        sellMethod: this.storeTransaction?.sell_method,
        quantity: this.storeTransaction?.type === 4 ? null : this.storeTransaction?.initial_quantity,
        initialPrice: this.storeTransaction?.price,
        exchangeRate: this.storeTransaction?.exchange_rate,
        split_one: null as (number | null), // if this tx is in state, these are both populated via setSplitRatio() in mounted.
        split_two: null as (number | null),
        date: null as (string | null),
        time: null as (string | null)
      }
    }
  },

  methods: {
    validateForm(): Boolean {
      // This was a condition in the invalid quantity check, but I don't know why... If you, Sam McCarthy, still don't know it's purpose past 07/10/2022, DELETE! :D
      // console.log(this.availableShares.isGreaterThanOrEqualTo(this.transaction.quantity) && this.transaction.type !== 1)
      if (this.transaction.type !== 4 && (this.transaction.quantity <= 0 || (this.availableShares.isLessThan(this.transaction.quantity) && this.transaction.type === 1)))
        this.invalid.quantity = true
      if (this.priceRequired && (this.transaction.initialPrice === null || this.transaction.initialPrice === '' || this.transaction.initialPrice < 0))
        this.invalid.initialPrice = true
      if (this.transaction.type !== 4 && this.transaction.exchangeRate && this.transaction.exchangeRate <= 0)
        this.invalid.exchangeRate = true
      if (this.transaction.type === 4 && (this.transaction.split_one <= 0 || this.transaction.split_two <= 0))
        this.invalid.splitRatio = true

      return this.invalid.quantity === false && this.invalid.initialPrice === false && this.invalid.exchangeRate === false && this.invalid.splitRatio === false
    },

    async getTransaction(): Promise<void> {
      const response = await fetch(this.domain + '/api/transaction-read', {
        headers: {
          authorization: this.token
        },
        method: 'POST',
        body: JSON.stringify({
          transactionId: this.transaction.id
        })
      })
        .then(response => response.json())
        .then(response => response.data[0])

      this.pageDetails.symbol = response.symbol
      this.pageDetails.title = response.symbol
      this.pageDetails.subtitle = response.name
      this.assetType = response.asset_type
      if (response.asset_type === 0) {
        this.pageDetails.showLogo = true
      }
      if (response.type === 4) {
        this.setSplitRatio(response.quantity)
      }
      this.setDateTime(response.timestamp)
      this.transaction.type = response.type
      this.transaction.sellMethod = response.sell_method || 0
      this.storedTxType = response.type
      this.storedTxQuantity = Math.abs(response.quantity)
      this.transaction.quantity = response.type === 4 ? null : Math.abs(response.quantity)
      this.transaction.initialPrice = response.initial_price
      this.transaction.exchangeRate = response.exchange_rate
    },

    async getHolding(): Promise<void> {
      const response = await fetch(this.domain + '/api/holding-read', {
        headers: {
          authorization: this.token
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
      this.disabledSave = true
      if (this.validateForm()) {
        const response = await fetch(this.domain + '/api/transaction-update', {
          headers: {
            authorization: this.token
          },
          method: 'POST',
          body: JSON.stringify({
            token: this.token,
            transactionId: this.transaction.id,
            holdingId: this.holdingId,
            type: this.transaction.type,
            sellMethod: this.transaction.type === 1 ? this.transaction.sellMethod : null,
            quantity: this.transaction.type === 4 ? this.splitRatio : this.transaction.quantity,
            initialPrice: !this.priceRequired ? 1 : this.transaction.initialPrice,
            exchangeRate: this.transaction.type === 4 ? null : this.transaction.exchangeRate,
            timestamp: this.parseDate()
          })
        })

        if (response.status === 200) {
          this.$emit('updateTransactions')
          this.$router.push(`/portfolios/${this.portfolioId}/holdings/${this.holdingId}`)
        }
      }
      this.disabledSave = false
    },

    async deleteTransaction(): Promise<void> {
      const response = await fetch(this.domain + '/api/transaction-delete', {
        headers: {
          authorization: this.token
        },
        method: 'POST',
        body: JSON.stringify({
          token: this.token,
          transactionId: this.transaction.id,
          holdingId: this.holdingId
        })
      })

      if (response.status === 200) {
        this.$emit('updateTransactions')
        this.$router.push(`/portfolios/${this.portfolioId}/holdings/${this.holdingId}`)
      }
    },

    setSplitRatio(multiplier) {
      // e.g. if multiplier is 3, then the ratio is 3 FOR 1
      // e.g. if multiplier is 0.3333, then the ratio is 1 FOR 3
      if (multiplier < 1) {
        this.transaction.split_one = 1
        this.transaction.split_two = 1 / multiplier
      } else {
        this.transaction.split_one = multiplier
        this.transaction.split_two = 1
      }
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