<template>
  <div class="flex flex-col grow px-3">
    <div class="h-20 flex justify-between">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
    </div>
    <div v-if="assetType != null" class="flex flex-col grow px-5">
      <div class="flex flex-col grow justify-between gap-y-4 mt-3">
        <div class="h-0 grow overflow-scroll text-sm">
          <TransitionGroup tag="div" name="form">
            <div :key="1" class="mb-2">
              <label for="type" class="flex items-end text-xs">Transaction type</label>
              <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.type ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please select a transaction type</p>
              <select @change="invalid.type = false" v-model="transaction.type" id="type" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
                <option value="" disabled selected hidden></option>
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
              <p v-if="this" class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.quantity ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;{{ this.transaction.quantity <= 0 ? 'Please add a positive quantity' : 'You cannot sell a quantity larger than you currently have available. Max. for this transaction: ' + this.holdingQuantity }}</p>
              <input @keyup="invalid.quantity = false" v-model="transaction.quantity" id="quantity" type="number" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
            </div>

            <div :key="3" v-if="priceRequired" class="mb-2">
              <label for="initialPrice" class="text-xs">Price</label>
              <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.initialPrice ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a positive price</p>
              <input @keyup="invalid.initialPrice = false" v-model="transaction.initialPrice" id="initialPrice" type="number" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
            </div>

            <div :key="4" v-if="assetType === 0 && transaction.type !== 4" class="mb-2">
              <label for="exchangeRate" class="text-xs">Exchange rate (optional)</label>
              <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.exchangeRate ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a positive exchange rate or leave the field empty</p>
              <input @keyup="invalid.exchangeRate = false" v-model="transaction.exchangeRate" id="exchangeRate" type="number" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
            </div>

            <div :key="5" v-if="transaction.type === 1" class="mb-2">
              <label for="method" class="flex items-end text-xs">Method</label>
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

            <div :key="7" class="w-full flex justify-between gap-x-4">
              <div class="flex flex-col w-full">
                <label for="date" class="text-xs">Date</label>
                <input v-model="transaction.date" id="date" type="date" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" />
              </div>
              <div class="flex flex-col w-full">
                <label for="time" class="text-xs">Time</label>
                <input v-model="transaction.time" id="time" type="time" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" />
              </div>
            </div>
          </TransitionGroup>
        </div>

        <div class="w-full flex justify-end my-7">
          <ButtonsCyan :disabled="disabledSave" :text="disabledSave ? 'CREATING' : 'CREATE'" @clicked="createTransaction()" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useAuth } from "@/store/auth";
import { useHoldings } from "@/store/holdings";
import {computed} from "@vue/reactivity";

export default defineComponent({
  name: "New Transaction",

  setup() {
    const route = useRoute()
    const authStore = useAuth()
    const holdingStore = useHoldings()
    const holding = computed(() => holdingStore.getHolding(route.params?.holding))

    return { authStore, holding }
  },

  async mounted() {
    await this.$login()
    this.token = this.authStore.accessToken
    this.getAsset()
    this.getHolding()
    this.setDateTime()
  },

  computed: {
    priceRequired() {
      return this.assetType !== 2 && this.transaction.type !== 2 && this.transaction.type !== 4
    },

    splitRatio() {
      return this.transaction.split_one / this.transaction.split_two
    }
  },

  data() {
    return {
      portfolioId: this.$route.params.portfolio,
      holdingId: this.$route.params.holding,
      disabledSave: false,
      pageDetails: {
        symbol: this.holding?.symbol,
        showLogo: this.holding?.asset_type === 0,
        title: this.holding?.symbol,
        subtitle: this.holding?.asset_name,
        returnPath: `/portfolios/${this.$route.params.portfolio}/holdings/${this.$route.params.holding}`
      },
      assetType: this.holding?.asset_type,
      holdingQuantity: null as (null | number),
      invalid: {
        type: false,
        quantity: false,
        initialPrice: false,
        exchangeRate: false,
        splitRatio: false,
        date: false
      },
      transaction: {
        type: null as (number | null),
        quantity: null as (number | null),
        initialPrice: null as (number | null),
        exchangeRate: null as (number | null),
        sellMethod: 0, // 0 == FIFO, 1 == Custom Selection
        split_one: null as (number | null),
        split_two: null as (number | null),
        date: null as (string | null),
        time: null as (string | null)
      }
    }
  },

  methods: {
    validateForm(): Boolean {
      if (this.transaction.type === null)
        this.invalid.type = true
      if (this.transaction.type !== 4 && (this.transaction.quantity <= 0 || (this.holdingQuantity < this.transaction.quantity && this.transaction.type === 1)))
        this.invalid.quantity = true
      if (this.priceRequired && (this.transaction.initialPrice === null || this.transaction.initialPrice === '' || this.transaction.initialPrice < 0))
        this.invalid.initialPrice = true
      if (this.transaction.type !== 4 && this.transaction.exchangeRate && this.transaction.exchangeRate <= 0)
        this.invalid.exchangeRate = true
      if (this.transaction.type === 4 && (this.transaction.split_one <= 0 || this.transaction.split_two <= 0))
        this.invalid.splitRatio = true

      return this.invalid.type === false && this.invalid.quantity === false && this.invalid.initialPrice === false && this.invalid.exchangeRate === false && this.invalid.splitRatio === false
    },

    async getAsset(): Promise<void> {
      const response = await fetch('/api/asset-read', {
        headers: {
          authorization: this.token
        },
        method: 'POST',
        body: JSON.stringify({
          holdingId: this.holdingId
        })
      })
        .then(response => response.json())

      this.pageDetails.symbol = response.asset.symbol
      this.pageDetails.title = response.asset.symbol
      this.pageDetails.subtitle = response.asset.name
      if (response.asset.type === 0) {
        this.pageDetails.showLogo = true
      }
    },

    async getHolding(): Promise<void> {
      const response = await fetch('/api/holding-read', {
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
      this.assetType = response.asset_type
      this.holdingQuantity = response.current_quantity
    },

    async createTransaction(): Promise<void> {
      this.disabledSave = true
      if (this.validateForm()) {
        const response = await fetch('/api/transaction-create', {
          headers: {
            authorization: this.token
          },
          method: 'POST',
          body: JSON.stringify({
            token: this.token,
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
